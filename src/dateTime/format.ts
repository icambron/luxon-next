import { DateTime } from "../model/dateTime";
import { FormatFirstArg, FormatSecondArg, MonthFormatOpts, WeekdayFormatOpts } from "../scatteredTypes/formatting";
import Zone from "../model/zone";
import { getDefaultFormat } from "../settings";
import { dateTimeFormatter, getFormattingArgs } from "../formatting/formatUtils";
import { formatMonth as formatMonthInternal, listMonths as listMonthsInternal } from "../formatting/months";
import { formatMeridiem as formatMeridiemInternal, listMeridiems as listMeridiemsInternal } from "../formatting/meridiems";
import { formatWeekday as formatWeekdayInternal, listWeekdays as listWeekdaysInternal } from "../formatting/weekdays";
import { formatEra as formatErasInternal, listEras as listErasInternal } from "../formatting/eras";

export const toLocaleString = (firstArg?: FormatFirstArg, secondArg?: FormatSecondArg): ((dt: DateTime) => string) =>
  withFormatting<string>(firstArg, secondArg, (loc, fmt) => (jsDate) => jsDate.toLocaleString(loc, fmt));

export const toLocaleParts = (
  firstArg?: FormatFirstArg,
  secondArg?: FormatSecondArg
): ((dt: DateTime) => Intl.DateTimeFormatPart[]) =>
  withDtf<Intl.DateTimeFormatPart[]>(firstArg, secondArg, (dtf) => (jsDate) => dtf.formatToParts(jsDate));

export const toLocaleDateString = (
  firstArg?: FormatFirstArg,
  format?: Intl.DateTimeFormatOptions
): ((dt: DateTime) => string) =>
  withFormatting<string>(firstArg, format, (loc, fmt) => (jsDate) => jsDate.toLocaleDateString(loc, fmt));

export const toLocaleTimeString = (
  firstArg?: FormatFirstArg,
  secondArg?: FormatSecondArg
): ((dt: DateTime) => string) =>
  withFormatting<string>(firstArg, secondArg, (loc, fmt) => (jsDate) => jsDate.toLocaleTimeString(loc, fmt));

export const formatMonth = (firstArg?: FormatFirstArg, secondArg?: MonthFormatOpts): ((dt: DateTime) => string) => (dt) =>
  formatMonthInternal(firstArg, secondArg)(new Date(+dt), dt.zone);

export const formatWeekday = (firstArg?: FormatFirstArg, secondArg?: WeekdayFormatOpts): ((dt: DateTime) => string) => (dt) =>
  formatWeekdayInternal(firstArg, secondArg)(new Date(+dt), dt.zone);

export const formatMeridiem = (firstArg?: FormatFirstArg, secondArg?: WeekdayFormatOpts): ((dt: DateTime) => string) => (dt) =>
    formatMeridiemInternal(firstArg, secondArg)(new Date(+dt), dt.zone);

export const formatEras = (locale?: string): ((dt: DateTime) => string) => (dt) =>
  formatErasInternal(locale)(new Date(+dt), dt.zone);

export const listMonths = listMonthsInternal;
export const listWeekdays = listWeekdaysInternal;
export const listMeridiems = listMeridiemsInternal;
export const listEras = listErasInternal;

const toJs =
  <T>(f: (jsDate: Date, zone: Zone) => T): ((dt: DateTime) => T) =>
    (dt) =>
      f(new Date(+dt), dt.zone);

const withFormatting = <T>(
  firstArg: FormatFirstArg,
  secondArg: FormatSecondArg,
  f: Formatter<T>
): ((dt: DateTime) => T) =>
  toJs<T>((d, zone) => {
    let [locale, opts] = getFormattingArgs(firstArg, secondArg);
    opts = opts || getDefaultFormat();
    return f(locale, opts)(d, zone);
  });

const withDtf = <T>(firstArg: FormatFirstArg, secondArg: FormatSecondArg, f: DtFer<T>): ((dt: DateTime) => T) =>
  toJs<T>((d, zone) => {
    let [locale, opts] = getFormattingArgs(firstArg, secondArg);
    opts = opts || getDefaultFormat();
    const dtf = dateTimeFormatter(locale, zone, opts);
    return f(dtf)(d, zone);
  });

type Formatter<T> = (
  locale: string | undefined,
  opts: Intl.DateTimeFormatOptions | undefined
) => (jsDate: Date, zone: Zone) => T;
type DtFer<T> = (dtf: Intl.DateTimeFormat) => (jsDate: Date, zone: Zone) => T;
