import {
  dateTimeFormat,
  extract,
  getFormattingOpts,
  getFullFormattingOpts,
  numberFormat,
  NumberFormatOpts,
  parseFormat
} from "../util/formatUtil";
import { padStart } from "../util/string";
import { isMacroToken, MacroToken, macroTokens } from "./macroTokens";
import { getCalendarValue } from "../dateTime";
import { ordinalInstance } from "../calendars/ordinal";
import { gregorianInstance } from "../calendars/gregorian";
import { isoWeekCalendarInstance } from "../calendars/isoWeek";
import { formatWeekday } from "./weekdays";
import { formatMeridiem } from "./meridiems";
import { formatMonth } from "./months";
import { formatEra } from "./eras";
import { formatOffset } from "./namedOffset";
import {
  Calendar,
  DateTime,
  EraFormatOpts, FormatFirstArg,
  DateTimeFormatOpts, FormatSecondArg,
  FormatToken,
  MeridiemFormatOpts,
  MonthFormatOpts,
  OffsetFormatWidth, TimeUnit, DateTimeTokenFormatOpts,
  WeekdayFormatOpts,
  Duration,
  DurationUnit,
  DurationTokenFormatOpts
} from "../../types";
import { roundTo } from "../util/numeric";

// todo - dependencies
import { durShiftTo } from "../../duration/convert";

type ExtendedNumberFormatOpts = NumberFormatOpts & {
  floor?: boolean,
  forceSimple?: boolean
  last?: number
}

const stringifyTokens = (tokens: FormatToken[], tokenToString: (f: FormatToken) => string) => {
  let s = "";
  for (const token of tokens) {
    if (token.literal) {
      s += token.name;
    } else {
      s += tokenToString(token);
    }
  }
  return s;
};

export const durationToFormat = (dur: Duration, format: string, locale?: FormatFirstArg<DurationTokenFormatOpts>, opts?: FormatSecondArg<DurationTokenFormatOpts>): string => {
  const formatOpts = getFullFormattingOpts<DurationTokenFormatOpts>(locale, opts, {conversionAccuracy: "casual", floor: true }, {useGrouping: false});
  const tokens = parseFormat(format);
  const fields = tokens.map(durationTokenToField).filter(n => n) as DurationUnit[];
  const shifted = durShiftTo(dur, fields, formatOpts.conversionAccuracy);
  return stringifyTokens(tokens, token => durationTokenToString(shifted, token, formatOpts));
}

export const dateTimeToFormat = (dt: DateTime, format: string, locale?: FormatFirstArg<DateTimeTokenFormatOpts>, opts?: FormatSecondArg<DateTimeTokenFormatOpts>): string => {
  const formatOpts = getFullFormattingOpts<DateTimeTokenFormatOpts>(locale, opts, { allowZ: false, forceSimple: false, calendar: undefined });
  const tokens = parseFormat(format);
  return stringifyTokens(tokens, token => dateTimeTokenToString(dt, token, formatOpts));
}

const maybeMacro = (dt: DateTime, token: FormatToken, formatOpts: DateTimeTokenFormatOpts): string => {
  if (isMacroToken(token.name)) {
    const tokenFormatOpts = macroTokens[token.name];
    return dateTimeFormat({ ...formatOpts, ...tokenFormatOpts }, dt.zone).format(dt.native());
  }
  return token.name;
};

const formatNumber = (n: number, opts: ExtendedNumberFormatOpts): string => {
  if (opts.floor) {
    n = roundTo(n, 0, true);
  } 

  if (opts.last) {
    n = parseInt(n.toString().slice(-opts.last));
  }

  return opts.forceSimple ? padStart(n, opts.minimumIntegerDigits || 1) : numberFormat(opts).format(n);
}

