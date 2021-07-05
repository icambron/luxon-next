import {
  Duration,
  DurationValues,
  alter as alterInternal,
  toIso as toIsoInternal,
  isDuration as isDurationInternal, normalizeDurationUnit, durationUnits
} from "../model/duration";
import { DurationUnit } from "../model/units";
import { InvalidUnitError } from "../model/errors";
import { asNumber } from "../impl/util";

export const duration = (values: Partial<DurationValues>) => new Duration(values);

export const negate = (dur: Duration) => {
  const negated = {} as Record<keyof DurationValues, number>;
  for (const k of Object.keys(dur.values) as Array<keyof DurationValues>) {
    negated[k] = -(dur.values[k] as number);
  }
  return new Duration(negated as Partial<DurationValues>);
};

export const toMillis = (dur: Duration): number => dur.valueOf();
export const toIso = (dur: Duration): string => toIsoInternal(dur);
export const alter = (dur: Duration, values: DurationValues): Duration => alterInternal(dur, values);
export const isDuration = (dur: Duration): boolean => isDurationInternal(dur);

// todo - as(dur, unit)

/**
 * Adds durations together to make them longer
 * @param durs - Durations to add
 */
export const plus = (...durs: Duration[]) => {
  const result : Partial<DurationValues> = {};

  durationUnits.reduce((acc, unit) => {
    const [sum, found] = durs.reduce((lilAcc, dur) =>
      [lilAcc[0] + get(dur, unit), lilAcc[1] || dur.values[unit] !== undefined] , [0, false]);
    if (found) {
      acc[unit] = sum;
    }
    return acc;
  }, result)

  return duration(result);
}

/**
 * Subtracts durations
 * @param  dur - the duration to subtract from
 * @param durs - The durations to subtract.
 */
export const minus = (dur: Duration, ...durs: Duration[]) => {
  const negated = durs.map(dur => negate(dur));
  return plus(dur, ...negated);
}

/**
 * Scale this Duration by the specified amount. Return a newly-constructed Duration.
 * ```js
 * const dur = duration({ hours: 1, minutes: 30 });
 * mapUnit(dur, x => x * 2) //=> { hours: 2, minutes: 60 }
 * mapUnit(dur, (x, u) => u === "hour" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
 * ```
 * @param dur
 * @param fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
 */
export const mapUnits = (dur: Duration, fn : (val: number, unit: DurationUnit) => number) => {
  const result : Partial<DurationValues> = {};
  durationUnits.reduce((acc, k) => {
    const v = dur.values[k];
    if (v !== undefined) {
      acc[k] = asNumber(fn(v, k));
    }
    return acc;
  }, result);
  return duration(result);
}

/**
 * Get a specific unit's value from duration.
 * ```js
 * const dur = duration({years: 2, days: 3});
 * get(dur, 'years') //=> 2
 * get(dur, 'months') //=> 0
 * get(dur, 'days') //=> 3
 * @param dur
 * @param unit
 */
export const get = (dur: Duration, unit: DurationUnit) => {
  const normalized = normalizeDurationUnit(unit);
  if (normalized == null) {
    throw new InvalidUnitError(unit);
  }
  return dur.values[normalized] || 0;
}


/**
 * Gets the years in this duration
 * @param dur
 */
export const years = (dur: Duration): number => dur.values.years || 0;

/**
 * Gets the quarters in this duration
 * @param dur
 */
export const quarters = (dur: Duration): number => dur.values.quarters || 0;

/**
 * Gets the months in this duration
 * @param dur
 */
export const months = (dur: Duration): number => dur.values.months || 0;

/**
 * Gets the weeks in this duration
 * @param dur
 */
export const weeks = (dur: Duration): number => dur.values.weeks || 0;

/**
 * Gets the days in this duration
 * @param dur
 */
export const days = (dur: Duration): number => dur.values.days || 0;

/**
 * Gets the hours in this duration
 * @param dur
 */
export const hours = (dur: Duration): number => dur.values.hours || 0;

/**
 * Gets the minutes in this duration
 * @param dur
 */
export const minutes = (dur: Duration): number => dur.values.minutes || 0;

/**
 * Gets the seconds in this duration
 * @param dur
 */
export const seconds = (dur: Duration): number => dur.values.seconds || 0;

/**
 * Gets the milliseconds in this duration
 * @param dur
 */
export const milliseconds = (dur: Duration): number => dur.values.milliseconds || 0;
