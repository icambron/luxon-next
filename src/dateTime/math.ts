import DateTime, {alter, set} from "../model/dateTime";
import {bestBy} from "../impl/util";
import {month} from "./core";
import {isoCalendarInstance} from "../model/calendars/isoWeek";
import {daysInMonth, gregorianInstance, gregorianToTS} from "../model/calendars/gregorian";
import Duration, {
   toMillis,
   defaultEmpties,
   DurationValues,
   isDuration,
   ConversionAccuracy,
   shiftFractionsToMillis
} from "../model/duration";
import {negate} from "../duration/core";
import {InvalidUnitError} from "../model/errors";
import {pluralizeUnit, singularizeUnit, SingularUnit} from "../model/units";

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

export const startOf = (dt: DateTime, unit: SingularUnit): DateTime => {
   const u = singularizeUnit(unit);
   const o = {} as Record<string, number>;
   switch (u) {
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
      default: throw new InvalidUnitError(unit);
   }

   if (u === "week") {
      o.weekday = 1;
   }

   if (u === "quarter") {
      const q = Math.ceil(month(dt) / 3);
      o.month = (q - 1) * 3 + 1;
   }

   return o.weekday ? set(dt, isoCalendarInstance, o) : set(dt, gregorianInstance, o);
}

export const endOf = (dt: DateTime, unit: SingularUnit): DateTime => {
   // typescript not having |> gives me freaking hives
   const added = plus(dt, {[pluralizeUnit(unit) as string]: 1});
   const startOfNext = startOf(added, unit);
   return minus(startOfNext, {milliseconds: 1});
}

const adjustTime = (dt: DateTime, dur: Duration) : [number, number] => {
   const unfractioned = shiftFractionsToMillis(dur);
   const { years, quarters, months, weeks, days, hours, minutes, seconds, milliseconds} = defaultEmpties(unfractioned.values);

   const greg = dt.gregorian;

   const year = greg.year + years;
   const month = greg.month + months + quarters * 3;
   const day = Math.min(greg.day, daysInMonth(year, month)) + days + weeks * 7

   let [ts, offset] = gregorianToTS({ year, month, day}, dt.time, dt.offset, dt.zone);

   const millisToAdd = toMillis({ hours, minutes, seconds, milliseconds});
   if (millisToAdd !== 0) {
      ts += millisToAdd;
      offset = dt.zone.offset(ts)
   }
   return [ts, offset];
}

export const plus = (dt: DateTime, durOrObj: Duration | Partial<DurationValues>): DateTime => {
   const dur = isDuration(durOrObj) ? durOrObj : new Duration(durOrObj, "casual");
   const [ts, offset] = adjustTime(dt, dur);
   return alter(dt, ts, dt.zone, offset);
}

export const minus = (dt: DateTime, durOrObj: Duration | Partial<DurationValues>): DateTime => {
   const dur = isDuration(durOrObj) ? durOrObj : new Duration(durOrObj, "casual");
   const negated = negate(dur);
   const [ts, offset] = adjustTime(dt, negated);
   return alter(dt, ts, dt.zone, offset);
}
