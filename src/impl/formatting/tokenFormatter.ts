import { formatEra, formatMeridiem, formatMonth, formatOffset, formatWeekday } from "../../dateTime/format";
import {
  dateTimeFormat,
  extract,
  getFormattingOpts,
  numberFormat,
  NumberFormatOpts,
  parseFormat
} from "../util/formatUtil";
import { padStart } from "../util/string";
import {
  Calendar,
  DateTime,
  EraFormatOpts, FormatFirstArg,
  FormatOpts, FormatSecondArg,
  FormatToken,
  MeridiemFormatOpts,
  MonthFormatOpts,
  OffsetFormatWidth, TimeUnit, TokenFormatOpts,
  WeekdayFormatOpts
} from "../../types";
import { MacroToken, macroTokens } from "./presets";
import { getCalendarValue } from "../dateTime";
import { ordinalInstance } from "../calendars/ordinal";
import { gregorianInstance } from "../calendars/gregorian";
import { isoWeekCalendarInstance } from "../calendars/isoWeek";

interface ExtendedNumberFormatOpts extends NumberFormatOpts {
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

export const toFormat = (dt: DateTime, format: string, firstArg?: FormatFirstArg<TokenFormatOpts>, secondArg?: FormatSecondArg<TokenFormatOpts>): string => {
  const formatOpts = getFormattingOpts<TokenFormatOpts>(firstArg, secondArg);
  const tokens = parseFormat(format);
  return stringifyTokens(tokens, token => tokenToString(dt, token, formatOpts));
}

const maybeMacro = (dt: DateTime, token: FormatToken, formatOpts: TokenFormatOpts = {}): string => {
  const tokenFormatOpts = macroTokens[token.name as MacroToken];
  return tokenFormatOpts ? dateTimeFormat({ ...formatOpts, ...tokenFormatOpts }, dt.zone).format(new Date(+dt)) : token.name;
};

const tokenToString = (dt: DateTime, token: FormatToken, formatOpts: TokenFormatOpts): string => {

  const numberOpts: ExtendedNumberFormatOpts = { locale: formatOpts.locale, numberingSystem: formatOpts.numberingSystem, forceSimple: formatOpts.forceSimple, useGrouping: false };

  // todo - these closures can all be created in a partial and then have dt applied to the lot of them. Does that affect performance in practice or only in theory?
  // todo - benchmark to find out
  const num = (n: number, opts: ExtendedNumberFormatOpts = numberOpts): string => {
    if (opts.last) {
      n = parseInt(n.toString().slice(-opts.last));
    }
    return opts.forceSimple ? padStart(n, opts.minimumIntegerDigits || 1) : numberFormat(opts).format(n);
  }

  const formatField = <T extends FormatOpts>(formatter: ((dt: DateTime, opts: T)  => string), opts: T): string =>
    formatter(dt, {...formatOpts, ...opts});

  const fWeekday = (opt: WeekdayFormatOpts) => formatField(formatWeekday, opt);
  const fMonth = (opt: MonthFormatOpts) => formatField(formatMonth, opt);
  const fEra = (opt: EraFormatOpts) => formatField(formatEra, opt);

  const fOffset = (width: OffsetFormatWidth): string =>
    formatOpts.allowZ && dt.zone.isUniversal && dt.offset == 0 ? "Z" : formatOffset(dt, {...formatOpts, width });

  const useDateTimeFormatter = formatOpts.calendar && formatOpts.calendar !== "gregory";
  const string = (opts: Intl.DateTimeFormatOptions, field: string) => {
    const dtf = dateTimeFormat({...formatOpts, ...opts}, dt.zone);
    return extract(new Date(+dt), dtf, field);
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
