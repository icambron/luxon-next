import { isUndefined, parseMillis, signedOffset, untruncateYear } from "../lib/util";
import FixedOffsetZone from "../model/zones/fixedOffsetZone";
import IANAZone from "../model/zones/IANAZone";
import { listMonths } from "../formatting/months";
import { listEras } from "../formatting/eras";
import { listWeekdays } from "../formatting/weekdays";
import { GregorianDate } from "../model/calendars/gregorian";
import { ISOWeekDate } from "../model/calendars/isoWeek";
import { listMeridiems } from "../formatting/meridiems";
import { FormattingToken, TokenParsingOpts } from "../scatteredTypes/formatting";
import { ConflictingSpecificationError } from "../model/errors";
import { dateTimeFormatter, parseFormat } from "../formatting/formatUtils";
import { Time } from "../model/time";
import Zone from "../model/zone";
import { memo } from "../caching";
import { MacroToken, macroTokens } from "../formatPresets";
import { digitRegex, parseDigits } from "../lib/digits";

// TYPES
interface TokenParsingUnit {
  regex: RegExp;
  deser: (input: Array<string>) => any;
  groups?: number;
  literal?: boolean;
  token?: Field;
}

export interface TokenParsedValue {
  gregorian: Partial<GregorianDate>;
  week: Partial<ISOWeekDate>;
  time: Partial<Time>
  ordinal?: number;
  zone?: Zone;
}

export type Field = "G" | "y" | "M" | "L" | "d" | "o" | "H" | "h" | "m" | "q" | "s" | "S" | "u" | "a" | "k" | "W" | "E" | "c" | "Z" | "z";

export type TokenParsedFieldsFull = {
  [key in Field]: any
}

export type TokenParsedFields = Partial<TokenParsedFieldsFull>;

export interface TokenParsingSummary {
  input: string,
  format: string,
  tokens: FormattingToken[],
  units: TokenParsingUnit[],
  regex: RegExp,
  matches: RegExpMatchArray | null,
  fields: TokenParsedFields | null,
  parsed: TokenParsedValue | null
}

// CONSTANTS

const NBSP = String.fromCharCode(160);
const spaceOrNBSP = `( |${NBSP})`;
const spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");

// UTILITIES

// make dots optional and also make them literal
// make space and non breakable space characters interchangeable
const fixListRegex = (s:string) => s.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);

const stripInsensitivities = (s: string): string => s
  .replace(/\./g, "") // ignore dots that were made optional
  .replace(spaceOrNBSPRegExp, " ") // interchange space and nbsp
  .toLowerCase();

const escapeToken = (value: string): string => value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");

// PARSERS
const intUnit = (regex: RegExp, post: ((i: number) => number) = (i: number) => i): TokenParsingUnit => ({
  regex,
  deser: ([s]) => post(parseDigits(s))
})

const oneOf = (strings: Array<string>, startIndex: number): TokenParsingUnit => ({
  regex: RegExp(strings.map(fixListRegex).join("|")),
  deser: ([s]) =>
    strings.findIndex((i) => stripInsensitivities(s) === stripInsensitivities(i)) + startIndex
});

const offset = (regex: RegExp, groups: number): TokenParsingUnit => ({
  regex,
  deser: ([, h, m]) => signedOffset(h, m),
  groups
});

const literal = (t: FormattingToken): TokenParsingUnit => ({ regex: RegExp(escapeToken(t.name)), deser: ([s]) => s, literal: true });

const simple = (regex: RegExp): TokenParsingUnit => ({ regex, deser: ([s]) => s });

