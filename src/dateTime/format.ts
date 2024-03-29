import { dateTimeFormat, getDefaultedDateTimeFormattingOpts } from "../impl/util/formatUtil";
import { formatMonth as formatMonthInternal, listMonths as listMonthsInternal } from "../impl/formatting/months";
import {
  formatMeridiem as formatMeridiemInternal,
  listMeridiems as listMeridiemsInternal,
} from "../impl/formatting/meridiems";
import {
  formatWeekday as formatWeekdayInternal,
  listWeekdays as listWeekdaysInternal,
} from "../impl/formatting/weekdays";
import { listEras as listErasInternal, formatEra as formatEraInternal } from "../impl/formatting/eras";
import { dateTimeToFormat } from "../impl/formatting/tokenFormatter";
import { formatOffset as formatOffsetInternal } from "../impl/formatting/namedOffset";
import { formatNumericOffset } from "../impl/util/zoneUtils";
import { getDefaultDateFormat, getDefaultDateTimeFormat, getDefaultLocale, getDefaultTimeFormat } from "../settings";
import { DateTime, FormatFirstArg, DateTimeFormatOpts, FormatSecondArg, ISOFormatOpts } from "../types";

// think we'll just have to live with these deps?
import { toUTC } from "./zone";
import { padStart } from "../impl/util/string";

/**
 * Returns a locale-appropriate locale string, given options to control the locale and format
 *  @param dt - the DateTime to create the string from
 *  @param locale - A locale string like "en" to override the default locale.If you wish to use the default locale, but have an options argument, you may provide it here instead.
 *  @param opts - On option object to override the formatting. Accepts the same keys as the native `Date#toLocaleString()`.
 *
 *  @example
 *  ```js
 *  var dt = ymd(2020, 11, 16);
 *  // nb: current default locale is en-US
 *
 *  toLocaleString(dt) //=> 'Nov 16, 2020, 12:00:00 AM'
 *  toLocaleString(dt, "fr") //=>'16 nov. 2020, 00:00:00'
 *  toLocaleString(dt, { dateStyle: "short", timeStyle: "medium"}) //=> '11/16/20, 12:00:00 AM'
 *  toLocaleString(dt, "fr", { dateStyle: "short", timeStyle: "medium" }) // => '16/11/2020 00:00:00'
 *  ```
 *  @label formatting
 */
export const toLocaleString = (
  dt: DateTime,
  locale?: FormatFirstArg<DateTimeFormatOpts>,
  opts?: FormatSecondArg<DateTimeFormatOpts>
): string => {
  const defaulted = getDefaultedDateTimeFormattingOpts(locale, opts, getDefaultDateTimeFormat);
  return dt.native().toLocaleString(defaulted.locale || getDefaultLocale(), defaulted);
};

/**
 * Returns a locale-appropriate locale string for the date, given options to control the locale and format
 *  @param dt - the DateTime to create the string from
 *  @param locale - A locale string like "en" to override the default locale. If you wish to use the default locale, but have a options argument, you may provide that options argument here instead.
 *  @param opts - On option object to override the formatting. Accepts the same keys as the native `Date#toLocaleDateString()`.
 *
 *  @example
 *  ```js
 *  var dt = ymd(2020, 11, 16);
 *  // nb: current default locale is en-US
 *
 *  toLocaleDateString(dt) //=> 'Nov 16, 2020'
 *  toLocaleDateString(dt, "fr") //=>'16 nov. 2020'
 *  toLocaleDateString(dt, { dateStyle: "short", }) //=> '11/16/20'
 *  toLocaleDateString(dt, "fr", { dateStyle: "short" }) // => '16/11/20'
 *  ```
 *  @label formatting
 */
export const toLocaleDateString = (
  dt: DateTime,
  locale?: FormatFirstArg<DateTimeFormatOpts>,
  opts?: FormatSecondArg<DateTimeFormatOpts>
): string => {
  const defaulted = getDefaultedDateTimeFormattingOpts(locale, opts, getDefaultDateFormat);
  return dt.native().toLocaleDateString(defaulted.locale || getDefaultLocale(), defaulted);
};

/**
 * Returns a locale-appropriate locale string for the time, given options to control the locale and format
 *  @param dt - the DateTime to create the string from
 *  @param locale - A locale string like "en" to override the default locale. If you wish to use the default locale, but have an options argument, you may provide that options argument here instead.
 *  @param opts - On option object to override the formatting. Accepts the same keys as the native `Date#toLocaleTimeString()`.
 *  @label formatting
 *
 *  @example
 *  ```js
 *  var dt = ymd(2020, 11, 16);
 *  // nb: current default locale is en-US
 *
 *  toLocaleTimeString(dt) //=> '12:00:00 AM'
 *  toLocaleTimeString(dt, "fr") //=>'00:00:00'
 *  toLocaleTimeString(dt, { timeStyle: "medium"}) //=> '12:00:00 AM'
 *  toLocaleTimeString(dt, "fr", { timeStyle: "medium" }) // => '00:00:00'
 *  ```
 */
