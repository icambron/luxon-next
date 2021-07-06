import { getDefaultFormat } from "../settings";
import {
  defaultLocaleOpts,
  LocaleOpts,
  useEnglishFormatting, formatMonth as formatMonthInternal,
  formatMeridiem as formatMeridiemInternal, formattingOptions, dateTimeFormatter
} from "../model/locale";
import { DateTime } from "../model/dateTime";
import { hour, month, toJSDate } from "./core";
import { FormatMode, MonthFormatWidth } from "../model/formatting";
import { englishMeridiems, englishMonths } from "../impl/english";
import Zone from "../model/zone";

type Formatter<T> = (locale: string, opts: Intl.DateTimeFormatOptions) => (jsDate: Date, zone: Zone) => T;
type DtFer<T> = (dtf: Intl.DateTimeFormat) => (jsDate: Date, zone: Zone) => T;

const toJs = <T>(f: (jsDate: Date, zone: Zone) => T): (dt: DateTime) => T => dt => f(toJSDate(dt), dt.zone);

const withFormatting = <T>(localeOpts: LocaleOpts, fmt: Intl.DateTimeFormatOptions, f: Formatter<T>): (dt: DateTime) => T =>
  toJs<T>((d, zone) => {
      const [locale, opts] = formattingOptions(localeOpts, zone, fmt);
      return f(locale, opts)(d, zone);
  });

const withDtf = <T>(localeOpts: LocaleOpts, format: Intl.DateTimeFormatOptions, f: DtFer<T>): (dt: DateTime) => T =>
  toJs<T>((d, zone) => {
    const dtf = dateTimeFormatter(localeOpts, zone, format);
    return f(dtf)(d, zone);
  });

export const toLocaleString = (localeOpts: LocaleOpts = defaultLocaleOpts(),
                               format: Intl.DateTimeFormatOptions = getDefaultFormat()): (dt: DateTime) => string =>
  withFormatting<string>(localeOpts, format, (loc, fmt) => jsDate => jsDate.toLocaleString(loc, fmt));

export const toLocaleParts = (localeOpts: LocaleOpts = defaultLocaleOpts(),
                              format: Intl.DateTimeFormatOptions = getDefaultFormat()): (dt: DateTime) => Intl.DateTimeFormatPart[] =>
  withDtf<Intl.DateTimeFormatPart[]>(localeOpts, format, dtf => jsDate => dtf.formatToParts(jsDate));

export const toLocaleDateString = (localeOpts: LocaleOpts = defaultLocaleOpts(),
                                   format: Intl.DateTimeFormatOptions = getDefaultFormat()): (dt: DateTime) => string =>
  withFormatting<string>(localeOpts, format, (loc, fmt) => jsDate => jsDate.toLocaleDateString(loc, fmt));

export const toLocaleTimeString = (localeOpts: LocaleOpts = defaultLocaleOpts(),
                                   format: Intl.DateTimeFormatOptions = getDefaultFormat()) : (dt: DateTime) => string =>
  withFormatting<string>(localeOpts, format, (loc, fmt) => jsDate => jsDate.toLocaleTimeString(loc, fmt));

export const formatMonth = (localeOpts: LocaleOpts, mode: FormatMode, width : MonthFormatWidth): (dt: DateTime) => string =>
  dt =>
    useEnglishFormatting(localeOpts) ?
      englishMonths(width)[month(dt) - 1]
      : formatMonthInternal(localeOpts, mode, width)(toJSDate(dt), dt.zone);

export const formatMeridiem = (localeOpts: LocaleOpts): (dt: DateTime) => string =>
  dt =>
    useEnglishFormatting(localeOpts) ?
      englishMeridiems[hour(dt) < 12 ? 0 : 1]
      : formatMeridiemInternal(localeOpts)(toJSDate(dt), dt.zone);

const n = "numeric",
  s = "short",
  l = "long";

export const DATE_SHORT: Intl.DateTimeFormatOptions = {
  year: n,
  month: n,
  day: n,
};

export const DATE_MED: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
};

export const DATE_MED_WITH_WEEKDAY: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
  weekday: s,
};

export const DATE_FULL: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
};

export const DATE_HUGE: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  weekday: l,
};

export const TIME_SIMPLE: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
};

export const TIME_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
};

export const TIME_WITH_SHORT_OFFSET: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s,
};

export const TIME_WITH_LONG_OFFSET: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l,
};

export const TIME_24_SIMPLE: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  hourCycle: "h23",
};

export const TIME_24_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
};

export const TIME_24_WITH_SHORT_OFFSET: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: s,
};

export const TIME_24_WITH_LONG_OFFSET: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: l,
};

export const DATETIME_SHORT: Intl.DateTimeFormatOptions = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
};

export const DATETIME_SHORT_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
  second: n,
};

export const DATETIME_MED: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
};

export const DATETIME_MED_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
  second: n,
};

export const DATETIME_MED_WITH_WEEKDAY: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
  weekday: s,
  hour: n,
  minute: n,
};

export const DATETIME_FULL: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  timeZoneName: s,
};

export const DATETIME_FULL_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s,
};

export const DATETIME_HUGE: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  timeZoneName: l,
};

export const DATETIME_HUGE_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l,
};
