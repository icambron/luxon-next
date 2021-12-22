import { InvalidUnitError } from "../../errors";
import {
  GregorianUnit,
  GregorianUnitPlural,
  IsoWeekUnit,
  MiscDurationUnit,
  MiscDurationUnitPlural, OrdinalUnit, TimeUnit, TimeUnitPlural
} from "../../types";
import { memo } from "./caching";

export const normalizeUnitBundle = <T>(obj: object, normalizer: (unit: string) => keyof T | null): T => {
  const entries = Object.entries(obj)
    .map(([k, v]) => [normalizer(k), v])
    .filter(([k, _]) => k != null);
  return Object.fromEntries(entries) as T;
};

export const normalizeUnit = <T extends string>(
  name: string,
  valid: T[],
  mapper: (s: string) => T,
  unit: string,
  throwOnInvalid?: boolean,
): T | null => {

  const getMapping = memo(name, () => {
    const map = new Map<string, T>();
    for (const s of valid) {
      map.set(s.toLowerCase(), s);
      map.set(mapper(s.toLowerCase()), s);
    }
    return map;
  });

  const lowered = unit.toLowerCase();
  const result = getMapping("*").get(lowered) as T | undefined;
  if (result === undefined) {
    if (throwOnInvalid) {
      throw new InvalidUnitError(unit);
    }
    return null;
  } else {
    return result;
  }
};

export const simplePlural = <T extends string>(unit: string): T => (unit + "s") as T;
export const simpleSingular = <T extends string>(unit: string): T => unit.slice(0, -1) as T;

export const gregorianUnits: Array<GregorianUnit> = ["year", "month", "day"];
export const gregorianUnitsPlural: Array<GregorianUnitPlural> = ["years", "months", "days"];
export const timeUnits: Array<TimeUnit> = ["hour", "minute", "second", "millisecond"];
export const timeUnitsPlural: Array<TimeUnitPlural> = ["hours", "minutes", "seconds", "milliseconds"];
export const isoWeekUnits: Array<IsoWeekUnit> = ["weekYear", "weekNumber", "weekday"];
export const miscDurationUnits: Array<MiscDurationUnit> = ["week", "quarter"];
export const miscDurationUnitsPlural: Array<MiscDurationUnitPlural> = ["weeks", "quarters"];
export const ordinalUnits: Array<OrdinalUnit> = ["year", "ordinal"];
