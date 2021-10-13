import {
  untruncateYear,
  signedOffset,
  parseInteger,
  parseMillis,
  ianaRegex,
  isUndefined, isNumber
} from "../impl/util.js";

import {
  AnyDateTimeUnit,
  AnyParsableUnit,
  GregorianUnit,
  MixedDateTimeUnitBundle,
  MixedParsableUnitBundle, TimeUnit
} from "./units";
import { englishMonthsShort, englishWeekdaysLong, englishWeekdaysShort } from "../impl/english";
import Zone from "./zone";
import { fixedOffsetZone, utcInstance } from "./zones/fixedOffsetZone";
import { createIANAZone } from "./zones/IANAZone";
import { Calendar } from "./calendar";
import { GregorianCalendar, gregorianInstance } from "./calendars/gregorian";

/*
 * This file handles parsing for well-specified formats. Here's how it works:
 * Two things go into parsing: a regex to match with and an extractor to take apart the groups in the match.
 * An extractor is just a function that takes a regex match array and returns a { year: ..., month: ... } object
 * parse() does the work of executing the regex and applying the extractor. It takes multiple regex/extractor pairs to try in sequence.
 * Extractors can take a "cursor" representing the offset in the match to look at. This makes it easy to combine extractors.
 * combineExtractors() does the work of combining them, keeping track of the cursor through multiple extractions.
 * Some extractions are super dumb and simpleParse and fromStrings help DRY them.
 */

type Extractor = (match: RegExpMatchArray, cursor: Cursor) => ExtractedResult;
type Cursor = number;
type ExtractedResult = [MixedParsableUnitBundle | null, Zone | null, Cursor]

type Extractor2 = (match: RegExpMatchArray, cursor: Cursor) => ExtractedResult2;

interface ExtractedResult2 {
  calendar: Calendar<any> | null;
  calendarUnits: object;
  timeUnits: object;
  zone: Zone | null
  cursor: Cursor;
}

interface ParsingBlock {
  regex: RegExp,
  extractor: Extractor2
}

const combineRegexes = (...regexes: RegExp[]): RegExp => {
  const full = regexes.reduce((f, r) => f + r.source, "");
  return RegExp(`^${full}$`);
};

const combineExtractors = (...extractors: Extractor[]) : Extractor => {
  return (m, cursor) =>
    extractors.reduce<ExtractedResult>(([mergedVals, mergedZone, cursor], ex) => {
      const [val, zone, next] = ex(m, cursor);
      return [{ ...mergedVals, ...val }, mergedZone || zone, next];
    }, [{}, null, 1]);
};

const combineExtractors2 = (...extractors: Extractor2[]) : Extractor2 => {
  return (m, cursor) =>
    extractors.reduce<ExtractedResult2>((merged, ex) => {
      const next = ex(m, cursor);
      return {
        calendar: next.calendar || merged.calendar,
        calendarUnits: { ...merged.calendarUnits, ...next.calendarUnits},
        timeUnits: {...merged.timeUnits, ...next.timeUnits},
        zone: next.zone || merged.zone,
        cursor: next.cursor
      };
    }, {
      calendar: null,
      calendarUnits: {},
      timeUnits: {},
      zone: null,
      cursor: 1
    });
};

const parse2 = (s: string, ...patterns: ParsingBlock[]): ExtractedResult2 | null => {
  if (s == null) {
    return null;
  }

  for (const {regex, extractor } of patterns) {
    const m = regex.exec(s);
    let i = 0;

    if (m) {
      return extractor(m, 0);
    }
  }

  return null;
}

const parse = <TCal>(s: string, ...patterns: [RegExp, Extractor][]): ExtractedResult => {
  if (s == null) {
    return [null, null, 0];
  }

  for (const [regex, extractor] of patterns) {
    const m = regex.exec(s);
    if (m) {
      return extractor(m, 0);
    }
  }

  return [null, null, 0];
}

const simpleParse = (...keys: Array<AnyParsableUnit>): Extractor => {
  return (match, cursor) => {
    const ret: MixedParsableUnitBundle = {};
    let i;

    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = parseInteger(match[cursor + i]);
    }
    return [ret, null, cursor + i];
  };
}

