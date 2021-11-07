import { GregorianUnitPlural } from "./gregorian";
import { TimeUnitPlural } from "./time";

export type DurationUnit = GregorianUnitPlural | TimeUnitPlural | MiscDurationUnitPlural;
export type DurationValues = {
  [unit in DurationUnit]: number;
};
export type ConversionAccuracy = "casual" | "longterm";

export type MiscDurationUnit = "week" | "quarter";
export type MiscDurationUnitPlural = "weeks" | "quarters";
