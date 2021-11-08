import { durFromMillis, durFromValues, durPlus as durationPlus } from "./core";
import { as, durShiftTo } from "./convert";
import { toUTC } from "../dateTime/zone";
import { plus, startOf } from "../dateTime/math";
import { month, quarter, year } from "../dateTime/core";
import { isUndefined } from "../impl/util/typeCheck";
import { maybeArray } from "../impl/util/array";
import { DateTime, Duration, DurationUnit, DurationValues } from "../types";

type Differ = (a: DateTime, b: DateTime) => number;

type HighOrderDiff = {
  results: Partial<DurationValues>;
  cursor: DateTime;
  highWater?: DateTime;
  lowestOrder?: DurationUnit;
};

const dayDiff = (earlier: DateTime, later: DateTime): number => {
  const utcDayStart = (dt: DateTime) => {
    const shifted = toUTC(0, { keepLocalTime: true })(dt);
    const start = startOf("day")(shifted);
    return +start;
  };
  const ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(as("days")(durFromMillis(ms)));
};

const differs: [DurationUnit, Differ][] = [
  ["years", (a, b) => year(b) - year(a)],
  ["quarters", (a, b) => quarter(b) - quarter(a) + (year(b) - year(a)) * 4],
  ["months", (a, b) => month(b) - month(a) + (year(b) - year(a)) * 12],
  [
    "weeks",
    (a, b) => {
      const days = dayDiff(a, b);
      return (days - (days % 7)) / 7;
    },
  ],
  ["days", dayDiff],
];

const highOrderDiffs = (cursor: DateTime, later: DateTime, units: DurationUnit[]): HighOrderDiff => {
  const results: Partial<DurationValues> = {};
  let lowestOrder: DurationUnit | undefined = undefined;
  let highWater: DateTime | undefined = undefined;

  for (const [unit, differ] of differs) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;

      let delta = differ(cursor, later);
      highWater = plus({ [unit]: delta })(cursor);

      if (highWater > later) {
        cursor = plus({ [unit]: delta - 1 })(cursor);
        delta -= 1;
      } else {
        cursor = highWater;
      }

      results[unit] = delta;
    }
  }

  return { cursor, results, highWater, lowestOrder };
};

export const diff = (later: DateTime, earlier: DateTime, units?: DurationUnit[] | DurationUnit): Duration => {
  if (isUndefined(units)) {
    units = ["milliseconds"];
  } else units = maybeArray(units);

  let { cursor, results, highWater, lowestOrder } = highOrderDiffs(earlier, later, units);

  const remainingMillis = +later - +cursor;

  const lowerOrderUnits = units.filter((u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0);

  if (lowerOrderUnits.length === 0 && highWater && lowestOrder) {
    if (+highWater < +later) {
      highWater = plus({ [lowestOrder]: 1 })(cursor);
    }

    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (+highWater - +cursor);
    }
  }

  const duration = durFromValues(results);

  if (lowerOrderUnits.length > 0) {
    const simple = durFromMillis(remainingMillis);
    const shiftedToUnits = durShiftTo(lowerOrderUnits)(simple);
    return durationPlus(duration, shiftedToUnits);
  } else {
    return duration;
  }
};
