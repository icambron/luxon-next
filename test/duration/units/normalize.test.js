import { normalize } from "../../../src/duration/units";
import { fromValues, values } from "../../../src/duration/core";

test("normalize() rebalances negative units", () => {
  const dur = fromValues({ years: 2, days: -2 }) |> normalize() |> values;
  expect(dur).toEqual({ years: 1, days: 363 });
});

test("normalize() de-overflows", () => {
  const dur = fromValues({ years: 2, days: 5000 }) |> normalize() |> values;
  expect(dur).toEqual({ years: 15, days: 255 });
});

test("normalize() handles fully negative durations", () => {
  const dur = fromValues({ years: -2, days: -5000 }) |> normalize() |> values;
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
    expect(fromValues(input) |> normalize() |> values).toEqual(expected);
});

 test("normalize can convert all unit pairs", () => {
   const units = [
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

   for (let i = 0; i < units.length; i++) {
     for (let j = i + 1; j < units.length; j++) {
       const duration = fromValues({ [units[i]]: 1, [units[j]]: 2 });
       const normalizedDuration = duration |> normalize() |> values;
       expect(normalizedDuration[units[i]]).not.toBe(NaN);
       expect(normalizedDuration[units[j]]).not.toBe(NaN);

       const normalizedAccurateDuration = duration |> normalize("longterm") |> values
       expect(normalizedAccurateDuration[units[i]]).not.toBe(NaN);
       expect(normalizedAccurateDuration[units[j]]).not.toBe(NaN);
     }
   }
 });
