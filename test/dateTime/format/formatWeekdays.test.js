import { fromGregorian } from "../../../src/dateTime/core";
import { formatWeekday } from "../../../src/dateTime/format";

const dtMaker = () =>
  fromGregorian(
    {
      year: 2014,
      month: 8,
      day: 6,
      hour: 9,
      minute: 23,
      second: 54,
      millisecond: 123,
    },
    "utc"
  );

test("formatWeekday defaults to English", () => {
  expect(formatWeekday()(dtMaker())).toEqual("Wednesday");
});

test("formatWeekday accepts a locale", () => {
  expect(formatWeekday("fr")(dtMaker())).toEqual("mercredi");
});

test("formatWeekday accepts a width option", () => {
  expect(formatWeekday({ width: "short" })(dtMaker())).toEqual("Wed");
});

test("formatWeekday accepts both a locale and a width", () => {
  expect(formatWeekday("fr", { width: "short" })(dtMaker())).toEqual("mer.");
});
