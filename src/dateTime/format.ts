import { dateTimeFormat } from "../impl/util/formatUtil";
import * as presets from "../impl/formatting/presets";
import { formatMonth as formatMonthInternal, listMonths as listMonthsInternal } from "../impl/formatting/months";
import { formatMeridiem as formatMeridiemInternal, listMeridiems as listMeridiemsInternal } from "../impl/formatting/meridiems";
import { formatWeekday as formatWeekdayInternal, listWeekdays as listWeekdaysInternal } from "../impl/formatting/weekdays";
import { listEras as listErasInternal, formatEra as formatEraInternal } from "../impl/formatting/eras";
import { toFormat as toFormatInternal } from "../impl/formatting/tokenFormatter";
import { formatOffset as formatOffsetInternal } from "../impl/formatting/namedOffset";
import { DateTime } from "../types";

import { makeCombinedItemFormatter, makeDirectFormatter} from "../impl/formatting/combinators";

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

export const formatEra = formatEraInternal;
export const listEras = listErasInternal;

export const formatMonth = formatMonthInternal;
export const listMonths = listMonthsInternal;

export const formatWeekday = formatWeekdayInternal;
export const listWeekdays = listWeekdaysInternal;

export const formatMeridiem = formatMeridiemInternal;
export const listMeridiems = listMeridiemsInternal;

export const formatOffset = formatOffsetInternal;

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
