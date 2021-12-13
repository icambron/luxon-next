import { fromGregorian, toISOWeekDate } from "../../../src/luxon";

const dt = fromGregorian(
  {
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  },
  "utc"
);

test("toISOWeekDate() returns ISO 8601 date", () => {
  expect(toISOWeekDate(dt)).toBe("1982-W21-2");
});
