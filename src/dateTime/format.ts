import { getDefaultFormat } from "../settings";
import { defaultLocaleOpts, LocaleOpts, toLocaleString as toLocaleStringInternal, toLocaleDateString as toLocaleDateStringInternal, toLocaleTimeString as toLocaleTimeStringInternal } from "../model/locale";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { DateTime } from "../model/dateTime";
import { toJSDate } from "./core";

export const toLocaleString = (dt: DateTime,
                               format: DateTimeFormatOptions = getDefaultFormat(),
                               localeOpts: LocaleOpts = defaultLocaleOpts()): string =>
  toLocaleStringInternal(toJSDate(dt), localeOpts, format)

export const toLocaleDateString = (dt: DateTime,
                               format: DateTimeFormatOptions = getDefaultFormat(),
                               localeOpts: LocaleOpts = defaultLocaleOpts()): string =>
  toLocaleDateStringInternal(toJSDate(dt), localeOpts, format)

export const toLocaleTimeString = (dt: DateTime,
                                   format: DateTimeFormatOptions = getDefaultFormat(),
                                   localeOpts: LocaleOpts = defaultLocaleOpts()): string =>
  toLocaleTimeStringInternal(toJSDate(dt), localeOpts, format)
