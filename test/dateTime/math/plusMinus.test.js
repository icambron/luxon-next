/* global test expect */
import { day, fromGregorian, hour, minute, month, quarter, year, ymd } from "../../../src/dateTime/core";
import { plus } from "../../../src/dateTime/math";
import { duration, durToMillis } from "../../../src/duration/core";
import { InvalidArgumentError } from "../../../src/errors";
import Duration from "../../../src/model/duration";

const dt = () =>
  fromGregorian({
    year: 2010,
    month: 2,
    day: 3,
    hour: 4,
    minute: 5,
    second: 6,
    millisecond: 7,
  });

test("plus({ years: 1 }) adds a year", () => {
  const i = dt() |> plus({ years: 1 });
  expect(i |> year).toBe(2011);
});

test("plus({quarter: 1}) adds a quarter", () => {
  const i = dt() |> plus({ quarters: 1 });
  expect(i |> quarter).toBe(2);
  expect(i |> month).toBe(5);
});

test("plus({ months: 1 }) at the end of the month", () => {
  const i = ymd(2018, 1, 31, 10);
  const later = i |> plus({ months: 1 });
  expect(later |> day).toBe(28);
  expect(later |> month).toBe(2);
});

test("plus({ months: 1 }) at the end of the month in a leap year", () => {
  const i = ymd(2016, 1, 31, 10);
  const later = i |> plus({ months: 1 });
  expect(later |> day).toBe(29);
  expect(later |> month).toBe(2);
});

test("plus({ months: 13 }) at the end of the month", () => {
  const i = ymd(2015, 1, 31, 10);
  const later = i |> plus({ months: 13 });
  expect(later |> day).toBe(29);
  expect(later |> month).toBe(2);
  expect(later |> year).toBe(2016);
});

test("plus({ days: 1 }) keeps the same time across a DST", () => {
  const i = fromGregorian({ year: 2106, month: 3, day: 12, hour: 10 }, "America/Los_Angeles");
  const later = i |> plus({ days: 1 });
  expect(later |> day).toBe(13);
  expect(later |> hour).toBe(10);
});

test("plus({ hours: 24 }) gains an hour to spring forward", () => {
  const i = fromGregorian({ year: 2016, month: 3, day: 12, hour: 10 }, "America/Los_Angeles");
  const later = i |> plus({ hours: 24 });
  expect(later |> day).toBe(13);
  expect(later |> hour).toBe(11);
});

// #669
test("plus({ days:0, hours: 24 }) gains an hour to spring forward", () => {
  const i = fromGregorian({ year: 2016, month: 3, day: 12, hour: 10 }, "America/Los_Angeles");
  const later = i |> plus({ days: 0, hours: 24 });
  expect(later |> day).toBe(13);
  expect(later |> hour).toBe(11);
});

test("plus(Duration) adds the right amount of time", () => {
  const i = fromGregorian({ year: 2106, month: 3, day: 12, hour: 10, minute: 13 });
  const later = i |> plus(duration({ days: 1, hours: 3, minutes: 28 }));
  expect(later |> day).toBe(13);
  expect(later |> hour).toBe(13);
  expect(later |> minute).toBe(41);
});

test("plus(multiple) adds the right amount of time", () => {
  const i = fromGregorian({ year: 2106, month: 3, day: 12, hour: 10, minute: 13 });
  const later = i |> plus({ days: 1, hours: 3, minutes: 28 });
  expect(later |> day).toBe(13);
  expect(later |> hour).toBe(13);
  expect(later |> minute).toBe(41);
});

test("plus works across the 100 barrier", () => {
  const d = ymd(99, 12, 31) |> plus({ days: 2 });
  expect(d |> year).toBe(100);
  expect(d |> month).toBe(1);
  expect(d |> day).toBe(2);
});

test("plus throws when out of max. datetime range using days", () => {
  expect(() => fromGregorian({ year: 1970 }) |> plus({ days: 1e8 + 1 })).toThrow(InvalidArgumentError);
});

test("plus throws when out of max. datetime range using seconds", () => {
  expect(() => {
    fromGregorian({ year: 1970 }) |> plus({ seconds: 1e8 * 24 * 60 * 60 + 1 });
  }).toThrow(InvalidArgumentError);
});

test("plus handles fractional days", () => {
  const d = ymd(2016, 1, 31, 10);
  // expect(plus(d, { days: 0.8 })).toEqual(plus(d, { minutes: 1152 }));
  expect(d |> plus({ days: 6.8 })).toEqual(d |> plus({ days: 6, minutes: 1152 }));
  expect(d |> plus({ days: 6.8, milliseconds: 17 })).toEqual(
    d |> plus({ days: 6, milliseconds: 0.8 * 24 * 60 * 60 * 1000 + 17 })
  );
});

test("plus handles fractional large convert", () => {
  const units = ["weeks", "months", "quarters", "years"];
  const d = ymd(2016, 1, 31, 10);
  for (const unit of units) {
    const first = d |> plus({ [unit]: 8.7 });
    const second = d |> plus({ [unit]: 8, milliseconds: duration({ [unit]: 0.7 }) |> durToMillis() });
    expect(first).toEqual(second);
  }
});

test("plus supports singular convert", () => {
  const i = fromGregorian({ year: 2106, month: 3, day: 12, hour: 10, minute: 13 });

  // same as the multi unit test
  const later = i |> plus({ day: 1, hour: 3, minute: 28 });
  expect(later |> day).toBe(13);
  expect(later |> hour).toBe(13);
  expect(later |> minute).toBe(41);
});

// #645
test("plus supports a mix of positive and negative duration convert", () => {
  const d = ymd(2020, 1, 8, 12, 34);

  // expect(plus(d, { months: 1, days: -1 })).toEqual(plus(d, { months: 1 }) |> (x => plus(x, { days: -1 })));
  // expect(plus(d, { years: 4, days: -1 })).toEqual(plus(d, { years: 4 }) |> (x => plus(x, { days: -1 })));
  expect(d |> plus({ years: 0.5, days: -1.5 })).toEqual(d |> plus({ years: 0.5 }) |> plus({ days: -1.5 }));
});
