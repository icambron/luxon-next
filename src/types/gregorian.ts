export type GregorianUnit = "year" | "month" | "day";
export type GregorianDate = {
  [key in GregorianUnit]: number;
};
export type GregorianUnitPlural = "years" | "months" | "days";
