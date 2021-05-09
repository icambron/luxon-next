import { integerBetween } from "../impl/util";
import { buildNormalizer, normalizeUnitBundle, simplePlural, TimeUnit, timeUnits } from "./units";

export default interface Time {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
}

const timeNormalizer = buildNormalizer<TimeUnit>(timeUnits, simplePlural);
const normalizedTimeUnits = (obj: object) => normalizeUnitBundle<Time>(obj, timeNormalizer);

export const fromObject = normalizedTimeUnits;

export const hasInvalidTimeData = ({ hour, minute, second, millisecond }: Time): [string, number] | null => {
  if (!(integerBetween(hour, 0, 23) || (hour === 24 && minute === 0 && second === 0 && millisecond === 0))) {
    return ["hour", hour];
  }

  if (!integerBetween(minute, 0, 59)) {
    return ["minute", minute];
  }

  if (!integerBetween(second, 0, 59)) {
    return ["second", second];
  }

  if (!integerBetween(millisecond, 0, 999)) {
    return ["millisecond", millisecond];
  }

  return null;
};