const getUnitMap = (parsingOpts: TokenParsingOpts): (token: FormattingToken) => TokenParsingUnit => {
  const one = digitRegex(parsingOpts.numberingSystem);
  const two = digitRegex(parsingOpts.numberingSystem, "{2}");
  const three = digitRegex(parsingOpts.numberingSystem, "{3}");
  const four = digitRegex(parsingOpts.numberingSystem, "{4}");
  const six = digitRegex(parsingOpts.numberingSystem, "{6}");
  const oneOrTwo = digitRegex(parsingOpts.numberingSystem, "{1,2}");
  const oneToThree = digitRegex(parsingOpts.numberingSystem, "{1,3}");
  const oneToSix = digitRegex(parsingOpts.numberingSystem, "{1,6}");
  const oneToNine = digitRegex(parsingOpts.numberingSystem, "{1,9}");
  const twoToFour = digitRegex(parsingOpts.numberingSystem, "{2,4}");
  const fourToSix = digitRegex(parsingOpts.numberingSystem, "{4,6}");

  const unitate = (t: FormattingToken): TokenParsingUnit => {
    if (t.literal) {
      return literal(t);
    }
    switch (t.name) {
      // era
      case "G":
        return oneOf(listEras({...parsingOpts, width: "short"}), 0);
      case "GG":
        return oneOf(listEras({...parsingOpts, width: "long"}), 0);
      // years
      case "y":
        return intUnit(oneToSix);
      case "yy":
        return intUnit(twoToFour, untruncateYear);
      case "yyyy":
        return intUnit(four);
      case "yyyyy":
        return intUnit(fourToSix);
      case "yyyyyy":
        return intUnit(six);
      // months
      case "M":
        return intUnit(oneOrTwo);
      case "MM":
        return intUnit(two);
      case "MMM":
        return oneOf(listMonths({...parsingOpts,  width: "short", mode: "format" }), 1);
      case "MMMM":
        return oneOf(listMonths({...parsingOpts, width: "long", mode: "format"}), 1);
      case "L":
        return intUnit(oneOrTwo);
      case "LL":
        return intUnit(two);
      case "LLL":
        return oneOf(listMonths({...parsingOpts, width: "short", mode: "standalone" }), 1);
      case "LLLL":
        return oneOf(listMonths({...parsingOpts, width: "long", mode: "standalone" }), 1);
      // dates
      case "d":
        return intUnit(oneOrTwo);
      case "dd":
        return intUnit(two);
      // ordinals
      case "o":
        return intUnit(oneToThree);
      case "ooo":
        return intUnit(three);
      // time
      case "HH":
        return intUnit(two);
      case "H":
        return intUnit(oneOrTwo);
      case "hh":
        return intUnit(two);
      case "h":
        return intUnit(oneOrTwo);
      case "mm":
        return intUnit(two);
      case "m":
        return intUnit(oneOrTwo);
      case "q":
        return intUnit(oneOrTwo);
      case "qq":
        return intUnit(two);
      case "s":
        return intUnit(oneOrTwo);
      case "ss":
        return intUnit(two);
      case "S":
        return intUnit(oneToThree);
      case "SSS":
        return intUnit(three);
      case "u":
        return simple(oneToNine);
      case "uu":
        return simple(oneOrTwo);
      case "uuu":
        return intUnit(one);
      // meridiem
      case "a":
        return oneOf(listMeridiems(parsingOpts), 0);
      // weekYear (k)
      case "kkkk":
        return intUnit(four);
      case "kk":
        return intUnit(twoToFour, untruncateYear);
      // weekNumber (W)
      case "W":
        return intUnit(oneOrTwo);
      case "WW":
        return intUnit(two);
      // weekdays
      case "E":
      case "c":
        return intUnit(one);
      case "EEE":
        return oneOf(listWeekdays({...parsingOpts, width: "short", mode: "standalone" }), 1);
      case "EEEE":
        return oneOf(listWeekdays({...parsingOpts, width: "long", mode: "standalone" }), 1);
      case "ccc":
        return oneOf(listWeekdays({...parsingOpts, width: "short", mode: "format" }), 1);
      case "cccc":
        return oneOf(listWeekdays({...parsingOpts, width: "long", mode: "format" }), 1);
      // offset/zone
      case "Z":
      case "ZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);
      case "ZZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);
      // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
      // because we don't have any way to figure out what they are
      case "z":
        return simple(/[a-z_+-/]{1,256}?/i);
      default:
        return literal(t);
    }
  };

  return (token) => {
    const unit = unitate(token);
    unit.token = token.name.charAt(0) as Field;
    return unit;
  }
}

type Style = "2-digit" | "numeric" | "short" | "long" | "narrow" | "*";
type StyleToToken = Partial<Record<Style, string>>;
type PartToStyle = Partial<Record<Intl.DateTimeFormatPartTypes, StyleToToken>>;

const partTypeStyleToTokenVal: PartToStyle = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy",
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM",
  },
  day: {
    numeric: "d",
    "2-digit": "dd",
  },
  weekday: {
    short: "EEE",
    long: "EEEE",
  },
  dayPeriod: {
    "*": "a"
  },
  hour: {
    numeric: "h",
    "2-digit": "hh",
  },
  minute: {
    numeric: "m",
    "2-digit": "mm",
  },
  second: {
    numeric: "s",
    "2-digit": "ss",
  },
};

function tokenForPart(part: Intl.DateTimeFormatPart, formatOps: Intl.DateTimeFormatOptions) {
  const { type, value } = part;

  if (type === "literal") return { literal: true, val: value };

  let val = partTypeStyleToTokenVal[type];
  if (!isUndefined(val)) {

    const style: Style = formatOps[type] || "*";
    const specific = val[style] || val["*"];

    if (specific) {
      return { literal: false, val };
    }
  }

  return undefined;
}

function buildRegex(units: TokenParsingUnit[]): RegExp {
  const re = units.map((u) => u.regex).reduce((f, r) => `${f}(${r.source})`, "");
  return RegExp(`^${re}$`, "i");
}

const deserialize = (matches: RegExpMatchArray, handlers: TokenParsingUnit[]): TokenParsedFields => {
  const fields: TokenParsedFields = {};

  let matchIndex = 1;
  for (const h of handlers) {
    const groups = h.groups ? h.groups + 1 : 1;
    if (!h.literal && h.token) {
      fields[h.token] = h.deser(matches.slice(matchIndex, matchIndex + groups));
    }
    matchIndex += groups;
    }

  return fields;
};

