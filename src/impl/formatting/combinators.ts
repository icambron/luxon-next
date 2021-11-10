import { DateTime, FormatFirstArg, FormatOpts, FormatSecondArg, Zone } from "../../types";
import { getFormattingOpts } from "../util/formatUtil";
import { getDefaultFormat } from "../../settings";

export type WithDateAndZone<TReturn> = (jsDate: Date, zone: Zone) => TReturn

export type Formatter<TOpt, TReturn> = (formatOpts: TOpt) => WithDateAndZone<TReturn>;

export type DirectFormatter<TReturn> = (locale: string | undefined, opts: Intl.DateTimeFormatOptions | undefined) => WithDateAndZone<TReturn>;

export type WithDt<TReturn> = (dt: DateTime) => TReturn;

export type WithOpts<TOpt, TReturn> = (firstArg?: FormatFirstArg<TOpt>, secondArg?: FormatSecondArg<TOpt>) => TReturn

export type WithOptsForDt<TOpt, TReturn> = WithOpts<TOpt, WithDt<TReturn>>;

export const toJs =
  <T>(f: WithDateAndZone<T>): WithDt<T> => (dt) => f(new Date(+dt), dt.zone);

export const makeOptReader = <TOpt extends FormatOpts, TReturn>(f: (opts: TOpt) => TReturn): WithOpts<TOpt, TReturn> =>
  (firstArg, secondArg) => {
    const opts = getFormattingOpts<TOpt>(firstArg, secondArg);
    return f(opts as TOpt);
  };

export const makeItemFormatter = <TOpt extends FormatOpts, TReturn>(f: Formatter<TOpt, TReturn>): WithOptsForDt<TOpt, TReturn> =>
  makeOptReader((opts) => toJs(f(opts as TOpt)));

export const makeCombinedItemFormatter = <TOpt extends FormatOpts, TReturn>(f: Formatter<TOpt, TReturn>): WithOptsForDt<TOpt, TReturn> =>
  makeItemFormatter((opts) => {
    const combinedOpts = combineWithDefaultFormat(opts);
    return f(combinedOpts as TOpt);
  })

export const makeDirectFormatter = <TOpt extends FormatOpts, TReturn>(f: DirectFormatter<TReturn>): WithOptsForDt<TOpt, TReturn> =>
  makeCombinedItemFormatter(opts => f(opts.locale, opts));

const combineWithDefaultFormat = (formatOpts: FormatOpts): FormatOpts => {
  const { locale, calendar, numberingSystem, ...rest } = formatOpts;
  return Object.keys(rest).length === 0 ? { ...formatOpts, ...getDefaultFormat() } : formatOpts;
};

