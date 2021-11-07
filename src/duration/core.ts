import {
  Duration,
  toIso as toIsoInternal,
  normalizeDurationUnit,
  durationUnits,
} from "../model/Duration";
import { InvalidUnitError } from "../errors";
import { DurationUnit, DurationValues } from "../types/duration";
import { asNumber } from "../utils/numeric";
import { alter as alterInternal, isDuration as isDurationInternal } from "../impl/duration";

export const duration = (values: Partial<DurationValues>) => new Duration(values);
export const durFromMillis = (milliseconds: number) => duration({ milliseconds });

export const durNegate = (): ((dur: Duration) => Duration) => {
  const negated = {} as Record<keyof DurationValues, number>;
  return (dur) => {
    for (const k of Object.keys(dur.values) as Array<keyof DurationValues>) {
      negated[k] = -(dur.values[k] as number);
    }
    return new Duration(negated as Partial<DurationValues>);
  };
};

export const durFromValues = (values: Partial<DurationValues>): Duration => new Duration(values);

export const durToMillis = (): ((dur: Duration) => number) => (dur) => dur.valueOf();
export const durToISO = (): ((dur: Duration) => string) => (dur) => toIsoInternal(dur);
export const durAlter = (values: Partial<DurationValues>): ((dur: Duration) => Duration) => alterInternal(values);
export const isDuration = (dur: Duration): boolean => isDurationInternal(dur);
export const durValues = (dur: Duration): Partial<DurationValues> => ({ ...dur.values });

/**
 * Adds durations together to make them longer
 * @param durs - Durations to add
 */
export const durPlus = (...durs: Duration[]): Duration => {
  const result: Partial<DurationValues> = {};

  durationUnits.reduce((acc, unit) => {
    const [sum, found] = durs.reduce(
      (lilAcc, dur) => [lilAcc[0] + durGet(unit)(dur), lilAcc[1] || dur.values[unit] !== undefined],
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
  const negated = durs.map(durNegate());
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
export const durMapInputs = (fn: (val: number, unit: DurationUnit) => number): ((dur: Duration) => Duration) => {
  const result: Partial<DurationValues> = {};
  return (dur) => {
    durationUnits.reduce((acc, k) => {
      const v = dur.values[k];
      if (v !== undefined) {
        acc[k] = asNumber(fn(v, k));
      }
      return acc;
    }, result);
    return duration(result);
  };
};

/**
 * Get a specific unit's value from duration.
 * ```js
 * const dur = duration({years: 2, days: 3});
 * dur |> get('years') //=> 2
 * dur |> get('months') //=> 0
 * dur |> get('days') //=> 3
 * @param unit
 */
export const durGet = (unit: DurationUnit): ((dur: Duration) => number) => {
  const normalized = normalizeDurationUnit(unit);
  if (normalized == null) {
    throw new InvalidUnitError(unit);
  }
  return (dur) => dur.values[normalized] || 0;
};

/**
 * Gets the years in this duration
 * @param dur
 */
export const durYears = (dur: Duration): number => dur.values.years || 0;

/**
 * Gets the quarters in this duration
 * @param dur
 */
export const durQuarters = (dur: Duration): number => dur.values.quarters || 0;

/**
 * Gets the months in this duration
 * @param dur
 */
export const durMonths = (dur: Duration): number => dur.values.months || 0;

/**
 * Gets the weeks in this duration
 * @param dur
 */
export const durWeeks = (dur: Duration): number => dur.values.weeks || 0;

/**
 * Gets the days in this duration
 * @param dur
 */
export const durDays = (dur: Duration): number => dur.values.days || 0;

/**
 * Gets the hours in this duration
 * @param dur
 */
export const durHours = (dur: Duration): number => dur.values.hours || 0;

/**
 * Gets the minutes in this duration
 * @param dur
 */
export const durMinutes = (dur: Duration): number => dur.values.minutes || 0;

/**
 * Gets the seconds in this duration
 * @param dur
 */
export const durSeconds = (dur: Duration): number => dur.values.seconds || 0;

/**
 * Gets the milliseconds in this duration
 * @param dur
 */
export const durMilliseconds = (dur: Duration): number => dur.values.milliseconds || 0;