const zoneForMatch = (fields: TokenParsedFields): Zone | undefined  => {
  if (!isUndefined(fields.Z)) {
    return new FixedOffsetZone(fields.Z);
  } else if (!isUndefined(fields.z)) {
    return new IANAZone(fields.z);
  } else {
    return undefined;
  }
}

const valsForFields = (fields: TokenParsedFields): TokenParsedValue => {
  const parsed: TokenParsedValue = {
    gregorian: {},
    week: {},
    time: {}
  }

  parsed.zone = zoneForMatch(fields);

  // gregorian
  parsed.gregorian.year = fields.G === 0 && fields.y ? -fields.y : fields.y;

  if (!isUndefined(fields.M) || !isUndefined(fields.L)) {
    parsed.gregorian.month = fields.M || fields.L;
  } else if (!isUndefined(fields.q)) {
    parsed.gregorian.month = (fields.q - 1) * 3 + 1;
  }

  parsed.gregorian.day = fields.d;

  // iso week
  parsed.week.weekYear = fields.k;
  parsed.week.weekNumber = fields.W;
  parsed.week.weekday = fields.E || fields.c;

  // ordinal
  parsed.ordinal = fields.o;

  // time
  if (fields.a && fields.H) {
    throw new ConflictingSpecificationError("Can't include meridiem when specifying 24-hour format");
  }

  if (!isUndefined(fields.h)) {
    if (fields.h < 12 && fields.a === 1) {
      parsed.time.hour = fields.h + 12;
    } else if (fields.h === 12 && fields.a === 0) {
      parsed.time.hour = 0;
    } else {
      parsed.time.hour = fields.h;
    }
  } else {
    parsed.time.hour = fields.H
  }

  parsed.time.minute = fields.m;
  parsed.time.second = fields.s;

  if (!isUndefined(fields.u)) {
    parsed.time.millisecond = parseMillis(fields.u);
  } else {
    parsed.time.millisecond = fields.S
  }

  return parsed;
}

let dummyDateTimeCache: Date | null = null;
const getDummyDateTime = (): Date => {
  if (!dummyDateTimeCache) {
    dummyDateTimeCache = new Date( 1555555555555);
  }
  return dummyDateTimeCache;
};

const maybeExpandMacroToken = (token: FormattingToken, parsingOpts: TokenParsingOpts) => {
  if (token.literal) {
    return token;
  }

  const formatOpts = macroTokens[token.name as MacroToken];
  if (!formatOpts) {
    // not actually a macro token
    return token;
  }

  const formatter = dateTimeFormatter(parsingOpts.locale, undefined, formatOpts);

  const parts = formatter.formatToParts(getDummyDateTime());

  const tokens = parts.map((p) => tokenForPart(p, formatOpts));

  if (tokens.includes(undefined)) {
    return token;
  }

  return tokens;
};

const expandMacroTokens = (tokens: FormattingToken[], parsingOpts: TokenParsingOpts) : FormattingToken[] =>
  Array.prototype.concat(...tokens.map((t) => maybeExpandMacroToken(t, parsingOpts)));

/**
 * @private
 */
export const parseFromFormat = (input: string, format: string, parsingOpts: TokenParsingOpts): TokenParsingSummary => {

  // prelude: we memoize the whole parser
  const buildParser = memo("tokenParser", ([parsingOpts, format]: [TokenParsingOpts, string]): [TokenParsingUnit[], RegExp, FormattingToken[]] => {
    // step 1 - parse the format to string to generate a FormatToken[]
    const rawTokens = parseFormat(format);

    // step 2 - expand macro tokens
    const expandedTokens = expandMacroTokens(rawTokens, parsingOpts);

    // step 3 - map the tokens to parsing units (essentially regex + how to extract the value from the match) pairs
    // this has two sub-steps:
    // a) get a map appropriate to the locale. This is a function FormatToken -> TokenParsingUnit
    const tokenMap = getUnitMap(parsingOpts);

    // b) map all the tokens we actually have to units using that mapping. This is a TokenParsingUnit[]
    const units = expandedTokens.map(tokenMap);

    // step 4 - combine the regexes into one big regex
    const regex = buildRegex(units);

    return [units, regex, rawTokens];
  })

  // intermezzo: get the possibly-already-memoized parser
  const [units, regex, rawTokens] = buildParser([parsingOpts, format]);

  // step 5 - run the regex on the input
  const matches = input.match(regex);

  let fields: TokenParsedFields | null = null;
  let parsed: TokenParsedValue | null = null;
  if (matches) {
    // step 6 - use the units to deserialize the matches and put them into a bucket of values
    // these fields are "dumb"; they don't understand anything about dates or times
    // This is a TokenParsedFields
    fields = deserialize(matches, units);

    // step 7 - build a TokenParsedValue -- a semantic date with overlapping and potentially contradictory
    // date/time facts. We will have to choose among these facts to build a date time, but that's the caller's problem
    parsed = valsForFields(fields);
  }

  // step 8 - just return all the stuff we've accumulated, which helps with debugging
  return { input, format, tokens: rawTokens, regex, matches, fields, parsed, units};
};
