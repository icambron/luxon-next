/* global test expect */
import { setGregorian } from "../../../src/dateTime/core";
import { ymd, year, month, day, hour, minute, second, millisecond } from "../../../src/dateTime/core";

test("setGregorian sets Gregorian fields", () => {
  const dt = ymd(1982, 4, 25, 9, 23, 54, 123);
  expect(year(setGregorian(dt, { year: 2012 }))).toBe(2012);
  expect(month(setGregorian(dt, { month: 2 }))).toBe(2);
  expect(hour(setGregorian(dt, { month: 2 }))).toBe(9); // this will cross a DST for many people
  expect(day(setGregorian(dt, { day: 5 }))).toBe(5);
  expect(hour(setGregorian(dt, { hour: 4 }))).toBe(4);
  expect(minute(setGregorian(dt, { minute: 16 }))).toBe(16);
  expect(second(setGregorian(dt, { second: 45 }))).toBe(45);
  expect(millisecond(setGregorian(dt, { millisecond: 86 }))).toBe(86);
});

test("setGregorian(dt, { month }) doesn't go to the wrong month", () => {
  const before = ymd(1983, 5, 31);
  const after = setGregorian(before, { month: 4 });
  expect(month(after)).toBe(4);
  expect(day(after)).toBe(30);
});

test("setGregorian(dt, { year }) doesn't wrap leap years", () => {
  const before = ymd(2012, 2, 29);
  const after = setGregorian(before, { year: 2013 });
  expect(year(after)).toBe(2013);
  expect(month(after)).toBe(2);
  expect(day(after)).toBe(28);
});
