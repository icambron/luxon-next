/* global test expect */

import {daysInCurrentMonth, daysInCurrentYear, fromGregorian, isInLeapYear} from "../../../src/dateTime/core";

test("isInLeapYear returns the whether the DateTime's year is in a leap year", () => {
  expect(fromGregorian({year: 2017, month: 5, day: 25}) |> isInLeapYear).toBe(false);
  expect(fromGregorian({year: 2020, month: 5, day: 25}) |> isInLeapYear).toBe(true);
});

test("daysInCurrentYear returns the number of days in the DateTime's year", () => {
  expect(fromGregorian({year: 2017, month: 5, day: 25}) |> daysInCurrentYear).toBe(365);
  expect(fromGregorian({year: 2020, month: 5, day: 25}) |> daysInCurrentYear).toBe(366);
});

test("daysInCurrentMonth returns the number of days in the DateTime's month", () => {
  expect(fromGregorian({ year: 2017, month: 3, day: 10}) |> daysInCurrentMonth).toBe(31);
  expect(fromGregorian({ year: 2017, month: 6, day: 10}) |> daysInCurrentMonth).toBe(30);
  expect(fromGregorian({ year: 2017, month: 2, day: 10}) |> daysInCurrentMonth).toBe(28);
  expect(fromGregorian({ year: 2020, month: 2, day: 10}) |> daysInCurrentMonth).toBe(29);
});
