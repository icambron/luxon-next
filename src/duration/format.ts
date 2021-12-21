import { orderedUnits } from "../impl/duration";
import { durationToFormat } from "../impl/formatting/tokenFormatter";
import { formatList, getFormattingOpts } from "../impl/util/formatUtil";
import { simpleSingular } from "../impl/util/units";
import { getDefaultLocale } from "../settings";
import { Duration, DurationHumanizeFormatOpts, FormatFirstArg, FormatSecondArg } from "../types";

/**
  * Returns a string representation of a Duration with all units included
  * To modify its behavior use the `listStyle` and any Intl.NumberFormat option, though `unitDisplay` is especially relevant. See {@link Intl.NumberFormat}.
   * @param dur - the duration to format
  * @param locale - A locale string like "en" to override the default locale. If you wish to use the default locale, but have an options argument, you may provide that options argument here instead.
  * @param opts - On option object to override the formatting. Accepts the same keys as the options parameter of the native `Int.NumberFormat` constructor, as well as `listStyle`. See {@link DurationHumanizeFormatOpts} for more.
  * @example
  * ```js
  * var dur = duration({ days: 1, hours: 5, minutes: 6 })
  * durToHuman(dur) //=> '1 day, 5 hours, 6 minutes'
  * durToHuman(dur, { listStyle: "long" }) //=> '1 day, 5 hours, and 6 minutes'
  * durToHuman(dur, { unitDisplay: "short" }) //=> '1 day, 5 hr, 6 min'
  * ```
*/
export const durToHuman = (dur: Duration, locale: FormatFirstArg<DurationHumanizeFormatOpts>, opts: FormatSecondArg<DurationHumanizeFormatOpts>): string => {
  const formatOpts = getFormattingOpts(locale, opts);
  const vals = dur.values;
  const l = orderedUnits.map(unit => {
    const v = vals[unit];
    return typeof(v) === "undefined" ? null :
      new Intl.NumberFormat(formatOpts.locale, { style: "unit", unitDisplay: "long", ...formatOpts, unit: simpleSingular(unit) }).format(v);
  })
  .filter(n => n) as string[];

  return formatList(l, formatOpts.locale || getDefaultLocale(), { type: "conjunction", style: formatOpts.listStyle || "narrow" });
}

  /**
   * Returns a string representation of a Duration formatted according to the specified format string. You may use these tokens:
   * * `S` for milliseconds
   * * `s` for seconds
   * * `m` for minutes
   * * `h` for hours
   * * `d` for days
   * * `M` for months
   * * `y` for years
   * Notes:
   * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
   * * The duration will be converted to the set of units in the format string using {@link durShiftTo}, according to the optional `conversionAccuracy` argument
   * @param dur - the duration to format
   * @param format - the format string
   * @param locale - A locale string like "en" to override the default locale. If you wish to use the default locale, but have an options argument, you may provide that options argument here instead.
   * @param opts - On option object to override the formatting. Accepts the same keys as the options parameter of the native `Int.NumberFormat` constructor, as well as `floor` and `conversionAccuracy`. See {@link DurationTokenFormatOpts} for more.
     *
   * @example
   * ```js
   * var dur = duration({ years: 1, days: 6, seconds: 2 });
   * durToFormat(dur, "y d s") //=> "1 6 2"
   * durToFormat(dur, "yy dd sss") //=> "01 06 002"
   * durToFormat(dur, "M S") //=> "12 518402000"
   * durToFormat(dur, "yy dd sss", "bn") // => '০১ ০৬ ০০২'
   * durToFormat(durFromMillis(100000),"SSS", { notation: "compact" }) //=> '100K'
   */
export const durToFormat = durationToFormat;
