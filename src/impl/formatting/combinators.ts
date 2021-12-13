import { DateTime, FormatFirstArg, FormatOpts, FormatSecondArg, Zone } from "../../types";
import { getFormattingOpts } from "../util/formatUtil";
import { getDefaultFormat } from "../../settings";

export type WithDateAndZone<TReturn> = (jsDate: Date, zone: Zone) => TReturn

export type Formatter<TOpt, TReturn> = (formatOpts: TOpt) => WithDateAndZone<TReturn>;

export type DirectFormatter<TReturn> = (locale: string | undefined, opts: Intl.DateTimeFormatOptions | undefined) => WithDateAndZone<TReturn>;

export type WithDtAndOpts<TOpt, TReturn> = (dt: DateTime, firstArg?: FormatFirstArg<TOpt>, secondArg?: FormatSecondArg<TOpt>) => TReturn

export type WithOpts<TOpt, TReturn> = (firstArg?: FormatFirstArg<TOpt>, secondArg?: FormatSecondArg<TOpt>) => TReturn

export const toJs = <T>(dt: DateTime, f: WithDateAndZone<T>): T => f(new Date(+dt), dt.zone);

export const makeOptReader = <TOpt extends FormatOpts, TReturn>(f: (opts: TOpt) => TReturn): WithOpts<TOpt, TReturn> =>
  (firstArg, secondArg) => {
    const opts = getFormattingOpts<TOpt>(firstArg, secondArg);
    return f(opts as TOpt);
  };

export const makeDtOptReader = <TOpt extends FormatOpts, TReturn>(f: (dt: DateTime, opts: TOpt) => TReturn): WithDtAndOpts<TOpt, TReturn> =>
  (dt, firstArg, secondArg) => {
    const opts = getFormattingOpts<TOpt>(firstArg, secondArg);
    return f(dt, opts as TOpt);
  };

export const makeItemFormatter = <TOpt extends FormatOpts, TReturn>(f: Formatter<TOpt, TReturn>): WithDtAndOpts<TOpt, TReturn> =>
  makeDtOptReader((dt, opts) => toJs(dt, f(opts as TOpt)));

export const makeCombinedItemFormatter = <TOpt extends FormatOpts, TReturn>(f: Formatter<TOpt, TReturn>): WithDtAndOpts<TOpt, TReturn> =>
  makeItemFormatter((opts) => {
    const combinedOpts = combineWithDefaultFormat(opts);
    return f(combinedOpts as TOpt);
  })

export const makeDirectFormatter = <TOpt extends FormatOpts, TReturn>(f: DirectFormatter<TReturn>): WithDtAndOpts<TOpt, TReturn> =>
  makeCombinedItemFormatter(opts => f(opts.locale, opts));

const combineWithDefaultFormat = (formatOpts: FormatOpts): FormatOpts => {
  const { locale, calendar, numberingSystem, ...rest } = formatOpts;
  return Object.keys(rest).length === 0 ? { ...formatOpts, ...getDefaultFormat() } : formatOpts;
};

