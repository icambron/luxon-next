import { hour, month, toJSDate } from "./core";
import { DateTime } from "../model/dateTime";
import { LocaleOpts, formatMonth as formatMonthInternal, formatMeridiem as formatMeridiemInternal, useEnglishFormatting } from "../model/locale";
import { englishMeridiems, englishMonths } from "../impl/english";
import { FormatMode, MonthFormatWidth } from "../model/formatting";

export const formatMonth = (localeOpts: LocaleOpts, mode: FormatMode, width : MonthFormatWidth): (dt: DateTime) => string | null =>
  dt =>
    useEnglishFormatting(localeOpts) ?
      englishMonths(width)[month(dt) - 1].toString()
      : formatMonthInternal(localeOpts, mode, width)(toJSDate(dt));

export const formatMeridiem = (localeOpts: LocaleOpts): (dt: DateTime) => string | null =>
  dt =>
    useEnglishFormatting(localeOpts) ?
        englishMeridiems[hour(dt) < 12 ? 0 : 1]
        : formatMeridiemInternal(localeOpts)(toJSDate(dt));
