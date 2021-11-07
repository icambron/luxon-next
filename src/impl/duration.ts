import { ConversionAccuracy, DurationUnit, DurationValues } from "../types/duration";
import { getDefaultConversionAccuracy } from "../settings";
import { Duration, pickMatrix } from "../model/Duration";

export const convert = (
  val: number,
  from: DurationUnit,
  to: DurationUnit,
  conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()
): number => {
  return pickMatrix(conversionAccuracy)[from][to] * val;
};

export const defaultEmpties = (values: Partial<DurationValues>): DurationValues => ({ ...durationZeroes, ...values });

export const isDuration = (obj: any): obj is Duration => obj && obj.isLuxonDuration;

// curry!
export const alter =
  (values: Partial<DurationValues>): ((dur: Duration) => Duration) =>
    (dur) =>
      new Duration({ ...dur.values, ...values });

const durationZeroes: DurationValues = {
  years: 0,
  quarters: 0,
  months: 0,
  weeks: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0
};