const durationTokenToField = (token: FormatToken): DurationUnit | null => {
  if (token.literal) {
    return null;
  }
  switch (token.name[0]) {
    case "S":
      return "milliseconds";
    case "s":
      return "seconds";
    case "m":
      return "minutes";
    case "h":
      return "hours";
    case "d":
      return "days";
    case "M":
      return "months";
    case "y":
      return "years";
    default:
      return null;
  }
}

const durationTokenToString = (dt: Duration, token: FormatToken, opts: DurationTokenFormatOpts): string => {
  if (token.literal) {
    return token.name;
  }

  let field: DurationUnit | null = durationTokenToField(token);
  return field ? formatNumber(dt._values[field] || 0, { ...opts, minimumIntegerDigits: token.name.length} ) : token.name;
}

const dateTimeTokenToString = (dt: DateTime, token: FormatToken, formatOpts: DateTimeTokenFormatOpts): string => {

  const numberOpts: ExtendedNumberFormatOpts = { locale: formatOpts.locale, numberingSystem: formatOpts.numberingSystem, forceSimple: formatOpts.forceSimple, useGrouping: false };

  // todo - these closures can all be created in a partial and then have dt applied to the lot of them. Does that affect performance in practice or only in theory?
  // todo - benchmark to find out
  const formatField = <T extends DateTimeFormatOpts>(formatter: ((dt: DateTime, opts: T)  => string), opts: T): string =>
    formatter(dt, {...formatOpts, ...opts});

  const num = (n: number, opts: ExtendedNumberFormatOpts = numberOpts) => formatNumber(n, opts);

  const fWeekday = (opt: WeekdayFormatOpts) => formatField(formatWeekday, opt);
  const fMonth = (opt: MonthFormatOpts) => formatField(formatMonth, opt);
  const fEra = (opt: EraFormatOpts) => formatField(formatEra, opt);

  const fOffset = (width: OffsetFormatWidth): string =>
    formatOpts.allowZ && dt.zone.isUniversal && dt.offset == 0 ? "Z" : formatOffset(dt, {...formatOpts, width });

  const useDateTimeFormatter = formatOpts.calendar && formatOpts.calendar !== "gregory";
  const string = (opts: Intl.DateTimeFormatOptions, field: string) => {
    const dtf = dateTimeFormat({...formatOpts, ...opts}, dt.zone);
    return extract(dt.native(), dtf, field);
  }

  const pad = (p: number): ExtendedNumberFormatOpts => ({...numberOpts, minimumIntegerDigits: p});

  const t = (field: TimeUnit): number => dt.time[field];

  const withCal = (cal: Calendar<any>): (field: string) => number =>
    (field) => getCalendarValue(dt, cal)[field];

  const g = withCal(gregorianInstance);
  const iso = withCal(isoWeekCalendarInstance);
  const ordinal = () => withCal(ordinalInstance)("ordinal");
  const quarter = () => Math.ceil(g("month") / 3)

    // Where possible: http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles
  switch (token.name) {
    // ms
    case "S":
      return num(t("millisecond"));
    case "u":
    // falls through
    case "SSS":
      return num(t("millisecond"), pad(3));
    // seconds
    case "s":
      return num(t("second"));
    case "ss":
      return num(t("second"), pad(2));
    // fractional seconds
    case "uu":
      return num(Math.floor(t("millisecond") / 10), pad(2));
    case "uuu":
      return num(Math.floor(t("millisecond") / 100));
    // minutes
    case "m":
      return num(t("minute"));
    case "mm":
      return num(t("minute"), pad(2));
    // hours
    case "h":
      return num(t("hour") % 12 === 0 ? 12 : t("hour") % 12);
    case "hh":
      return num(t("hour") % 12 === 0 ? 12 : t("hour") % 12, pad(2));
    case "H":
      return num(t("hour"));
    case "HH":
      return num(t("hour"), pad(2));
    // offset
    case "Z":
      // like +6
      return fOffset("narrow");
    case "ZZ":
      // like +06:00
      return fOffset("standard");
    case "ZZZ":
      // like +0600
      return fOffset("techie");
    case "ZZZZ":
      // like EST
      return fOffset("short");
    case "ZZZZZ":
      // like Eastern Standard Time
      return fOffset("long");
    // zone
    case "z":
      // like America/New_York
      return dt.zone.name;
    // meridiems
    case "a":
      return formatField<MeridiemFormatOpts>(formatMeridiem, { width: "simple"});
    // dates
    case "d":
      return useDateTimeFormatter ?  string({ day: "numeric" }, "day") : num(g("day"));
    case "dd":
      return useDateTimeFormatter ? string({ day: "2-digit" }, "day") : num(g("day"), pad(2));
    // weekdays - standalone
    case "c":
    case "E":
      // like 1
      return num(iso("weekday"), numberOpts);
    case "ccc":
      // like 'Tues'
      return fWeekday({ width: "short", mode: "standalone" });
    case "cccc":
      // like 'Tuesday'
      return fWeekday({ width: "long", mode: "standalone" });
    case "ccccc":
      // like 'T'
      return fWeekday({ width: "narrow", mode: "standalone" });
    // weekdays - format
    case "EEE":
      // like 'Tues'
      return fWeekday({ width: "short", mode: "format" });
    case "EEEE":
      // like 'Tuesday'
      return fWeekday({ width: "long", mode: "format" });
    case "EEEEE":
      // like 'T'
      return fWeekday({ width: "narrow", mode: "format" });
    // months - standalone
    case "L":
    case "M":
      // like 1
      return useDateTimeFormatter
        ? string({ month: "numeric", day: "numeric" }, "month")
        : num(g("month"));
    case "LL":
    case "MM":
      // like 01, doesn't seem to work
      return useDateTimeFormatter
        ? string({ month: "2-digit", day: "numeric" }, "month")
        : num(g("month"), pad(2));
    case "LLL":
      // like Jan
      return fMonth({ width: "short", mode: "standalone"});
    case "LLLL":
      // like January
      return fMonth({ width: "long", mode: "standalone"});
    case "LLLLL":
      // like J
      return fMonth({ width: "narrow", mode: "standalone"});
    // months - format
    case "MMM":
      // like Jan
      return fMonth({ width: "short", mode: "format" });
    case "MMMM":
      // like January
      return fMonth({ width: "long", mode: "format" });
    case "MMMMM":
      // like J
      return fMonth({ width: "narrow", mode: "format" });
    // years
    case "y":
      // like 2014
      return useDateTimeFormatter ? string({ year: "numeric" }, "year") : num(g("year"));
    case "yy":
      // like 14
      return useDateTimeFormatter
        ? string({ year: "2-digit" }, "year")
        : num(g("year") % 100, {...pad(2), last: 2 });
    case "yyyy":
      // like 0012
      return useDateTimeFormatter
        ? string({ year: "numeric" }, "year")
        : num(g("year"), pad(4));
    case "yyyyyy":
      // like 000012
      return useDateTimeFormatter
        ? string({ year: "numeric" }, "year")
        : num(g("year"), pad(6));
    // eras
    case "G":
      // like AD
      return fEra({ width: "short"});
    case "GG":
      // like Anno Domini
      return fEra({ width: "long"});
    case "GGGGG":
      return fEra({ width: "narrow"});
    case "kk":
      return num(parseInt(iso("weekYear").toString().slice(-2)), pad(2));
    case "kkkk":
      return num(iso("weekYear"), pad(4));
    case "W":
      return num(iso("weekNumber"));
    case "WW":
      return num(iso("weekNumber"), pad(2));
    case "o":
      return num(ordinal());
    case "ooo":
      return num(ordinal(), pad(3));
    case "q":
      // like 1
      return num(quarter());
    case "qq":
      // like 01
      return num(quarter(), pad(2));
    case "X":
      return num(Math.floor(dt.ts / 1000));
    case "x":
      return num(dt.ts);
    default:
      return maybeMacro(dt, token, formatOpts);
    }
  }
