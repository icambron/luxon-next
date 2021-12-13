/* global test expect */
import {
  day,
  fromGregorian,
  hour,
  minute,
  month,
  quarter,
  year,
  ymd,
  plus,
  duration,
  durToMillis,
} from "../../../src/luxon";
import { InvalidArgumentError } from "../../../src/errors";

const dt = fromGregorian({
  year: 2010,
  month: 2,
  day: 3,
  hour: 4,
  minute: 5,
  second: 6,
  millisecond: 7,
});

test("plus({ years: 1 }) adds a year", () => {
  const i = plus(dt, { years: 1 });
  expect(year(i)).toBe(2011);
});

test("plus({quarter: 1}) adds a quarter", () => {
  const i = plus(dt, { quarters: 1 });
  expect(quarter(i)).toBe(2);
  expect(month(i)).toBe(5);
});

test("plus({ months: 1 }) at the end of the month", () => {
  const i = ymd(2018, 1, 31, 10);
  const later = plus(i, { months: 1 });
  expect(day(later)).toBe(28);
  expect(month(later)).toBe(2);
});

test("plus({ months: 1 }) at the end of the month in a leap year", () => {
  const i = ymd(2016, 1, 31, 10);
  const later = plus(i, { months: 1 });
  expect(day(later)).toBe(29);
  expect(month(later)).toBe(2);
});

test("plus({ months: 13 }) at the end of the month", () => {
  const i = ymd(2015, 1, 31, 10);
  const later = plus(i, { months: 13 });
  expect(day(later)).toBe(29);
  expect(month(later)).toBe(2);
  expect(year(later)).toBe(2016);
});

test("plus({ days: 1 }) keeps the same time across a DST", () => {
  const i = fromGregorian({ year: 2106, month: 3, day: 12, hour: 10 }, "America/Los_Angeles");
  const later = plus(i, { days: 1 });
  expect(day(later)).toBe(13);
  expect(hour(later)).toBe(10);
});

test("plus({ hours: 24 }) gains an hour to spring forward", () => {
  const i = fromGregorian({ year: 2016, month: 3, day: 12, hour: 10 }, "America/Los_Angeles");
  const later = plus(i, { hours: 24 });
  expect(day(later)).toBe(13);
  expect(hour(later)).toBe(11);
});

// #669
test("plus({ days:0, hours: 24 }) gains an hour to spring forward", () => {
  const i = fromGregorian({ year: 2016, month: 3, day: 12, hour: 10 }, "America/Los_Angeles");
  const later = plus(i, { days: 0, hours: 24 });
  expect(day(later)).toBe(13);
  expect(hour(later)).toBe(11);
});

test("plus(Duration) adds the right amount of time", () => {
  const i = fromGregorian({ year: 2106, month: 3, day: 12, hour: 10, minute: 13 });
  const later = plus(i, duration({ days: 1, hours: 3, minutes: 28 }));
  expect(day(later)).toBe(13);
  expect(hour(later)).toBe(13);
  expect(minute(later)).toBe(41);
});

test("plus(multiple) adds the right amount of time", () => {
  const i = fromGregorian({ year: 2106, month: 3, day: 12, hour: 10, minute: 13 });
  const later = plus(i, { days: 1, hours: 3, minutes: 28 });
  expect(day(later)).toBe(13);
  expect(hour(later)).toBe(13);
  expect(minute(later)).toBe(41);
});

test("plus works across the 100 barrier", () => {
  const d = plus(ymd(99, 12, 31), { days: 2 });
  expect(year(d)).toBe(100);
  expect(month(d)).toBe(1);
  expect(day(d)).toBe(2);
});

test("plus throws when out of max. datetime range using days", () => {
  expect(() => plus(fromGregorian({ year: 1970 }), { days: 1e8 + 1 })).toThrow(InvalidArgumentError);
});

test("plus throws when out of max. datetime range using seconds", () => {
  expect(() => {
    plus(fromGregorian({ year: 1970 }), { seconds: 1e8 * 24 * 60 * 60 + 1 });
  }).toThrow(InvalidArgumentError);
});

test("plus handles fractional days", () => {
  const d = ymd(2016, 1, 31, 10);
  // expect(plus(d, { days: 0.8 })).toEqual(plus(d, { minutes: 1152 }));
  expect(plus(d, { days: 6.8 })).toEqual(plus(d, { days: 6, minutes: 1152 }));
  expect(plus(d, { days: 6.8, milliseconds: 17 })).toEqual(
    plus(d, { days: 6, milliseconds: 0.8 * 24 * 60 * 60 * 1000 + 17 })
  );
});

test("plus handles fractional large convert", () => {
  const units = ["weeks", "months", "quarters", "years"];
  const d = ymd(2016, 1, 31, 10);
  for (const unit of units) {
    const first = plus(d, { [unit]: 8.7 });
    const dur = duration({ [unit]: 0.7 });
    const second = plus(d, { [unit]: 8, milliseconds: durToMillis(dur) });
    expect(first).toEqual(second);
  }
});

test("plus supports singular convert", () => {
  const i = fromGregorian({ year: 2106, month: 3, day: 12, hour: 10, minute: 13 });

  // same as the multi unit test
  const later = plus(i, { day: 1, hour: 3, minute: 28 });
  expect(day(later)).toBe(13);
  expect(hour(later)).toBe(13);
  expect(minute(later)).toBe(41);
});

// #645
test("plus supports a mix of positive and negative duration convert", () => {
  const d = ymd(2020, 1, 8, 12, 34);

  expect(plus(d, { months: 1, days: -1 })).toEqual(plus(plus(d, { months: 1 }), { days: -1 }));
  expect(plus(d, { years: 4, days: -1 })).toEqual(plus(plus(d, { years: 4 }), { days: -1 }));
  expect(plus(d, { years: 0.5, days: -1.5 })).toEqual(plus(plus(d, { years: 0.5 }), { days: -1.5 }));
});
