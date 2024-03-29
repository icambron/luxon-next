import { asNumber } from "../impl/util/numeric";
import { alter, durationUnits, fromValues, normalizeDurationUnit, toIso as toIsoInternal } from "../impl/duration";
import { Duration, DurationUnit, DurationValues } from "../types";
import { isDuration as isDurationInternal } from "../impl/util/typeCheck";

export const duration = fromValues;
export const durFromMillis = (milliseconds: number) => duration({ milliseconds });

export const durNegate = (dur: Duration): Duration => {
  const negated: Partial<DurationValues> = {};
  for (const k of Object.keys(dur._values) as DurationUnit[]) {
    negated[k] = -(dur.values[k] as number);
  }
  return fromValues(negated);
};

export const durToMillis = (dur: Duration): number => dur.valueOf();
export const durToISO = (dur: Duration): string => toIsoInternal(dur);
export const durAlter = alter;
export const isDuration = isDurationInternal;
export const durValues = (dur: Duration): Partial<DurationValues> => ({ ...dur._values });

/**
 * Adds durations together to make them longer
 * @param durs - Durations to add
 */
export const durPlus = (...durs: Duration[]): Duration => {
  const result: Partial<DurationValues> = {};

  durationUnits.reduce((acc, unit) => {
    const [sum, found] = durs.reduce(
      (lilAcc, dur) => [lilAcc[0] + durGet(dur, unit), lilAcc[1] || dur._values[unit] !== undefined],
      [0, false]
    );
    if (found) {
      acc[unit] = sum;
    }
    return acc;
  }, result);

  return duration(result);
};

/**
 * Subtracts durations
 * @param dur - the duration to subtract from
 * @param durs - The durations to subtract.
 */
export const durMinus = (dur: Duration, ...durs: Duration[]) => {
  const negated = durs.map(durNegate);
  return durPlus(dur, ...negated);
};

/**
 * Scale a Duration by the specified function. Return a newly-constructed Duration.
 * @example
 * ```js
 * const dur = duration({ hours: 1, minutes: 30 });
 * mapUnit(dur, x => x * 2) |> toGregorian(%) //=> { hours: 2, minutes: 60 }
 * mapUnit(dur, (x, u) => u === "hour" ? x * 2 : x) |> toGregorian(%) //=> { hours: 2, minutes: 30 }
 * ```
 * @param dur - The duration to map the values
 * @param fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
 */
export const durMapInputs = (dur: Duration, fn: (val: number, unit: DurationUnit) => number): Duration => {
  const result = durationUnits.reduce((acc, k) => {
    const v = dur._values[k];
    if (v !== undefined) {
      acc[k] = asNumber(fn(v, k));
    }
    return acc;
  }, {} as Partial<DurationValues>);
  return duration(result);
};

/**
 * Get a specific unit's value from duration.
 * @example
 * ```js
 * const dur = duration({years: 2, days: 3});
 * get(dur, 'years') //=> 2
 * get(dur, 'months') //=> 0
 * get(dur, 'days') //=> 3
 */
export const durGet = (dur: Duration, unit: DurationUnit): number => {
  const normalized = normalizeDurationUnit(unit);
  return dur._values[normalized] || 0;
};

/**
 * Gets the years in this duration
 */
export const durYears = (dur: Duration): number => dur._values.years || 0;

/**
 * Gets the quarters in this duration
 */
export const durQuarters = (dur: Duration): number => dur._values.quarters || 0;

/**
 * Gets the months in this duration
 */
export const durMonths = (dur: Duration): number => dur._values.months || 0;

/**
 * Gets the weeks in this duration
 */
export const durWeeks = (dur: Duration): number => dur._values.weeks || 0;

/**
 * Gets the days in this duration
 */
export const durDays = (dur: Duration): number => dur._values.days || 0;

/**
 * Gets the hours in this duration
 */
export const durHours = (dur: Duration): number => dur._values.hours || 0;

/**
 * Gets the minutes in this duration
 */
export const durMinutes = (dur: Duration): number => dur._values.minutes || 0;

/**
 * Gets the seconds in this duration
 */
export const durSeconds = (dur: Duration): number => dur._values.seconds || 0;

/**
 * Gets the milliseconds in this duration
 */
export const durMilliseconds = (dur: Duration): number => dur._values.milliseconds || 0;
