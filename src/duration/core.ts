import {
  Duration,
  DurationValues,
  alter as alterInternal,
  toIso as toIsoInternal,
  isDuration as isDurationInternal,
} from "../model/duration";

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
