import { InvalidUnitError } from "./errors";

export type GregorianUnit = "year" | "month" | "day";
export const gregorianUnits: Array<GregorianUnit> = ["year", "month", "day"];

export type GregorianUnitPlural = "years" | "months" | "days";
export const gregorianUnitsPlural: Array<GregorianUnitPlural> = ["years", "months", "days"];

export type TimeUnit = "hour" | "minute" | "second" | "millisecond";
export const timeUnits: Array<TimeUnit> = ["hour", "minute", "second", "millisecond"];

export type TimeUnitPlural = "hours" | "minutes" | "seconds" | "milliseconds";
export const timeUnitsPlural: Array<TimeUnitPlural> = ["hours", "minutes", "seconds", "milliseconds"];

export type OrdinalUnit = "year" | "ordinal";
export const ordinalUnits: Array<OrdinalUnit> = ["year", "ordinal"];

export type IsoWeekUnit = "weekYear" | "weekNumber" | "weekday";
export const isoWeekUnits: Array<IsoWeekUnit> = ["weekYear", "weekNumber", "weekday"];

export type MiscDurationUnit = "week" | "quarter";
export const miscDurationUnits: Array<MiscDurationUnit> = ["week", "quarter"];

export type MiscDurationUnitPlural = "weeks" | "quarters";
export const miscDurationUnitsPlural: Array<MiscDurationUnitPlural> = ["weeks", "quarters"];

export type DurationUnit = GregorianUnitPlural | TimeUnitPlural | MiscDurationUnitPlural;

export const simplePlural = <T extends string>(unit: string): T => (unit + "s") as T;
export const simpleSingular = <T extends string>(unit: string): T => unit.slice(0, -1) as T;

export const normalizeUnitBundle = <T>(obj: object, normalizer: (unit: string) => keyof T | null): T => {
  const entries = Object.entries(obj)
    .map(([k, v]) => [normalizer(k), v])
    .filter(([k, _]) => k != null);
  return Object.fromEntries(entries) as T;
};

export const buildNormalizer = <T extends string>(
  valid: Array<T>,
  mapper: (s: string) => T,
): ((s: string, throwOnInvalid?: boolean) => T | null) => {
  const map = new Map<string, T>();
  for (const s of valid) {
    map.set(s.toLowerCase(), s);
    map.set(mapper(s.toLowerCase()), s);
  }
  return (unit: string, throwOnInvalid?: boolean): T | null => {
    const lowered = unit.toLowerCase();
    const result = map.get(lowered) as T | undefined;
    if (result === undefined) {
      if (throwOnInvalid) {
        throw new InvalidUnitError(unit);
      }
      return null;
    } else {
      return result;
    }
  };
};
