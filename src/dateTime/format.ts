import { DateTime } from "../model/DateTime";
import {
  EraFormatOpts,
  FormatFirstArg,
  FormatSecondArg,
  GeneralFormattingOpts,
  MeridiemFormatOpts,
  MonthFormatOpts,
  WeekdayFormatOpts,
} from "../types/formatting";
import { getDefaultFormat } from "../settings";
import { dateTimeFormatter, getFormattingOpts } from "../utils/format";
import * as presets from "../impl/formatting/presets";
import { formatMonth as formatMonthInternal, listMonths as listMonthsInternal } from "../impl/formatting/months";
import {
  formatMeridiem as formatMeridiemInternal,
  listMeridiems as listMeridiemsInternal,
} from "../impl/formatting/meridiems";
import {
  formatWeekday as formatWeekdayInternal,
  listWeekdays as listWeekdaysInternal,
} from "../impl/formatting/weekdays";
import { formatEra as formatErasInternal, listEras as listErasInternal } from "../impl/formatting/eras";
import Zone from "../types/zone";

export const toLocaleString = (
  firstArg?: FormatFirstArg<GeneralFormattingOpts>,
  secondArg?: FormatSecondArg<GeneralFormattingOpts>
): ((dt: DateTime) => string) =>
  withFormatting<string>(firstArg, secondArg, (loc, fmt) => (jsDate) => jsDate.toLocaleString(loc, fmt));

export const toLocaleParts = (
  firstArg?: FormatFirstArg<GeneralFormattingOpts>,
  secondArg?: FormatSecondArg<GeneralFormattingOpts>
): ((dt: DateTime) => Intl.DateTimeFormatPart[]) =>
  withDtf<Intl.DateTimeFormatPart[]>(firstArg, secondArg, (dtf) => (jsDate) => dtf.formatToParts(jsDate));

export const toLocaleDateString = (
  firstArg?: FormatFirstArg<GeneralFormattingOpts>,
  format?: Intl.DateTimeFormatOptions
): ((dt: DateTime) => string) =>
  withFormatting<string>(firstArg, format, (loc, fmt) => (jsDate) => jsDate.toLocaleDateString(loc, fmt));

export const toLocaleTimeString = (
  firstArg?: FormatFirstArg<GeneralFormattingOpts>,
  secondArg?: FormatSecondArg<GeneralFormattingOpts>
): ((dt: DateTime) => string) =>
  withFormatting<string>(firstArg, secondArg, (loc, fmt) => (jsDate) => jsDate.toLocaleTimeString(loc, fmt));

export const formatMonth =
  (
    firstArg?: FormatFirstArg<MonthFormatOpts>,
    secondArg?: FormatSecondArg<MonthFormatOpts>
  ): ((dt: DateTime) => string) =>
  (dt) =>
    formatMonthInternal(firstArg, secondArg)(new Date(+dt), dt.zone);

export const formatWeekday =
  (
    firstArg?: FormatFirstArg<WeekdayFormatOpts>,
    secondArg?: FormatSecondArg<WeekdayFormatOpts>
  ): ((dt: DateTime) => string) =>
  (dt) =>
    formatWeekdayInternal(firstArg, secondArg)(new Date(+dt), dt.zone);

export const formatMeridiem =
  (
    firstArg?: FormatFirstArg<MeridiemFormatOpts>,
    secondArg?: FormatSecondArg<MeridiemFormatOpts>
  ): ((dt: DateTime) => string) =>
  (dt) =>
    formatMeridiemInternal(firstArg, secondArg)(new Date(+dt), dt.zone);

export const formatEra =
  (firstArg?: FormatFirstArg<EraFormatOpts>, secondArg?: FormatSecondArg<EraFormatOpts>): ((dt: DateTime) => string) =>
  (dt) =>
    formatErasInternal(firstArg, secondArg)(new Date(+dt), dt.zone);

export const listMonths = listMonthsInternal;
export const listWeekdays = listWeekdaysInternal;
export const listMeridiems = listMeridiemsInternal;