const simpleParse2 = (cal: Calendar<any>, ...keys: Array<string>): Extractor2 => {
  return (match, cursor) => {
    const ret: any = {};
    let i;

    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = parseInteger(match[cursor + i]);
    }
    return {
      calendar: cal,
      calendarUnits: ret,
      timeUnits: {},
      cursor: i + 1,
      zone: null
    };
  };
}

// ISO and SQL parsing
const offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/,
  isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/,
  isoTimeRegex = RegExp(`${isoTimeBaseRegex.source}${offsetRegex.source}?`),
  isoTimeExtensionRegex = RegExp(`(?:T${isoTimeRegex.source})?`),
  isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/,
  isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/,
  isoOrdinalRegex = /(\d{4})-?(\d{3})/,
  extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekday"),
  extractISOOrdinalData = simpleParse("year", "ordinal"),
  sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/, // dumbed-down version of the ISO one
  sqlTimeRegex = RegExp(
    `${isoTimeBaseRegex.source} ?(?:${offsetRegex.source}|(${ianaRegex.source}))?`
  ),
  sqlTimeExtensionRegex = RegExp(`(?: ${sqlTimeRegex.source})?`);

const int = (match: RegExpMatchArray, pos: number, fallback: number): number => {
  const m = match[pos];
  if (isUndefined(m)) return fallback;
  const parsed = parseInteger(m);
  return isNumber(parsed) ? parsed : fallback;
};

const extractISOYmd = (match: RegExpMatchArray, cursor: number): ExtractedResult  => {
  const item = {
    year: int(match, cursor, 1),
    month: int(match, cursor + 1, 1),
    day: int(match, cursor + 2, 1),
  };

  return [item, null, cursor + 3];
};

const extractISOYmd2 = (match: RegExpMatchArray, cursor: number): ExtractedResult2  => {
  const item = {
    year: int(match, cursor, 1),
    month: int(match, cursor + 1, 1),
    day: int(match, cursor + 2, 1),
  };

  return {
    calendar: gregorianInstance,
    calendarUnits: item,
    timeUnits: {},
    zone: null,
    cursor: cursor + 3
  }
};

const extractISOTime = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const item = {
    hour: int(match, cursor, 0),
    minute: int(match, cursor + 1, 0),
    second: int(match, cursor + 2, 0),
    millisecond: parseMillis(match[cursor + 3]),
  };

  return [item, null, cursor + 4];
};

const extractISOTime2 = (match: RegExpMatchArray, cursor: number): ExtractedResult2 => {
  const item = {
    hour: int(match, cursor, 0),
    minute: int(match, cursor + 1, 0),
    second: int(match, cursor + 2, 0),
    millisecond: parseMillis(match[cursor + 3]),
  };

  return {
    calendar: null,
    calendarUnits: {},
    timeUnits: item,
    zone: null,
    cursor: cursor + 4
  }
};

const extractISOOffset = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const local = !match[cursor] && !match[cursor + 1],
    fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]),
    zone = local ? null : fixedOffsetZone(fullOffset);
  return [{}, zone, cursor + 3];
};

const extractIANAZone = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const zone = match[cursor] ? createIANAZone(match[cursor]) : null;
  return [{}, zone, cursor + 1];
};

// ISO time parsing

const isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);

// ISO duration parsing

const isoDuration =
  /^-?P(?:(?:(-?\d{1,9})Y)?(?:(-?\d{1,9})M)?(?:(-?\d{1,9})W)?(?:(-?\d{1,9})D)?(?:T(?:(-?\d{1,9})H)?(?:(-?\d{1,9})M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,9}))?S)?)?)$/;

function extractISODuration(match: RegExpMatchArray): ExtractedResult {
  const [s, yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] =
    match;

  const hasNegativePrefix = s[0] === "-";
  const negativeSeconds = !!(secondStr && secondStr[0] === "-");

  const maybeNegate = (num: number | undefined, force = false) =>
    num !== undefined && (force || (num && hasNegativePrefix)) ? -num : num;

  return [{
      years: maybeNegate(parseInteger(yearStr)),
      months: maybeNegate(parseInteger(monthStr)),
      weeks: maybeNegate(parseInteger(weekStr)),
      days: maybeNegate(parseInteger(dayStr)),
      hours: maybeNegate(parseInteger(hourStr)),
      minutes: maybeNegate(parseInteger(minuteStr)),
      seconds: maybeNegate(parseInteger(secondStr), secondStr === "-0"),
      milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds)
    }, null, 0];
}

