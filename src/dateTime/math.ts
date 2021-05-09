import {DateTime,  alter, set } from "../model/dateTime";
import { bestBy, intAndFraction, roundTo } from "../impl/util";
import { month } from "./core";
import { isoCalendarInstance } from "../model/calendars/isoWeek";
import { daysInMonth, gregorianInstance, gregorianToTS } from "../model/calendars/gregorian";
import {
  Duration,
  toMillis,
  defaultEmpties,
  DurationValues,
  isDuration,
  convert,
  durationUnits,
} from "../model/duration";
import { negate } from "../duration/core";
import { InvalidUnitError } from "../model/errors";
import {
  gregorianUnits,
  GregorianUnit,
  miscDurationUnits,
  MiscDurationUnit,
  TimeUnit,
  timeUnits,
  buildNormalizer,
  DurationUnit,
  simplePlural,
} from "../model/units";

/**
 * Return the max of several date times, or `undefined` if the input array is empty
 * @param dts - the DateTimes from which to choose the maximum
 */
export const max = (dts: Array<DateTime>): DateTime => bestBy(dts, (i) => i.valueOf(), Math.max);

/**
 * Return the min of several date times, or `undefined` if the input array is empty
 * @param {Array<DateTime>} dts - the DateTimes from which to choose the minimum
 */
export const min = (dts: Array<DateTime>): DateTime => bestBy(dts, (i) => i.valueOf(), Math.min);

/**
 * Valid units to pass to `startOf` and `endOf`
 */
export type StartEndUnit = GregorianUnit | TimeUnit | MiscDurationUnit;

const startEndUnits: Array<StartEndUnit> = [...gregorianUnits, ...timeUnits, ...miscDurationUnits];
const normalizeStartEndUnit = buildNormalizer(startEndUnits, simplePlural);

/**
 * Return the DateTime representing the beginning of a unit of time, relative to the input date time
 * ```js
 * startOf(ymd(2014, 3, 3), "month") |> toISODate; //=> "2014-03-01"
 * startOf(ymd(2014, 3, 3), "year") |> toISODate; //=> "2014-01-01"
 * startOf(ymd(2014, 3, 3), "week") |> toISODate; //=> "2014-03-03", weeks always start on Mondays
 * startOf(ymd(2014, 3, 3, 5, 30), "day") |> toISOTime; //=> "00:00.000-05:00"
 * startOf(ymd(2014, 3, 3, 5, 30), "hour") |> toISOTime; //=> "05:00:00.000-05:00"
 * ```
 * @param dt - The DateTime to move. E.g. if dt is May 3 at 4:00, then `startOf(dt, "day")` will get May 3 at 00:00
 * @param unit - The unit to go to the beginning of. Can be "year", "quarter", "month", "week", "day", "hour", "minute", "second", or "millisecond".
 */
export const startOf = (dt: DateTime, unit: StartEndUnit): DateTime => {
  const u = normalizeStartEndUnit(unit);
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
    default:
      throw new InvalidUnitError(unit);
  }

  if (u === "week") {
    o.weekday = 1;
  }

  if (u === "quarter") {
    const q = Math.ceil(month(dt) / 3);
    o.month = (q - 1) * 3 + 1;
  }

  return o.weekday ? set(dt, isoCalendarInstance, o) : set(dt, gregorianInstance, o);
};

/**
 * Return the DateTime representing the end of a unit of time (meaning, the last millisecond), relative to the input date time
 * ```js
 * endOf(ymd(2014, 3, 3), 'month') |> toISO(); //=> '2014-03-31T23:59:59.999-05:00'
 * endOf(ymd(2014, 3, 3), 'year') |> toISO(); //=> '2014-12-31T23:59:59.999-05:00'
 * endOf(ymd(2014, 3, 3), 'week') |> toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
 * endOf(ymd(2014, 3, 3, 5, 30), 'day') |> toISO(); //=> '2014-03-03T23:59:59.999-05:00'
 * endOf(ymd(2014, 3, 3, 5, 30), 'hour') |> toISO(); //=> '2014-03-03T05:59:59.999-05:00'
 * ```
 * @param dt - The DateTime to move. E.g. if dt is May 3 at 4:00, then `endOf(dt, "day")` will get May 3 at 12:59:59.999
 * @param  unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
 */
