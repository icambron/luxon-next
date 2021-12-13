import { durNormalize, duration, durValues } from "../../../src/luxon";

test("normalize() rebalances negative convert", () => {
  const dur = durNormalize(duration({ years: 2, days: -2 }));
  expect(durValues(dur)).toEqual({ years: 1, days: 363 });
});

test("normalize() de-overflows", () => {
  const dur = durNormalize(duration({ years: 2, days: 5000 }));
  expect(durValues(dur)).toEqual({ years: 15, days: 255 });
});

test("normalize() handles fully negative durations", () => {
  const dur = durNormalize(duration({ years: -2, days: -5000 }));
  expect(durValues(dur)).toEqual({ years: -15, days: -255 });
});

test.each([
  [
    { months: 1, days: 32 },
    { months: 2, days: 2 },
  ],
  [
    { months: 1, days: 28 },
    { months: 1, days: 28 },
  ],
  [
    { months: 1, days: -32 },
    { months: 0, days: -2 },
  ],
  [
    { months: 1, days: -28 },
    { months: 0, days: 2 },
  ],
  [
    { months: -1, days: 32 },
    { months: 0, days: 2 },
  ],
  [
    { months: -1, days: 28 },
    { months: 0, days: -2 },
  ],
  [
    { months: -1, days: -32 },
    { months: -2, days: -2 },
  ],
  [
    { months: -1, days: -28 },
    { months: -1, days: -28 },
  ],
  [
    { months: 0, days: 32 },
    { months: 1, days: 2 },
  ],
  [
    { months: 0, days: 28 },
    { months: 0, days: 28 },
  ],
  [
    { months: 0, days: -32 },
    { months: -1, days: -2 },
  ],
  [
    { months: 0, days: -28 },
    { months: 0, days: -28 },
  ],
])("normalize() handles %p", (input, expected) => {
  const dur = durNormalize(duration(input));
  expect(durValues(dur)).toEqual(expected);
});

test("normalize can convert all unit pairs", () => {
  const units = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];

  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      const dur = duration({ [units[i]]: 1, [units[j]]: 2 });
      const normalizedDuration = durValues(durNormalize(dur));
      expect(normalizedDuration[units[i]]).not.toBe(NaN);
      expect(normalizedDuration[units[j]]).not.toBe(NaN);

      const normalizedAccurateDuration = durValues(durNormalize(dur, "longterm"));
      expect(normalizedAccurateDuration[units[i]]).not.toBe(NaN);
      expect(normalizedAccurateDuration[units[j]]).not.toBe(NaN);
    }
  }
});