// These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
// and not just that we're in -240 *right now*. But since I don't think these are used that often
// I'm just going to ignore that
const obsOffsets: {[key: string]: number} = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60,
};

const fromStrings = (weekdayStr: string, yearStr: string, monthStr: string, dayStr: string, hourStr: string, minuteStr: string, secondStr: string): MixedDateTimeUnitBundle => {
  const result: MixedDateTimeUnitBundle = {
    year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
    month: englishMonthsShort.indexOf(monthStr) + 1,
    day: parseInteger(dayStr),
    hour: parseInteger(hourStr),
    minute: parseInteger(minuteStr),
  };

  if (secondStr) result.second = parseInteger(secondStr);
  if (weekdayStr) {
    result.weekday =
      weekdayStr.length > 3
        ? englishWeekdaysLong.indexOf(weekdayStr) + 1
        : englishWeekdaysShort.indexOf(weekdayStr) + 1;
  }

  return result;
};

// RFC 2822/5322
const rfc2822 =
  /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;

function extractRFC2822(match: RegExpMatchArray, cursor: Number): ExtractedResult {
  const [
      ,
      weekdayStr,
      dayStr,
      monthStr,
      yearStr,
      hourStr,
      minuteStr,
      secondStr,
      obsOffset,
      milOffset,
      offHourStr,
      offMinuteStr,
    ] = match,
    result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);

  let offset: number;
  if (obsOffset) {
    offset = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset = 0;
  } else {
    offset = signedOffset(offHourStr, offMinuteStr);
  }

  // ignores cursor
  return [result, fixedOffsetZone(offset), 0];
}

// Remove comments and folding whitespace and replace multiple-spaces with a single space
const preprocessRFC2822 = (s: string): string =>
  s
    .replace(/\([^)]*\)|[\n\t]/g, " ")
    .replace(/(\s\s+)/g, " ")
    .trim();

// http date

const rfc1123 =
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,
  rfc850 =
    /^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,
  ascii =
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

const extractRFC1123Or850 = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match,
    result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, utcInstance, cursor + 7];
};

const extractASCII = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match,
    result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, utcInstance, cursor + 7];
};

const isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
const isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
const isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
const isoTimeCombinedRegex = combineRegexes(isoTimeRegex);

const extractISOYmdTimeAndOffset = combineExtractors(
  extractISOYmd,
  extractISOTime,
  extractISOOffset
);
const extractISOWeekTimeAndOffset = combineExtractors(
  extractISOWeekData,
  extractISOTime,
  extractISOOffset
);
const extractISOOrdinalDateAndTime = combineExtractors(
  extractISOOrdinalData,
  extractISOTime,
  extractISOOffset
);
const extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset);

/**
 * @private
 */

export function parseISODate(s: string) {
  return parse(
    s,
    [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset],
    [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset],
    [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime],
    [isoTimeCombinedRegex, extractISOTimeAndOffset]
  );
}

export function parseRFC2822Date(s: string) {
  return parse(preprocessRFC2822(s), [rfc2822, extractRFC2822]);
}

export function parseHTTPDate(s: string) {
  return parse(
    s,
    [rfc1123, extractRFC1123Or850],
    [rfc850, extractRFC1123Or850],
    [ascii, extractASCII]
  );
}

export function parseISODuration(s: string) {
  return parse(s, [isoDuration, extractISODuration]);
}

const extractISOTimeOnly = combineExtractors(extractISOTime);

export function parseISOTimeOnly(s: string) {
  return parse(s, [isoTimeOnly, extractISOTimeOnly]);
}

const sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
const sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);

const extractISOYmdTimeOffsetAndIANAZone = combineExtractors(
  extractISOYmd,
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
const extractISOTimeOffsetAndIANAZone = combineExtractors(
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
