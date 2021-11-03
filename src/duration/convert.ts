import { DurationUnit } from "../model/units";
import { ConversionAccuracy, Duration, normalizeDurationUnit, pickMatrix, Trie } from "../model/duration";
import { getDefaultConversionAccuracy } from "../settings";
import { antiTrunc, isNumber, isUndefined, pick } from "../lib/util";

// convert ordered by size
const orderedUnits: DurationUnit[] = [
  "years",
  "quarters",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds",
];

const reverseUnits: DurationUnit[] = orderedUnits.slice(0).reverse();

// NB: mutates parameters
const convertInternal = (
  matrix: Trie,
  fromMap: Map<DurationUnit, number>,
  fromUnit: DurationUnit,
  toMap: Map<DurationUnit, number>,
  toUnit: DurationUnit
) => {
  const conv = matrix[toUnit][fromUnit];

  let fromValue = fromMap.get(fromUnit) as number;
  let toValue = toMap.get(toUnit) as number;

  const raw = fromValue / conv;
  const sameSign = Math.sign(raw) === Math.sign(toValue);
  // ok, so this is wild, but see the matrix in the tests
  const added = !sameSign && toValue !== 0 && Math.abs(raw) <= 1 ? antiTrunc(raw) : Math.trunc(raw);
  toValue += added;
  fromValue -= added * conv;

  fromMap.set(fromUnit, fromValue);
  toMap.set(toUnit, toValue);
};

const durToMap = (dur: Duration): Map<DurationUnit, number> => {
  const entries = Object.entries(dur.values) as [DurationUnit, number][];
  return new Map<DurationUnit, number>(entries);
};

// NB: mutates parameters
const normalizeValues = (matrix: Trie, vals: Map<DurationUnit, number>) => {
  reverseUnits.reduce((previous: DurationUnit | null, current) => {
    if (!isUndefined(vals.get(current))) {
      if (previous) {
        convertInternal(matrix, vals, previous, vals, current);
      }
      return current;
    } else {
      return previous;
    }
  }, null);
};

export const as =
  (unit: DurationUnit): ((dur: Duration) => number) =>
  (dur) => {
    const shifted = shiftTo([unit])(dur);
    return shifted.values[unit] || 0;
  };

/**
 * Reduce this Duration to its canonical representation in its current convert.
 * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
 * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
 * @return {Duration}
 */
export const normalize =
  (conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()): ((dur: Duration) => Duration) =>
  (dur) => {
    const map = durToMap(dur);
    normalizeValues(pickMatrix(conversionAccuracy), map);
    return new Duration(Object.fromEntries(map));
  };

export const shiftTo =
  (
    units: DurationUnit[],
    conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()
  ): ((dur: Duration) => Duration) =>
  (dur) => {
    if (units.length === 0) {
      return dur;
    }

    units = units.map((u) => normalizeDurationUnit(u, true)) as DurationUnit[];
    const valueMap = durToMap(dur);
    const built = new Map<DurationUnit, number>();
    const accumulated = new Map<DurationUnit, number>();
    let lastUnit: DurationUnit = units[0];

    const matrix = pickMatrix(conversionAccuracy);

    for (const k of orderedUnits) {
      if (units.indexOf(k) >= 0) {
        lastUnit = k;

        let own = 0;

        // anything we haven't boiled down yet should get boiled to this unit
        for (const ak of accumulated.keys()) {
          own += matrix[ak][k] * (accumulated.get(ak) as number);
          accumulated.set(ak, 0);
        }

        // plus anything that's already in this unit
        if (isNumber(valueMap.get(k))) {
          own += valueMap.get(k) as number;
        }

        const i = Math.trunc(own);
        built.set(k, i);
        accumulated.set(k, own - i); // we'd like to absorb these fractions in another unit

        // plus anything further down the chain that should be rolled up in to this
        for (const down of valueMap.keys()) {
          if (orderedUnits.indexOf(down) > orderedUnits.indexOf(k)) {
            convertInternal(matrix, valueMap, down, built, k);
          }
        }
        // otherwise, keep it in the wings to boil it later
      } else if (isNumber(valueMap.get(k))) {
        accumulated.set(k, valueMap.get(k) as number);
      }

      // console.log({k, built, accumulated, lastUnit, vals: valueMap})
    }

    // anything leftover becomes the decimal for the last unit
    for (const key of accumulated.keys()) {
      if (accumulated.get(key) !== 0) {
        const accVal = accumulated.get(key) as number;
        let builtVal = built.get(lastUnit) as number;
        builtVal += key === lastUnit ? accVal : accVal / matrix[lastUnit][key];
        built.set(lastUnit, builtVal);
      }
    }

    normalizeValues(matrix, built);

    return new Duration(Object.fromEntries(built));
  };
