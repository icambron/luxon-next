import { isoWeekCalendarInstance } from "../impl/calendars/isoWeek";
import { gregorianInstance, gregorianToTS } from "../impl/calendars/gregorian";
import { normalizeUnit, gregorianUnits, miscDurationUnits, simplePlural, timeUnits } from "../impl/util/units";
import { intAndFraction, roundTo } from "../impl/util/numeric";
import { bestBy } from "../impl/util/array";
import { alter, set } from "../impl/dateTime";
import { convert, defaultEmpties, durationUnits, fromValues, toMillis } from "../impl/duration";
import { daysInMonth } from "../impl/util/dateMath";
import { ConversionAccuracy, DateTime, Duration, DurationValues, ComparableUnit, ComparableUnitPlural } from "../types";
import { isDuration } from "../impl/util/typeCheck";
import { InvalidUnitError } from "../errors";
import { getDefaultConversionAccuracy } from "../settings";

// weird dep
import { durNegate } from "../duration/core";
import { setZone } from "../impl/zone/setZone";

/**
 * Return the max of several date times, or `undefined` if the input array is empty
 * @param dts - the DateTimes from which to choose the maximum
 */
export const max = (dts: Array<DateTime>): DateTime | null => bestBy(dts, (i) => i.valueOf(), Math.max);

/**
 * Return the min of several date times, or `undefined` if the input array is empty
 * @param dts - the DateTimes from which to choose the minimum
 */
export const min = (dts: Array<DateTime>): DateTime | null => bestBy(dts, (i) => i.valueOf(), Math.min);

const startEndUnits: Array<ComparableUnit> = [...gregorianUnits, ...timeUnits, ...miscDurationUnits];
const normalizeComparableUnit = (unit: string, throwOnError?: boolean) => normalizeUnit("startunits", startEndUnits, simplePlural, unit, throwOnError);

/**
 * Return the DateTime representing the beginning of a unit of time, relative to the input date time
 * ```js
 * ymd(2014, 3, 3) |> startOf(%, "month") |> toISODate(%); //=> "2014-03-01"
 * ymd(2014, 3, 3) |> startOf(%, "year") |> toISODate(%); //=> "2014-01-01"
 * ymd(2014, 3, 3) |> startOf(%, "week") |> toISODate(%); //=> "2014-03-03", weeks always start on Mondays
 * ymd(2014, 3, 3, 5, 30) |> startOf(%, "day") |> toISOTime(%); //=> "00:00.000-05:00"
 * ymd(2014, 3, 3, 5, 30) |> startOf(%, "hour") |> toISOTime(%); //=> "05:00:00.000-05:00"
 * ```
 * @param unit - The unit to go to the beginning of. Can be "year", "quarter", "month", "week", "day", "hour", "minute", "second", or "millisecond".
 */
export const startOf = (dt: DateTime, unit: ComparableUnit | ComparableUnitPlural): DateTime => {
  const u = normalizeComparableUnit(unit);
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
    case "millisecond": break;
    default:
      throw new InvalidUnitError(unit);
  }

  if (u === "week") {
    o.weekday = 1;
  }

  if (u === "quarter") {
    const q = Math.ceil(dt.gregorian.month / 3);
    o.month = (q - 1) * 3 + 1;
  }

  return o.weekday ? set(dt, isoWeekCalendarInstance, o) : set(dt, gregorianInstance, o);
};

export const hasSame = (first: DateTime, second: DateTime, unit: ComparableUnit): boolean => {
    const inputMs = second.valueOf();
    const firstAdjusted = setZone(first, second.zone, { keepLocalTime: true });
    return +startOf(firstAdjusted, unit) <= +inputMs && +inputMs <= +endOf(firstAdjusted, unit);
}