export const toLocaleTimeString = (
  dt: DateTime,
  locale?: FormatFirstArg<DateTimeFormatOpts>,
  opts?: FormatSecondArg<DateTimeFormatOpts>
): string => {
  const defaulted = getDefaultedDateTimeFormattingOpts(locale, opts, getDefaultTimeFormat);
  return dt.native().toLocaleTimeString(defaulted.locale || getDefaultLocale(), defaulted);
};

/**
 * Returns an array of objects containing formatted sections. See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts | Intl.DateTimeFormat#formatToParts}.
 * @param dt - the DateTime to format
 * @param locale - A locale string like "en" to override the default locale. If you wish to use the default locale, but have an options argument, you may provide that options argument here instead.
 * @param opts - On option object to override the formatting. Accepts the same keys as the options parameter of the native `Int.DateTimeFormat` constructor.
 * @example
 * ```js
 * toLocaleParts(ymd(1982, 5, 25));
 *  //=> [
 *  //=>   { type: 'day', value: '25' },
 *  //=>   { type: 'literal', value: '/' },
 *  //=>   { type: 'month', value: '05' },
 *  //=>   { type: 'literal', value: '/' },
 *  //=>   { type: 'year', value: '1982' }
 *  //=> ]
 *```
 *  @label formatting
 */
export const toLocaleParts = (
  dt: DateTime,
  locale?: FormatFirstArg<DateTimeFormatOpts>,
  opts?: FormatSecondArg<DateTimeFormatOpts>
): Intl.DateTimeFormatPart[] => {
  const defaulted = getDefaultedDateTimeFormattingOpts(locale, opts, getDefaultDateTimeFormat);
  return dateTimeFormat(defaulted, dt.zone).formatToParts(new Date(+dt));
};

/**
 * Returns a string representation of this DateTime formatted according to the specified format string.
 * @remarks
 * Several usage notes:
 * * **You may not want this.** See {@link toLocaleString} for a more flexible formatting tool for user-facing strings. In particular, string formats vary from locale to locale, so using a predefined format is not recommended. Instead, use `toFormat()` in situations requiring an exact format not otherwise supported by Luxon.
 * * Defaults to en-US if no locale has been specified explicitly, regardless of the current default locale. This is to support parsing technical formats that do not vary based on the user's locale.
 * * Use `[` and `]` to delimit escaped substrings.
 * @see For table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
 * @param format - The format string to use
 * @param dt - the DateTime to format
 * @param locale - A locale string like "en" to override the default locale. If you wish to use the default locale, but have an options argument, you may provide that options argument here instead.
 * @param opts - On option object to override the formatting. See {@link TokenFormatOpts} for the available options
 * @example
 * ```js
 *  var dt = ymd(2017, 4, 22);
 * toFormat(dt, 'yyyy LLL dd') //=> '2017 Apr 22'
 * toFormat(dt, 'yyyy LLL dd', 'fr') //=> '2017 avr. 22'
 * toFormat("HH [hours and] mm [minutes]") //=> '20 hours and 55 minutes'
 * toFormat(dt, "MMMM yyyy", { calendar: "islamic" }) //=> 'Rajab 1438'
 * ```
 * @label formatting
 */
export const toFormat = dateTimeToFormat;

/**
 * Returns an RFC 2822-compatible string representation of the DateTime
 * @param dt - the DateTime to format
 * @example
 * ```js
 * toRFC2822(ymd(2014, 7, 13)) //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
 * ```
 *  @label formatting
 */
export const toRFC2822 = (dt: DateTime) =>
  toFormat(dt, "EEE, dd LLL yyyy HH:mm:ss ZZZ", "en-US", { forceSimple: true });

/**
 * Returns a string representation of this DateTime appropriate for use in HTTP headers. The output is always expressed in GMT.
 * Specifically, the string conforms to RFC 1123.
 * @see {@link https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1 | the RFC }
 * @param dt - the DateTime to format
 * @example
 *  ```js
 *  toHTTP(ymdUTC(2014, 7, 13)) //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
 *  ```
 *  @label formatting
 */
export const toHTTP = (dt: DateTime) => toFormat(toUTC(dt), "EEE, dd LLL yyyy HH:mm:ss [GMT]");


/**
 * Returns an ISO 8601-compliant string representation of this DateTime
 * @param dt - the DateTime to format
 * @param opts - options to govern the formatting. See {@link ISOFormatOpts}.
 * @example
 *
 * ```js
 * const dt = fromGregorian({
 *   year: 1982,
 *   month: 5,
 *   day: 25,
 *   hour: 9,
 *   minute: 23,
 *   second: 54,
 *   millisecond: 123,
 * });
 *
 *  toISO(dt) //=> "1982-05-25T09:23:54.123-04:00"
 *  toISO(toUTC(dt)) //=> "1982-05-25T05:23:54.123Z"
 *  toISO(dt, { includeOffset: false }) //=> "1982-05-25T09:23:54.123"
 *  toISO(dt, { format: "basic" }) //=> "19820525T092354.123-0400"
 * ```
 */
