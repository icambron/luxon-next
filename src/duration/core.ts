import { InvalidUnitError } from "../errors";
import { asNumber } from "../impl/util/numeric";
import { alter, durationUnits, fromValues, normalizeDurationUnit, toIso as toIsoInternal } from "../impl/duration";
import { Duration, DurationUnit, DurationValues } from "../types";
import { isDuration as isDurationInternal } from "../impl/util/typeCheck";

export const duration = fromValues;
export const durFromMillis = (milliseconds: number) => duration({ milliseconds });

export const durNegate = (dur: Duration): Duration => {
  const negated = {} as Record<keyof DurationValues, number>;
  for (const k of Object.keys(dur.values) as Array<keyof DurationValues>) {
    negated[k] = -(dur.values[k] as number);
  }
  return fromValues(negated as Partial<DurationValues>);
};

export const durToMillis = (dur: Duration): number => dur.valueOf();
export const durToISO = (dur: Duration): string => toIsoInternal(dur);
export const durAlter = alter;
export const isDuration = isDurationInternal;
export const durValues = (dur: Duration): Partial<DurationValues> => ({ ...dur.values });

/**
 * Adds durations together to make them longer
 * @param durs - Durations to add
 */
export const durPlus = (...durs: Duration[]): Duration => {
  const result: Partial<DurationValues> = {};

  durationUnits.reduce((acc, unit) => {
    const [sum, found] = durs.reduce(
      (lilAcc, dur) => [lilAcc[0] + durGet(dur, unit), lilAcc[1] || dur.values[unit] !== undefined],
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
 * @param  dur - the duration to subtract from
 * @param durs - The durations to subtract.
 */
export const durMinus = (dur: Duration, ...durs: Duration[]) => {
  const negated = durs.map(durNegate);
  return durPlus(dur, ...negated);
};

/**
 * Scale this Duration by the specified amount. Return a newly-constructed Duration.
 * ```js
 * const dur = duration({ hours: 1, minutes: 30 });
 * dur |> mapUnit( x => x * 2) |> toGregorian() //=> { hours: 2, minutes: 60 }
 * dur |> mapUnit( (x, u) => u === "hour" ? x * 2 : x) |> toGregorian() //=> { hours: 2, minutes: 30 }
 * ```
 * @param fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
 */
export const durMapInputs = (dur: Duration, fn: (val: number, unit: DurationUnit) => number): Duration => {
  const result = durationUnits.reduce((acc, k) => {
    const v = dur.values[k];
    if (v !== undefined) {
      acc[k] = asNumber(fn(v, k));
    }
    return acc;
  }, {} as Partial<DurationValues>);
  return duration(result);
};

/**
 * Get a specific unit's value from duration.
 * ```js
 * const dur = duration({years: 2, days: 3});
 * dur |> get('years') //=> 2
 * dur |> get('months') //=> 0
 * dur |> get('days') //=> 3
 */
export const durGet = (dur: Duration, unit: DurationUnit): number => {
  const normalized = normalizeDurationUnit(unit);
  if (normalized == null) {
    throw new InvalidUnitError(unit);
  }
  return dur.values[normalized] || 0;
};

/**
 * Gets the years in this duration
 */
export const durYears = (dur: Duration): number => dur.values.years || 0;

/**
 * Gets the quarters in this duration
 */
export const durQuarters = (dur: Duration): number => dur.values.quarters || 0;

/**
 * Gets the months in this duration
 */
export const durMonths = (dur: Duration): number => dur.values.months || 0;

/**
 * Gets the weeks in this duration
 */
export const durWeeks = (dur: Duration): number => dur.values.weeks || 0;

/**
 * Gets the days in this duration
 */
export const durDays = (dur: Duration): number => dur.values.days || 0;

/**
 * Gets the hours in this duration
 */
export const durHours = (dur: Duration): number => dur.values.hours || 0;

/**
 * Gets the minutes in this duration
 */
export const durMinutes = (dur: Duration): number => dur.values.minutes || 0;

/**
 * Gets the seconds in this duration
 */
export const durSeconds = (dur: Duration): number => dur.values.seconds || 0;

/**
 * Gets the milliseconds in this duration
 */
export const durMilliseconds = (dur: Duration): number => dur.values.milliseconds || 0;
