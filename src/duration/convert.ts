import { getDefaultConversionAccuracy } from "../settings";
import { antiTrunc } from "../impl/util/numeric";
import { ConversionMatrix, DurationImpl, fromValues, normalizeDurationUnit, orderedUnits, pickMatrix } from "../impl/duration";
import { ConversionAccuracy, Duration, DurationUnit, DurationValues } from "../types";

const reverseUnits: DurationUnit[] = orderedUnits.slice(0).reverse();

// NB: mutates parameters
const convertInternal = (
  matrix: ConversionMatrix,
  fromMap: Map<DurationUnit, number>,
  fromUnit: DurationUnit,
  toMap: Map<DurationUnit, number>,
  toUnit: DurationUnit
) => {
  const conv = matrix[toUnit][fromUnit];

  let fromValue = fromMap.get(fromUnit) as number; // cast because we're sure they're not undefined
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

export const stripTrailingZeros = (dur: Duration): Duration => {
	const stripped: Partial<DurationValues> = {}
	let foundNonZero = false
	for (const unit of reverseUnits) {
		const val = dur.values[unit]
		if (typeof val != "undefined") {
			if (foundNonZero) {
				stripped[unit] = val
				continue
			}

			if (val != 0) {
				stripped[unit] = val
				foundNonZero = false
			}
		}
	}

	return new DurationImpl(stripped)
}

// NB: mutates parameters
const normalizeValues = (matrix: ConversionMatrix, vals: Map<DurationUnit, number>) => {
  reverseUnits.reduce((previous: DurationUnit | null, current) => {
    if (typeof vals.get(current) !== "undefined") {
      if (previous) {
        convertInternal(matrix, vals, previous, vals, current);
      }
      return current;
    } else {
      return previous;
    }
  }, null);
};

/**
 * Reduce this Duration to its canonical representation in its current convert.
 * @example duration({ years: 2, days: 5000 }) |> durNormalize(%) |> durValues(%) //=> { years: 15, days: 255 }
 * @example duration({ hours: 12, minutes: -45 }) |> durNormalize(%) |> durValues(%) //=> { hours: 11, minutes: 15 }
 */
export const durNormalize = (
  dur: Duration,
  conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()
): Duration => {
  const map = durToMap(dur);
  normalizeValues(pickMatrix(conversionAccuracy), map);
  return fromValues(Object.fromEntries(map));
};

export const durAs = (dur: Duration, unit: DurationUnit) => {
  const normalizedUnit = normalizeDurationUnit(unit);
  const shifted = durShiftTo(dur, [normalizedUnit]);
  return shifted._values[unit] || 0;
};

/**
 * Convert this Duration into its representation in a different set of units.
 * @example
 * ```js
 * const dur = duration({ hours: 1, seconds: 30 })
 * shiftTo(dur ['minutes', 'milliseconds']) |> values(%) //=> { minutes: 60, milliseconds: 30000 }
 * ```
 */
export const durShiftTo = (
  dur: Duration,
  units: DurationUnit[],
  conversionAccuracy: ConversionAccuracy = getDefaultConversionAccuracy()
): Duration => {
  if (units.length === 0) {
    return dur;
  }

  units = units.map((u) => normalizeDurationUnit(u));
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
      if (typeof valueMap.get(k) === "number") {
        own += valueMap.get(k) as number;
      }

      const i = Math.trunc(own);
      built.set(k, i);
      accumulated.set(k, (1000 * own - 1000 * i) / 1000); // we'd like to absorb these fractions in another unit

      // plus anything further down the chain that should be rolled up in to this
      for (const down of valueMap.keys()) {
        if (orderedUnits.indexOf(down) > orderedUnits.indexOf(k)) {
          convertInternal(matrix, valueMap, down, built, k);
        }
      }
      // otherwise, keep it in the wings to boil it later
    } else if (typeof valueMap.get(k) == "number") {
      accumulated.set(k, valueMap.get(k) as number);
    }
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

  return fromValues(Object.fromEntries(built));
};