// note this doesn't support Japanese eras
export const listEras = listErasInternal;

const combineWithDefaultFormat = (formatOpts: GeneralFormattingOpts): GeneralFormattingOpts => {
  const { locale, calendar, numberingSystem, ...rest } = formatOpts;
  return Object.keys(rest).length === 0 ? { ...formatOpts, ...getDefaultFormat() } : formatOpts;
};

const withFormatting = <T>(
  firstArg: FormatFirstArg<GeneralFormattingOpts>,
  secondArg: FormatSecondArg<GeneralFormattingOpts>,
  f: Formatter<T>
): ((dt: DateTime) => T) =>
  toJs<T>((d, zone) => {
    let formatOpts = getFormattingOpts(firstArg, secondArg);
    formatOpts = combineWithDefaultFormat(formatOpts);
    return f(formatOpts.locale, formatOpts)(d, zone);
  });

type Formatter<T> = (
  locale: string | undefined,
  opts: Intl.DateTimeFormatOptions | undefined
) => (jsDate: Date, zone: Zone) => T;

const toJs =
  <T>(f: (jsDate: Date, zone: Zone) => T): ((dt: DateTime) => T) =>
  (dt) =>
    f(new Date(+dt), dt.zone);

const withDtf = <T>(
  firstArg: FormatFirstArg<GeneralFormattingOpts>,
  secondArg: FormatSecondArg<GeneralFormattingOpts>,
  f: DtFer<T>
): ((dt: DateTime) => T) =>
  toJs<T>((d, zone) => {
    let formatOpts = getFormattingOpts(firstArg, secondArg);
    formatOpts = combineWithDefaultFormat(formatOpts);
    const dtf = dateTimeFormatter(formatOpts.locale, zone, formatOpts);
    return f(dtf)(d, zone);
  });

type DtFer<T> = (dtf: Intl.DateTimeFormat) => (jsDate: Date, zone: Zone) => T;

// todo - revisit these
export const DATE_SHORT = presets.DATE_SHORT;
export const DATE_MED = presets.DATE_MED;
export const DATE_MED_WITH_WEEKDAY = presets.DATE_MED_WITH_WEEKDAY;
export const DATE_FULL = presets.DATE_FULL;
export const DATE_HUGE = presets.DATE_HUGE;
export const TIME_SIMPLE = presets.TIME_SIMPLE;
export const TIME_WITH_SECONDS = presets.TIME_WITH_SECONDS;
export const TIME_WITH_SHORT_OFFSET = presets.TIME_WITH_SHORT_OFFSET;
export const TIME_WITH_LONG_OFFSET = presets.TIME_WITH_LONG_OFFSET;
export const TIME_24_SIMPLE = presets.TIME_24_SIMPLE;
export const TIME_24_WITH_SECONDS = presets.TIME_24_WITH_SECONDS;
export const TIME_24_WITH_SHORT_OFFSET = presets.TIME_24_WITH_SHORT_OFFSET;
export const TIME_24_WITH_LONG_OFFSET = presets.TIME_24_WITH_LONG_OFFSET;
export const DATETIME_SHORT = presets.DATETIME_SHORT;
export const DATETIME_SHORT_WITH_SECONDS = presets.DATETIME_SHORT_WITH_SECONDS;
export const DATETIME_MED = presets.DATETIME_MED;
export const DATETIME_MED_WITH_SECONDS = presets.DATETIME_MED_WITH_SECONDS;
export const DATETIME_MED_WITH_WEEKDAY = presets.DATETIME_MED_WITH_WEEKDAY;
export const DATETIME_FULL = presets.DATETIME_FULL;
export const DATETIME_FULL_WITH_SECONDS = presets.DATETIME_FULL_WITH_SECONDS;
export const DATETIME_HUGE = presets.DATETIME_HUGE;
export const DATETIME_HUGE_WITH_SECONDS = presets.DATETIME_HUGE_WITH_SECONDS;
