import DateTime, {alter, set} from "../model/dateTime";
import {bestBy} from "../impl/util";
import {month} from "./core";
import {isoCalendarInstance} from "../model/calendars/isoWeek";
import {daysInMonth, gregorianInstance, gregorianToTS, objToLocalTS} from "../model/calendars/gregorian";
import Duration, {quickBoil, zeroed} from "../model/duration";

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

// todo: use duration keys minus milliseconds, dealing with plurals somehow
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

const adjustTime = (dt: DateTime, dur: Duration) : [number, number] => {

   const { years, quarters, months, weeks, days, hours, minutes, seconds, milliseconds} = zeroed(dur);

   // todo: need to normalize the units to handle fractions. in the old one we do that with shiftTo

   const greg = dt.gregorian;

   const year = greg.year + years;
   const month = greg.month + months + quarters * 3;
   const day = Math.min(greg.day, daysInMonth(year, month)) + days + weeks * 7

   let [ts, offset] = gregorianToTS({ year, month, day}, dt.time, dt.offset, dt.zone);

   const millisToAdd = quickBoil({ hours, minutes, seconds, milliseconds}, dur.conversionAccuracy);
   if (millisToAdd !== 0) {
      ts += millisToAdd;
      offset = dt.zone.offset(ts)
   }
   return [ts, offset];
}

export const plus = (dt: DateTime, dur: Duration): DateTime => {
   const [ts, offset] = adjustTime(dt, dur);
   return alter(dt, ts, dt.zone, offset);
}
