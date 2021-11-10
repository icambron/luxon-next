import { fromGregorian } from "../../../src/dateTime/core";
import { toISOWeekDate } from "../../../src/dateTime/format";

const dtMaker = () =>
  fromGregorian(
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
const dt = dtMaker();

test("toISOWeekDate() returns ISO 8601 date", () => {
  expect(dt |> toISOWeekDate()).toBe("1982-W21-2");
});
