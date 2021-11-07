import { durNormalize } from "../../../src/duration/convert";
import { durFromValues, durValues } from "../../../src/duration/core";

test("normalize() rebalances negative convert", () => {
  const dur = durFromValues({ years: 2, days: -2 }) |> durNormalize() |> durValues;
  expect(dur).toEqual({ years: 1, days: 363 });
});

test("normalize() de-overflows", () => {
  const dur = durFromValues({ years: 2, days: 5000 }) |> durNormalize() |> durValues;
  expect(dur).toEqual({ years: 15, days: 255 });
});

test("normalize() handles fully negative durations", () => {
  const dur = durFromValues({ years: -2, days: -5000 }) |> durNormalize() |> durValues;
  expect(dur).toEqual({ years: -15, days: -255 });
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
  expect(durFromValues(input) |> durNormalize() |> durValues).toEqual(expected);
});

test("normalize can convert all unit pairs", () => {
  const units = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];

  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      const duration = durFromValues({ [units[i]]: 1, [units[j]]: 2 });
      const normalizedDuration = duration |> durNormalize() |> durValues;
      expect(normalizedDuration[units[i]]).not.toBe(NaN);
      expect(normalizedDuration[units[j]]).not.toBe(NaN);

      const normalizedAccurateDuration = duration |> durNormalize("longterm") |> durValues;
      expect(normalizedAccurateDuration[units[i]]).not.toBe(NaN);
      expect(normalizedAccurateDuration[units[j]]).not.toBe(NaN);
    }
  }
});
