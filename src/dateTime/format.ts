import {
  formatMonth as formatMonthInternal,
  formatMeridiem as formatMeridiemInternal,
  listMonths as listMonthsInternal,
  dateTimeFormatter,
} from "../model/locale";
import { DateTime } from "../model/dateTime";
import { toJSDate } from "./core";
import { FormatFirstArg, FormatSecondArg, MonthFormatOpts} from "../model/formatting";
import Zone from "../model/zone";
import { getDefaultFormat } from "../settings";

type Formatter<T> = (
  locale: string | undefined,
  opts: Intl.DateTimeFormatOptions | undefined
) => (jsDate: Date, zone: Zone) => T;
type DtFer<T> = (dtf: Intl.DateTimeFormat) => (jsDate: Date, zone: Zone) => T;

// allow (), ("de"), ("de" { calendar: "" }), ({ calendar: "" }) with the right defaults
const getFormattingArgs = <T>(
  firstArg: FormatFirstArg | T,
  secondArg: FormatSecondArg | T,
  thirdArg?: T,
  f?: (a: any) => a is T
): [string | undefined, Intl.DateTimeFormatOptions | undefined, T | undefined] => {
  let locale: string | undefined = undefined;
  let intlOpts: Intl.DateTimeFormatOptions | undefined = undefined;
  let t: T | undefined = undefined;

  if (typeof firstArg == "string") {
    locale = firstArg;
  } else if (f && f(firstArg)) {
    t = firstArg;
  } else {
    intlOpts = firstArg;
  }

  if (!t && f && f(secondArg)) {
    t = secondArg;
  } else if (!t && !intlOpts) {
    intlOpts = secondArg;
  }

  if (!t && !intlOpts && f && f(thirdArg)) {
    t = thirdArg;
  }

  return [locale, intlOpts, t];
};

const toJs = <T>(f: (jsDate: Date, zone: Zone) => T): ((dt: DateTime) => T) => (dt) => f(toJSDate(dt), dt.zone);

const hasKeys = <T>(...keys: string[]): ((o: any) => o is T) => (o: any): o is T =>
  typeof o === "object" && keys.some((k) => o[k]);

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
): ((dt: DateTime) => string) => {
  return withFormatting<string>(firstArg, secondArg, (loc, fmt) => (jsDate) => jsDate.toLocaleTimeString(loc, fmt));
};

export const formatMonth = (firstArg?: FormatFirstArg, secondArg?: MonthFormatOpts): ((dt: DateTime) => string) => {
  const [locale, opts, monthFormatOpts] = getFormattingArgs<MonthFormatOpts>(
    firstArg,
    undefined,
    secondArg,
    hasKeys("mode", "width")
  );
  return (dt) => formatMonthInternal(locale, opts, monthFormatOpts)(toJSDate(dt), dt.zone);
};

export const formatMeridiem = (locale?: string): ((dt: DateTime) => string) => (dt) =>
  formatMeridiemInternal(locale)(toJSDate(dt), dt.zone);

export const listMonths = (firstArg?: FormatFirstArg, secondArg?: MonthFormatOpts): string[] => {
  const [locale, opts, monthFormatOpts] = getFormattingArgs<MonthFormatOpts>(
    firstArg,
    undefined,
    secondArg,
    hasKeys("mode", "width")
  );
  return listMonthsInternal([locale, opts, monthFormatOpts]);
};
