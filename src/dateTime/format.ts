import { dateTimeFormat } from "../impl/util/formatUtil";
import * as presets from "../impl/formatting/presets";
import { extractMonth, listMonths as listMonthsInternal } from "../impl/formatting/months";
import { extractMeridiem, listMeridiems as listMeridiemsInternal } from "../impl/formatting/meridiems";
import { extractWeekday, listWeekdays as listWeekdaysInternal } from "../impl/formatting/weekdays";
import { extractEra, listEras as listErasInternal } from "../impl/formatting/eras";
import { formatNumericOffset } from "../impl/zone/zone";
import { toFormat as toFormatInternal } from "../impl/formatting/tokenFormatter";
import { extractNamedOffset } from "../impl/formatting/namedOffset";
import { DateTime, NamedOffsetFormatOpts, NumericOffsetFormatWidth, OffsetFormatOpts } from "../types";

import {
  makeCombinedItemFormatter,
  makeDirectFormatter,
  makeItemFormatter,
  makeOptReader,
  makeDtOptReader,
  toJs} from "../impl/formatting/combinators";

// think we'll just have to live with these deps?
import { toUTC } from "./zone";
import { year } from "./core";

export const toLocaleString = makeDirectFormatter((loc, fmt) => (jsDate) => jsDate.toLocaleString(loc, fmt));
export const toLocaleDateString = makeDirectFormatter((loc, fmt) => (jsDate) => jsDate.toLocaleDateString(loc, fmt));
export const toLocaleTimeString = makeDirectFormatter((loc, fmt) => (jsDate) => jsDate.toLocaleTimeString(loc, fmt));

export const toLocaleParts = makeCombinedItemFormatter(
  (opts) => (jsDate, zone) => dateTimeFormat(opts, zone).formatToParts(jsDate)
);

export const toFormat = toFormatInternal;

export const toRFC2822 = (dt: DateTime) => toFormat(dt, "EEE, dd LLL yyyy HH:mm:ss ZZZ", "en-US");
export const toHTTP = (dt: DateTime) => toFormat(toUTC(dt), "EEE, dd LLL yyyy HH:mm:ss [GMT]");

// todo - type options
export const toISODate = (dt: DateTime, format: string = "extended"):string => {
  let fmt = format === "basic" ? "yyyyMMdd" : "yyyy-MM-dd";

  if (year(dt) > 9999) {
    fmt = "+" + fmt;
  }
  return toFormatInternal(dt, fmt);
}

export const toISOWeekDate = (dt: DateTime) => toFormat(dt, "kkkk-[W]W-c");

// todo - toIsoTime()

export const formatMonth = makeItemFormatter(extractMonth);
export const formatWeekday = makeItemFormatter(extractWeekday);
export const formatMeridiem = makeItemFormatter(extractMeridiem);
export const formatEra = makeItemFormatter(extractEra);

export const formatOffset = makeDtOptReader<OffsetFormatOpts, string>((dt, opts) => {
  const width = opts.width || "short";
  return width === "short" || width === "long"
    ? toJs(dt, extractNamedOffset(opts as NamedOffsetFormatOpts))
    : formatNumericOffset(dt.offset, width as NumericOffsetFormatWidth)
  });

export const listMonths = makeOptReader(listMonthsInternal);
export const listWeekdays = makeOptReader(listWeekdaysInternal);
export const listMeridiems = makeOptReader(listMeridiemsInternal);
// note this doesn't support Japanese eras
export const listEras = makeOptReader(listErasInternal);

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
