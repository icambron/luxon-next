import { fromISOWeek, toISOWeek, toGregorian } from "../../../src/luxon";

test("fromISOWeek() builds the right Gregorian date", () => {
  const dt = fromISOWeek({ weekYear: 2016, weekNumber: 21, weekday: 3, hour: 1, minute: 2, second: 3, millisecond: 4 });
  expect(toGregorian(dt)).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 1,
    minute: 2,
    second: 3,
    millisecond: 4,
  });

  expect(toISOWeek(dt)).toEqual({
    weekYear: 2016,
    weekNumber: 21,
    weekday: 3,
    hour: 1,
    minute: 2,
    second: 3,
    millisecond: 4,
  });
});

test("fromISOWeek() defaults the weekday", () => {
  const dt = fromISOWeek({ weekYear: 2016, weekNumber: 21 });
  expect(toGregorian(dt)).toEqual({
    year: 2016,
    month: 5,
    day: 23,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISOWeek() defaults the weekNumber", () => {
  const dt = fromISOWeek({ weekYear: 2016 });
  expect(toGregorian(dt)).toEqual({
    year: 2016,
    month: 1,
    day: 4,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISOWeek() defaults the weekNumber for weird years too", () => {
  const dt = fromISOWeek({ weekYear: 2004 });
  expect(toGregorian(dt)).toEqual({
    year: 2003,
    month: 12,
    day: 29,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});
