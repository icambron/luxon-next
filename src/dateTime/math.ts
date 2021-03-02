import DateTime from "../model/dateTime";
import {bestBy} from "../impl/util";
import {month} from "./core";
import {isoCalendarInstance} from "../model/calendars/isoWeek";
import {gregorianInstance} from "../model/calendars/gregorian";
import {set} from "../impl/dateTimeImpl";

/**
 * Return the max of several date times
 * @param {Array<DateTime>} dts - the DateTimes from which to choose the maximum
 * @return {DateTime} the max DateTime, or undefined if called with no argument
 */
export const max = (dts: Array<DateTime>): DateTime => bestBy(dts, i => i.valueOf(), Math.max);

/**
 * Return the min of several date times
 * @param {Array<DateTime>} dts - the DateTimes from which to choose the minimum
 * @return {DateTime} the min DateTime, or undefined if called with no argument
 */
export const min = (dts: Array<DateTime>): DateTime => bestBy(dts, i => i.valueOf(), Math.min);

// todo: use duration keys minus milliseconds
type StartableUnit = "year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second";

export const startOf = (dt: DateTime, unit: StartableUnit): DateTime => {
   const o = {} as Record<string, number>;
   switch (unit) {
      case "year":
         o.month = 1;
       // falls through
      case "quarter":
      case "month":
         o.day = 1;
       // falls through
      case "week":
      case "day":
         o.hour = 0;
       // falls through
      case "hour":
         o.minute = 0;
       // falls through
      case "minute":
         o.second = 0;
       // falls through
      case "second":
         o.millisecond = 0;
         break;
   }

   if (unit === "week") {
      o.weekday = 1;
   }

   if (unit === "quarter") {
      const q = Math.ceil(month(dt) / 3);
      o.month = (q - 1) * 3 + 1;
   }

   return o.weekday ? set(dt, isoCalendarInstance, o) : set(dt, gregorianInstance, o);
}