export const toISO = (dt: DateTime, opts: Partial<ISOFormatOpts> = {}) =>
  `${toISODate(dt, opts)}T${toISOTime(dt, opts)}`;

export const toISODate = (dt: DateTime, opts: Partial<ISOFormatOpts> = {}): string => {

  let y = padStart(dt.gregorian.year,  dt.gregorian.year > 9999 || dt.gregorian.year < 0 ? 6 : 4);
  
  if (dt.gregorian.year > 9999) {
    y = "+" + y;
  }

  const mo = padStart(dt.gregorian.month);
  const d = padStart(dt.gregorian.day);

  return opts.format === "basic" ? `${y}${mo}${d}` : `${y}-${mo}-${d}`;
};

/**
 * Returns an ISO 8601-compliant string representation of this DateTime's week date
 * @param dt - the DateTime to format
 * @example
 * ```js
 * toISOWeekDate(ymdUTC(1982, 5, 25)) //=> '1982-W21-2'
 * ```
 */
export const toISOWeekDate = (dt: DateTime) => toFormat(dt, "kkkk-[W]W-c");

/**
 * Returns an ISO-8601 string representing the time component of this DateTime
 * @param dt - the DateTime to format
 * @param opts - options to govern the formatting. See {@link ISOFormatOpts}.
 * @example
 * ```js
 *
 * const dt = fromGregorian({
 *   year: 1982,
 *   month: 5,
 *   day: 25,
 *   hour: 9,
 *   minute: 23,
 *   second: 54,
 *   millisecond: 123,
 * });
 *
 *  toISOTime(dt) //=> "09:23:54.123-04:00"
 *  toISOTime(toUTC(dt)) //=> "05:23:54.123Z"
 *  toISOTime(dt, { includeOffset: false }) //=> "09:23:54.123"
 *  toISOTime(dt, { format: "basic" }) //=> "0525T092354.123-0400"
 * ```
 */
export const toISOTime = (dt: DateTime, opts: Partial<ISOFormatOpts> = {}) => {

  const h = padStart(dt.time.hour);
  const m = padStart(dt.time.minute);
  let result = opts.format === "basic" ? `${h}${m}`: `${h}:${m}`;

  const shouldElideSeconds =
    (typeof opts.seconds !== "undefined" && !opts.seconds) || (opts.elideZeroSeconds && dt.time.second === 0 && dt.time.millisecond == 0);

  if (!shouldElideSeconds) {
    if (opts.format != "basic") {
      result += ":"
    }
    result += padStart(dt.time.second);


    const shouldElideMilliseconds =
      (typeof opts.milliseconds !== "undefined" && !opts.milliseconds) || (opts.elideZeroMilliseconds && dt.time.millisecond === 0);

    if (!shouldElideMilliseconds) {
      result += "." + padStart(dt.time.millisecond, 3);
    }
  }

  if (typeof opts.includeOffset == "undefined" || opts.includeOffset) {
    result += dt.offset == 0 && dt.zone.isUniversal ? "Z" : formatNumericOffset(dt.offset, opts.format == "basic" ? "narrow" : "standard");
  }

  return result;
};

/**
 *  @param locale - A locale string like "en" to override the default locale.If you wish to use the default locale, but have an options argument, you may provide it here instead.
 *  @param opts - On option object to override the formatting. See {@link EraFormatOpts}.
 * @example
 * ```js
 * const dt = fromGregorian({
 *   year: 2014,
 *   month: 8,
 *   day: 6,
 *   hour: 9,
 *   minute: 23,
 *   second: 54,
 *   millisecond: 123,
 * }, "utc");
 *
 * formatEra(dt) //=> "AD"
 * formatEra(dt, "be") //=> "н.э.";
 * formatEra(dt, { width: "long" }) //=> "Anno Domini";
 * formatEra(dt, "be", { width: "long" }) //=> "ад нараджэння Хрыстова";
 * ```
 */
export const formatEra = formatEraInternal;

/**
 * Gets a list of the possible values for eras
 * @param opts - On option object to override the formatting. See {@link EraFormatOpts}.
 * @example
 * ```js
 *  listEras() //=> ["BC", "AD"];
 *  listEras("fr") //=> ["av. J.-C.", "ap. J.-C."];
 *  listEras({ width: "short" }) //=> ["BC", "AD"];
 *  listEras({ width: "long" }) //=> ["Before Christ", "Anno Domini"];
 *  listEras("fr", { width: "short" }) //=> ["av. J.-C.", "ap. J.-C."];
 *  listEras("fr", { width: "long" }) //=> ["avant Jésus-Christ", "après Jésus-Christ"];
 * ```
 */
export const listEras = listErasInternal;

export const formatMonth = formatMonthInternal;
export const listMonths = listMonthsInternal;

export const formatWeekday = formatWeekdayInternal;
export const listWeekdays = listWeekdaysInternal;

export const formatMeridiem = formatMeridiemInternal;
export const listMeridiems = listMeridiemsInternal;

export const formatOffset = formatOffsetInternal;
