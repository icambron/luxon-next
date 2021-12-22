import { durFromMillis, duration, durPlus as durationPlus, durNegate } from "./core";
import { durAs, durShiftTo } from "./convert";
import { toUTC } from "../dateTime/zone";
import { plus, startOf } from "../dateTime/math";
import { month, quarter, year } from "../dateTime/core";
import { maybeArray } from "../impl/util/array";
import { DateTime, Duration, DurationUnit, DurationValues } from "../types";
import { normalizeDurationUnit } from "../impl/duration";

type Differ = (a: DateTime, b: DateTime) => number;

type HighOrderDiff = {
  results: Partial<DurationValues>;
  cursor: DateTime;
  highWater?: DateTime;
  lowestOrder?: DurationUnit;
};

const dayDiff = (earlier: DateTime, later: DateTime): number => {
  const utcDayStart = (dt: DateTime) => {
    const shifted = toUTC(dt, { keepLocalTime: true });
    const start = startOf(shifted, "day");
    return +start;
  };
  const ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(durAs(durFromMillis(ms), "days"));
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
      highWater = plus(cursor, { [unit]: delta });

      if (highWater > later) {
        cursor = plus(cursor, { [unit]: delta - 1 });
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
  let flipped = false;
  if (+later < +earlier) {
    const tmp = later;
    later = earlier;
    earlier = tmp;
    flipped = true;
  }

  let normalizedUnits: DurationUnit[];
  if (!units) {
    normalizedUnits = ["milliseconds"];
  } else normalizedUnits = maybeArray(units);

  normalizedUnits = normalizedUnits.map(normalizeDurationUnit);

  let { cursor, results, highWater, lowestOrder } = highOrderDiffs(earlier, later, normalizedUnits);

  const remainingMillis = +later - +cursor;

  const lowerOrderUnits = normalizedUnits.filter(
    (u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0
  );

  if (lowerOrderUnits.length === 0 && highWater && lowestOrder) {
    if (+highWater < +later) {
      highWater = plus(cursor, { [lowestOrder]: 1 });
    }

    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (+highWater - +cursor);
    }
  }

  const dur = duration(results);

  let result;
  if (lowerOrderUnits.length > 0) {
    const simple = durFromMillis(remainingMillis);
    const shiftedToUnits = durShiftTo(simple, lowerOrderUnits);
    result = durationPlus(dur, shiftedToUnits);
  } else {
    result = dur;
  }

  return flipped ? durNegate(result) : result;
};
