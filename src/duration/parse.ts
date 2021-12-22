import { Duration, DurationValues } from "../types";
import { parseFloating, parseMillis } from "../impl/util/numeric";
import { parse } from "../impl/parsing/regexParser";
import { duration } from "./core";
import { parseISOTime } from "../impl/parsing/isoParser";
import { normalizeUnitBundle } from "../impl/util/units";
import { normalizeDurationUnit } from "../impl/duration";

const isoDurationRegex =
  /^-?P(?:(?:(-?\d{1,9}(?:\.\d{1,9})?)Y)?(?:(-?\d{1,9}(?:\.\d{1,9})?)M)?(?:(-?\d{1,9}(?:\.\d{1,9})?)W)?(?:(-?\d{1,9}(?:\.\d{1,9})?)D)?(?:T(?:(-?\d{1,9}(?:\.\d{1,9})?)H)?(?:(-?\d{1,9}(?:\.\d{1,9})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,9}))?S)?)?)$/;

const extractISODuration = (match: RegExpMatchArray): Partial<DurationValues> => {
  const [s, year, month, week, day, hour, minute, second, milliseconds] = match;

  const hasNegativePrefix = s[0] === "-";
  const negativeSeconds = !!second && second[0] === "-";

  const maybeNegate = (num: number | undefined, force: boolean = false) =>
    num !== undefined && (force || (num && hasNegativePrefix)) ? -num : num;

  const converted: Partial<DurationValues> = {
    years: maybeNegate(parseFloating(year)),
    months: maybeNegate(parseFloating(month)),
    weeks: maybeNegate(parseFloating(week)),
    days: maybeNegate(parseFloating(day)),
    hours: maybeNegate(parseFloating(hour)),
    minutes: maybeNegate(parseFloating(minute)),
    seconds: maybeNegate(parseFloating(second), second === "-0"),
    milliseconds: maybeNegate(parseMillis(milliseconds), negativeSeconds),
  };

  const entries = Object.entries(converted).filter(([_, v]) => typeof v !== "undefined" && !isNaN(v));
  return Object.fromEntries(entries) as Partial<DurationValues>;
};

/**
 *
 * Create a Duration from an ISO 8601 duration string.
 * @param text - text to parse
 * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
 * @example
 * ```js
 * durFromISO('P3Y6M1W4DT12H30M5S') |> durValues(%) //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
 * durFromISO('PT23H') |> durValues(%) //=> { hours: 23 }
 * durFromISO('P5Y3M') |> durValues(%) //=> { years: 5, months: 3 }
 * ```
 */
export const durFromISO = (s: string): Duration => {
  const values = parse(s, { r: isoDurationRegex, ex: extractISODuration });
  return duration(values);
};

/**
 * Create a Duration from an ISO 8601 time string.
 * @param text - text to parse
 * @see https://en.wikipedia.org/wiki/ISO_8601#Times
 * @example
 * ```js
 * durFromISOTime('11:22:33.444') |> durValues(%)  //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
 * durFromISOTime('11:00') |> durValues(%) //=> { hours: 11, minutes: 0, seconds: 0 }
 * durFromISOTime('T11:00') |> durValues(%) //=> { hours: 11, minutes: 0, seconds: 0 }
 * durFromISOTime('1100') |> durValues(%) //=> { hours: 11, minutes: 0, seconds: 0 }
 * durFromISOTime('T1100') |> durValues(%) //=> { hours: 11, minutes: 0, seconds: 0 }
 * ```
 */
export const durFromISOTime = (text: string) => {
  const parsed = parseISOTime(text);
  return duration(normalizeUnitBundle(parsed.time, normalizeDurationUnit));
};
