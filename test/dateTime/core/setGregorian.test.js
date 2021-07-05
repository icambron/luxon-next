/* global test expect */
import { setGregorian } from "../../../src/dateTime/core";
import { ymd, year, month, day, hour, minute, second, millisecond } from "../../../src/dateTime/core";

test("setGregorian sets Gregorian fields", () => {
  const dt = ymd(1982, 4, 25, 9, 23, 54, 123);
  expect(dt |> setGregorian({ year: 2012 }) |> year).toBe(2012);
  expect(dt |> setGregorian({ month: 2 }) |> month).toBe(2);
  expect(dt |> setGregorian({ month: 2 }) |> hour).toBe(9); // this will cross a DST for many people
  expect(dt |> setGregorian({ day: 5 }) |> day).toBe(5);
  expect(dt |> setGregorian({ hour: 4 }) |> hour).toBe(4);
  expect(dt |> setGregorian({ minute: 16 }) |> minute).toBe(16);
  expect(dt |> setGregorian({ second: 45 }) |> second).toBe(45);
  expect(dt |> setGregorian({ millisecond: 86 }) |> millisecond).toBe(86);
});

test("setGregorian(dt, { month }) doesn't go to the wrong month", () => {
  const before = ymd(1983, 5, 31);
  const after = before |> setGregorian({ month: 4 });
  expect(month(after)).toBe(4);
  expect(day(after)).toBe(30);
});

test("setGregorian(dt, { year }) doesn't wrap leap years", () => {
  const before = ymd(2012, 2, 29);
  const after = before |> setGregorian({ year: 2013 });
  expect(year(after)).toBe(2013);
  expect(month(after)).toBe(2);
  expect(day(after)).toBe(28);
});
