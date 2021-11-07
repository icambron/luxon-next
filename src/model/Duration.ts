import { getDefaultConversionAccuracy } from "../settings";
import {
  buildNormalizer,
  gregorianUnitsPlural,
  miscDurationUnitsPlural,
  normalizeUnitBundle,
  simpleSingular,
  timeUnitsPlural
} from "../utils/units";
import { ConversionAccuracy, ConversionMatrix, DurationUnit, DurationValues } from "../types/duration";
import { roundTo } from "../utils/numeric";
import { isUndefined } from "../utils/typeCheck";

export class Duration {
  private readonly _values: Partial<DurationValues>;
  readonly isLuxonDuration = true;

  constructor(values: Partial<DurationValues>) {
    this._values = normalizeUnitBundle(values, normalizeDurationUnit);
  }

  get values(): Partial<DurationValues> {
    return this._values;
  }

  toJson = (): string => toIso(this);

  toString = (): string => toIso(this);

  valueOf = (): number => toMillis(this.values, getDefaultConversionAccuracy());
}

export const durationUnits: Array<DurationUnit> = [
  ...gregorianUnitsPlural,
  ...timeUnitsPlural,
  ...miscDurationUnitsPlural,
];

export const normalizeDurationUnit = buildNormalizer<DurationUnit>(durationUnits, simpleSingular);

export const toIso = (dur: Duration): string => {
  let s = "P";
  if (dur.values.years !== 0) s += dur.values.years + "Y";
  if (dur.values.months !== 0 || dur.values.quarters !== 0)
    s += (dur.values.months || 0) + (dur.values.quarters || 0) * 3 + "M";
  if (dur.values.weeks !== 0) s += dur.values.weeks + "W";
  if (dur.values.days !== 0) s += dur.values.days + "D";
  if (dur.values.hours !== 0 || dur.values.minutes !== 0 || dur.values.seconds !== 0 || dur.values.milliseconds !== 0)
    s += "T";
  if (dur.values.hours !== 0) s += dur.values.hours + "H";
  if (dur.values.minutes !== 0) s += dur.values.minutes + "M";
  if (dur.values.seconds !== 0 || dur.values.milliseconds !== 0)
    // this will handle "floating point madness" by removing extra decimal places
    // https://stackoverflow.com/questions/588004/is-floating-point-math-broken
    s += roundTo((dur.values.seconds || 0) + (dur.values.milliseconds || 0) / 1000, 3) + "S";
  if (s === "P") s += "T0S";
  return s;
};

export const pickMatrix = (accuracy: ConversionAccuracy): ConversionMatrix =>
  accuracy === "casual" ? casualMatrix : accurateMatrix;

const lowOrderMatrix: ConversionMatrix = {
  weeks: {
    days: 7,
    hours: 7 * 24,
    minutes: 7 * 24 * 60,
    seconds: 7 * 24 * 60 * 60,
    milliseconds: 7 * 24 * 60 * 60 * 1000
  },
  days: {
    hours: 24,
    minutes: 24 * 60,
    seconds: 24 * 60 * 60,
    milliseconds: 24 * 60 * 60 * 1000
  },
  hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1000 },
  minutes: { seconds: 60, milliseconds: 60 * 1000 },
  seconds: { milliseconds: 1000 }
};

const casualMatrix: ConversionMatrix = {
  years: {
    months: 12,
    quarters: 4,
    weeks: 52,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1000
  },
  quarters: {
    months: 3,
    weeks: 13,
    days: 91,
    hours: 91 * 24,
    minutes: 91 * 24 * 60,
    seconds: 91 * 24 * 60 * 60,
    milliseconds: 91 * 24 * 60 * 60 * 1000
  },
  months: {
    weeks: 4,
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1000
  },
  ...lowOrderMatrix
};

const daysInYearAccurate = 146097.0 / 400;
const daysInMonthAccurate = 146097.0 / 4800;

const accurateMatrix: ConversionMatrix = {
  years: {
    months: 12,
    quarters: 4,
    weeks: daysInYearAccurate / 7,
    days: daysInYearAccurate,
    hours: daysInYearAccurate * 24,
    minutes: daysInYearAccurate * 24 * 60,
    seconds: daysInYearAccurate * 24 * 60 * 60,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000
  },
  quarters: {
    months: 3,
    weeks: daysInYearAccurate / 28,
    days: daysInYearAccurate / 4,
    hours: (daysInYearAccurate * 24) / 4,
    minutes: (daysInYearAccurate * 24 * 60) / 4,
    seconds: (daysInYearAccurate * 24 * 60 * 60) / 4,
    milliseconds: (daysInYearAccurate * 24 * 60 * 60 * 1000) / 4
  },
  months: {
    weeks: daysInMonthAccurate / 7,
    days: daysInMonthAccurate,
    hours: daysInMonthAccurate * 24,
    minutes: daysInMonthAccurate * 24 * 60,
    seconds: daysInMonthAccurate * 24 * 60 * 60,
    milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000
  },
  ...lowOrderMatrix
};

export const toMillis = (
  values: Partial<DurationValues>,
  conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()
): number => {
  const matrix = pickMatrix(conversionAccuracy);
  return durationUnits.reduce((total: number, k) => {
    const val = values[k];
    if (isUndefined(val)) return total;
    const ratio = k === "milliseconds" ? 1 : matrix[k]["milliseconds"];
    return total + ratio * val;
  }, 0);
};

