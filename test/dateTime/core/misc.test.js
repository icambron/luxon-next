/* global test expect */

import { daysInCurrentMonth, daysInCurrentYear, fromGregorian, isInLeapYear } from "../../../src/luxon";

test("isInLeapYear returns the whether the DateTime's year is in a leap year", () => {
  expect(isInLeapYear(fromGregorian({ year: 2017, month: 5, day: 25 }))).toBe(false);
  expect(isInLeapYear(fromGregorian({ year: 2020, month: 5, day: 25 }))).toBe(true);
});

test("daysInCurrentYear returns the number of days in the DateTime's year", () => {
  expect(daysInCurrentYear(fromGregorian({ year: 2017, month: 5, day: 25 }))).toBe(365);
  expect(daysInCurrentYear(fromGregorian({ year: 2020, month: 5, day: 25 }))).toBe(366);
});

test("daysInCurrentMonth returns the number of days in the DateTime's month", () => {
  expect(daysInCurrentMonth(fromGregorian({ year: 2017, month: 3, day: 10 }))).toBe(31);
  expect(daysInCurrentMonth(fromGregorian({ year: 2017, month: 6, day: 10 }))).toBe(30);
  expect(daysInCurrentMonth(fromGregorian({ year: 2017, month: 2, day: 10 }))).toBe(28);
  expect(daysInCurrentMonth(fromGregorian({ year: 2020, month: 2, day: 10 }))).toBe(29);
});
