import { InvalidArgumentError } from "../../errors";

export const integerBetween = (thing: number, bottom: number, top: number) =>
  Number.isInteger(thing) && thing >= bottom && thing <= top;

// x % n but takes the sign of n instead of x
export const floorMod = (x: number, n: number) => x - n * Math.floor(x / n);

export const intAndFraction = (x: number) => {
  const iPart = Math.trunc(x);
  return [iPart, Number(x - iPart)];
};

export const parseInteger = (text: string): number =>
  typeof text === "undefined" || text === null || text === "" ? NaN : parseInt(text, 10);

export const parseFloating = (text: string) =>
  typeof text === "undefined" || text === null || text === "" ? NaN : parseFloat(text);

export const parseMillis = (fraction: string | null | undefined) => {
  // Return undefined (instead of 0) in these cases, where fraction is not set
  if (typeof fraction === "undefined" || fraction === null || fraction === "") {
    return undefined;
  } else {
    const f = parseFloat("0." + fraction) * 1000;
    return Math.floor(f);
  }
};

export const roundTo = (value: number, digits: number, towardZero = false) => {
  const factor = 10 ** digits,
    rounder = towardZero ? Math.trunc : Math.round;
  return rounder(value * factor) / factor;
};

export const antiTrunc = (n: number) => (n < 0 ? Math.floor(n) : Math.ceil(n));

export const asNumber = (value: any): number => {
  const numericValue = Number(value);
  if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue))
    throw new InvalidArgumentError(`Invalid unit value ${value}`);
  return numericValue;
};
