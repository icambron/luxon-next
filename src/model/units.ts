export type SingularUnit = "year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second" | "millisecond";
export type PluralUnit = "years" | "quarters" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds" | "milliseconds";

export type Unit = SingularUnit | PluralUnit;

const simplePlural = (unit: SingularUnit) : PluralUnit => unit + "s" as PluralUnit;

const unitsArray : Array<SingularUnit> = ["year", "quarter", "month", "week", "day", "hour", "minute", "second", "millisecond"];
export const singularUnits : Set<SingularUnit> = new Set(unitsArray);
export const pluralUnits : Set<PluralUnit> = new Set(unitsArray.map(simplePlural))

export const isPluralUnit = (u: unknown) : u is PluralUnit => pluralUnits.has(u as PluralUnit);
export const isSingularUnit = (u: unknown) : u is SingularUnit => singularUnits.has(u as SingularUnit);

const singularToPluralMap = new Map<string, PluralUnit>(Array.from(singularUnits).map(u => [u, simplePlural(u)]));
const pluralToSingularMap = new Map<string, SingularUnit>(Array.from(singularUnits).map(u => [simplePlural(u), u]));

export const pluralizeUnit = (unit: string) : PluralUnit | undefined => isPluralUnit(unit) ? unit : singularToPluralMap.get(unit);
export const singularizeUnit = (unit: string) : SingularUnit | undefined => isSingularUnit(unit) ? unit : pluralToSingularMap.get(unit);
