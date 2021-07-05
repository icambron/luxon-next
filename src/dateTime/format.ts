import { getDefaultFormat } from "../settings";
import { defaultLocaleOpts, LocaleOpts, toLocaleString as toLocaleStringInternal, toLocaleDateString as toLocaleDateStringInternal, toLocaleTimeString as toLocaleTimeStringInternal } from "../model/locale";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { DateTime } from "../model/dateTime";
import { toJSDate } from "./core";

const wrap = (f: (jsDate: Date) => string): (dt: DateTime) => string => dt => f(toJSDate(dt));

export const toLocaleString = (format: DateTimeFormatOptions = getDefaultFormat(),
                               localeOpts: LocaleOpts = defaultLocaleOpts()): (dt: DateTime) => string =>
  wrap(toLocaleStringInternal(localeOpts, format));

export const toLocaleDateString = (format: DateTimeFormatOptions = getDefaultFormat(),
                               localeOpts: LocaleOpts = defaultLocaleOpts()): (dt: DateTime) => string =>
  wrap(toLocaleDateStringInternal(localeOpts, format));

export const toLocaleTimeString = (format: DateTimeFormatOptions = getDefaultFormat(),
                                   localeOpts: LocaleOpts = defaultLocaleOpts()): (dt: DateTime) => string =>
  wrap(toLocaleTimeStringInternal(localeOpts, format));