export const endOf = (dt: DateTime, unit: StartEndUnit): DateTime => {
  // typescript not having |> gives me freaking hives
  const added = plus(dt, { [unit as string]: 1 });
  const startOfNext = startOf(added, unit);
  return minus(startOfNext, { milliseconds: 1 });
};

/**
 * Add a period of time to this DateTime and return the resulting DateTime
 *
 * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `plus(dt, { hours: 24 })` may result in a different time than `plus(dt, { days: 1 })` if there's a DST shift in between.
 * ```js
 * plus(now(), 123) //~> in 123 milliseconds
 * plus(now(), { minutes: 15 }) //~> in 15 minutes
 * plus(now(), { days: 1 }) //~> this time tomorrow
 * plus(now(), { days: -1 }) //~> this time yesterday
 * plus(now(), { hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
 * plus(duration({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
 * ```
 * @param dt - the DateTime to add to
 * @param  durOrObj - The amount to add. Either a Luxon Duration, or an object like `{ hours: 2, minutes: 6 }`
 */
export const plus = (dt: DateTime, durOrObj: Duration | Partial<DurationValues>): DateTime => {
  const dur = isDuration(durOrObj) ? durOrObj : new Duration(durOrObj, "casual");
  const [ts, offset] = adjustTime(dt, dur);
  return alter(dt, ts, dt.zone, offset);
};

export const minus = (dt: DateTime, durOrObj: Duration | Partial<DurationValues>): DateTime => {
  const dur = isDuration(durOrObj) ? durOrObj : new Duration(durOrObj, "casual");
  const negated = negate(dur);
  const [ts, offset] = adjustTime(dt, negated);
  return alter(dt, ts, dt.zone, offset);
};

type MutableDurationValues = {
  [unit in DurationUnit]: number;
};

interface AccumulatedFractions {
  ints: MutableDurationValues;
  remainderMilliseconds: number;
}

function shiftFractionsToMillis(dur: Duration): Duration {
  const vs = { milliseconds: 0, ...dur.values };

  const newVals = Array.from(durationUnits).reduce(
    (accum: AccumulatedFractions, k) => {
      const val = vs[k] || 0;

      const [whole, fraction] = intAndFraction(val);
      accum.ints[k] = whole;

      if (k !== "milliseconds") {
        accum.remainderMilliseconds += convert(fraction, k, "milliseconds", dur.conversionAccuracy);
      }

      return accum;
    },
    { ints: {}, remainderMilliseconds: 0 } as AccumulatedFractions
  );

  // no fractional millis please
  newVals.ints.milliseconds = roundTo(newVals.ints.milliseconds + newVals.remainderMilliseconds, 0);

  return new Duration(newVals.ints as Partial<DurationValues>, dur.conversionAccuracy);
}

function adjustTime(dt: DateTime, dur: Duration): [number, number] {
  const unfractioned = shiftFractionsToMillis(dur);
  const { years, quarters, months, weeks, days, hours, minutes, seconds, milliseconds } = defaultEmpties(
    unfractioned.values
  );

  const greg = dt.gregorian;

  const year = greg.year + years;
  const month = greg.month + months + quarters * 3;
  const day = Math.min(greg.day, daysInMonth(year, month)) + days + weeks * 7;

  let [ts, offset] = gregorianToTS({ year, month, day }, dt.time, dt.offset, dt.zone);

  const millisToAdd = toMillis({ hours, minutes, seconds, milliseconds });
  if (millisToAdd !== 0) {
    ts += millisToAdd;
    offset = dt.zone.offset(ts);
  }
  return [ts, offset];
}

