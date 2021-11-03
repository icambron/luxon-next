import { fromISOWeek, toISOWeek } from "../../../src/dateTime/isoWeek";
import { toGregorian } from "../../../src/dateTime/core";

test("fromISOWeek() builds the right Gregorian date", () => {
  const dt = fromISOWeek({ weekYear: 2016, weekNumber: 21, weekday: 3, hour: 1, minute: 2, second: 3, millisecond: 4 });
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 1,
    minute: 2,
    second: 3,
    millisecond: 4,
  });

  expect(dt |> toISOWeek()).toEqual({
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
  expect(dt |> toGregorian()).toEqual({
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
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 1,
    day: 4,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});