/**
 * Return the DateTime representing the end of a unit of time (meaning, the last millisecond), relative to the input date time
 * ```js
 * ymd(2014, 3, 3) |> endOf(%, 'month') |> toISO(%); //=> '2014-03-31T23:59:59.999-05:00'
 * ymd(2014, 3, 3) |> endOf(%, 'year') |> toISO(%); //=> '2014-12-31T23:59:59.999-05:00'
 * ymd(2014, 3, 3) |> endOf(%, 'week') |> toISO(%); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
 * ymd(2014, 3, 3, 5, 30) |> endOf(%, 'day') |> toISO(%); //=> '2014-03-03T23:59:59.999-05:00'
 * ymd(2014, 3, 3, 5, 30) |> endOf(%, 'hour') |> toISO(%); //=> '2014-03-03T05:59:59.999-05:00'
 * ```
 * @param  unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
 */
export const endOf = (dt: DateTime, unit: ComparableUnit): DateTime => {
  // need a pipe operator, please
  const plussed = plus(dt, { [unit]: 1 });
  const started = startOf(plussed, unit);
  return minus(started, { milliseconds: 1 });
};

/**
 * Add a period of time to this DateTime and return the resulting DateTime
 *
 * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `plus(dt, { hours: 24 })` may result in a different time than `plus(dt, { days: 1 })` if there's a DST shift in between.
 * ```js
 * now() |> plus(%, 123) //~> in 123 milliseconds
 * now() |> plus(%, { minutes: 15 }) //~> in 15 minutes
 * now() |> plus(%, { days: 1 }) //~> this time tomorrow
 * now() |> plus(%, { days: -1 }) //~> this time yesterday
 * now() |> plus(%, { hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
 * now() |> plus(%, duration({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
 * ```
 * @param dt
 * @param durOrObj - The amount to add. Either a Luxon Duration, or an object like `{ hours: 2, minutes: 6 }`
 * @param conversionAccuracy - the accuracy system to use when converting fractional values. Defaults to "casual"
 */
export const plus = (
  dt: DateTime,
  durOrObj: Duration | Partial<DurationValues>,
  conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()
): DateTime => {
  const dur = isDuration(durOrObj) ? durOrObj : fromValues(durOrObj);
  const [ts, offset] = adjustTime(dt, dur, conversionAccuracy);
  return alter(ts, dt.zone, offset)(dt);
};

export const minus = (
  dt: DateTime,
  durOrObj: Duration | Partial<DurationValues>,
  conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()
): DateTime => {
  const dur = isDuration(durOrObj) ? durOrObj : fromValues(durOrObj);
  const negated = durNegate(dur);
  const [ts, offset] = adjustTime(dt, negated, conversionAccuracy);
  return alter(ts, dt.zone, offset)(dt);
};

interface AccumulatedFractions {
  ints: Partial<DurationValues>;
  remain: number;
}

const shiftFractionsToMillis =
  (dur: Duration, conversionAccuracy: ConversionAccuracy):Duration => {
    const vs = { milliseconds: 0, ...dur.values };

    const newVals = Array.from(durationUnits).reduce(
      (accum: AccumulatedFractions, k) => {
        const val = vs[k] || 0;

        const [whole, fraction] = intAndFraction(val);
        accum.ints[k] = whole;

        if (k !== "milliseconds") {
          accum.remain += convert(fraction, k, "milliseconds", conversionAccuracy);
        }

        return accum;
      },
      { ints: {}, remain: 0 }
    );

    // no fractional millis please
    newVals.ints.milliseconds = roundTo((newVals.ints.milliseconds || 0) + newVals.remain, 0);

    return fromValues(newVals.ints);
  };

const adjustTime = (dt: DateTime, dur: Duration, conversionAccuracy: ConversionAccuracy): [number, number] => {
  const unfractioned = shiftFractionsToMillis(dur, conversionAccuracy);

  const { years, quarters, months, weeks, days, hours, minutes, seconds, milliseconds } = defaultEmpties(unfractioned.values);

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
