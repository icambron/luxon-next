import { DateTime, alter, set } from "../model/dateTime";
import { bestBy, intAndFraction, roundTo } from "../lib/util";
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
  ConversionAccuracy,
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
  simplePlural,
} from "../model/units";
import { getDefaultConversionAccuracy } from "../settings";

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
 * ymd(2014, 3, 3) |> startOf("month") |> toISODate(); //=> "2014-03-01"
 * ymd(2014, 3, 3) |> startOf("year") |> toISODate(); //=> "2014-01-01"
 * ymd(2014, 3, 3) |> startOf("week") |> toISODate(); //=> "2014-03-03", weeks always start on Mondays
 * ymd(2014, 3, 3, 5, 30) |> startOf("day") |> toISOTime(); //=> "00:00.000-05:00"
 * ymd(2014, 3, 3, 5, 30) |> startOf("hour") |> toISOTime(); //=> "05:00:00.000-05:00"
 * ```
 * @param unit - The unit to go to the beginning of. Can be "year", "quarter", "month", "week", "day", "hour", "minute", "second", or "millisecond".
 */
export const startOf = (unit: StartEndUnit): ((dt: DateTime) => DateTime) => {
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

  return (dt) => {
    if (u === "quarter") {
      const q = Math.ceil(month(dt) / 3);
      o.month = (q - 1) * 3 + 1;
    }

    return set(dt, o.weekday ? isoCalendarInstance : gregorianInstance, o);
  };
};

/**
 * Return the DateTime representing the end of a unit of time (meaning, the last millisecond), relative to the input date time
 * ```js
 * ymd(2014, 3, 3) |> endOf('month') |> toISO(); //=> '2014-03-31T23:59:59.999-05:00'
 * ymd(2014, 3, 3) |> endOf('year') |> toISO(); //=> '2014-12-31T23:59:59.999-05:00'
 * ymd(2014, 3, 3) |> endOf('week') |> toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
 * ymd(2014, 3, 3, 5, 30) |> endOf('day') |> toISO(); //=> '2014-03-03T23:59:59.999-05:00'
 * ymd(2014, 3, 3, 5, 30) |> endOf('hour') |> toISO(); //=> '2014-03-03T05:59:59.999-05:00'
 * ```
 * @param  unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
 */
export const endOf = (unit: StartEndUnit): ((dt: DateTime) => DateTime) => {
  const plussed = plus({ [unit as string]: 1 });
  const started = startOf(unit);
  const minussed = minus({ milliseconds: 1 });

  // need a pipe operator, please
  return (dt) => minussed(started(plussed(dt)));
};

/**
 * Add a period of time to this DateTime and return the resulting DateTime
 *
 * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `plus(dt, { hours: 24 })` may result in a different time than `plus(dt, { days: 1 })` if there's a DST shift in between.
 * ```js
 * now() |> plus(123) //~> in 123 milliseconds
 * now() |> plus({ minutes: 15 }) //~> in 15 minutes
 * now() |> plus({ days: 1 }) //~> this time tomorrow
 * now() |> plus({ days: -1 }) //~> this time yesterday
 * now() |> plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
 * now() |> plus(duration({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
 * ```
 * @param  durOrObj - The amount to add. Either a Luxon Duration, or an object like `{ hours: 2, minutes: 6 }`
 * @param conversionAccuracy - the accuracy system to use when converting fractional values. Defaults to "casual"
 */
export const plus = (
  durOrObj: Duration | Partial<DurationValues>,
  conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()
): ((dt: DateTime) => DateTime) => {
  const dur = isDuration(durOrObj) ? durOrObj : new Duration(durOrObj);
  const adjustment = adjustTime(dur, conversionAccuracy);
  return (dt) => {
    const [ts, offset] = adjustment(dt);
    return alter(dt, ts, dt.zone, offset);
  };
};

export const minus = (
  durOrObj: Duration | Partial<DurationValues>,
  conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()
): ((dt: DateTime) => DateTime) => {
  const dur = isDuration(durOrObj) ? durOrObj : new Duration(durOrObj);
  const negated = negate()(dur);
  const adjustment = adjustTime(negated, conversionAccuracy);
  return (dt) => {
    const [ts, offset] = adjustment(dt);
    return alter(dt, ts, dt.zone, offset);
  };
};

interface AccumulatedFractions {
  ints: DurationValues;
  remainderMilliseconds: number;
}

const shiftFractionsToMillis = (conversionAccuracy: ConversionAccuracy): ((dur: Duration) => Duration) => (dur) => {
  const vs = { milliseconds: 0, ...dur.values };

  const newVals = Array.from(durationUnits).reduce(
    (accum: AccumulatedFractions, k) => {
      const val = vs[k] || 0;

      const [whole, fraction] = intAndFraction(val);
      accum.ints[k] = whole;

      if (k !== "milliseconds") {
        accum.remainderMilliseconds += convert(fraction, k, "milliseconds", conversionAccuracy);
      }

      return accum;
    },
    { ints: {}, remainderMilliseconds: 0 } as AccumulatedFractions
  );

  // no fractional millis please
  newVals.ints.milliseconds = roundTo(newVals.ints.milliseconds + newVals.remainderMilliseconds, 0);

  return new Duration(newVals.ints as Partial<DurationValues>);
};

const adjustTime = (dur: Duration, conversionAccuracy: ConversionAccuracy): ((dt: DateTime) => [number, number]) => {
  const unfractioned = shiftFractionsToMillis(conversionAccuracy);

  const { years, quarters, months, weeks, days, hours, minutes, seconds, milliseconds } = defaultEmpties(
    unfractioned(dur).values
  );

  return (dt) => {
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
  };
};
