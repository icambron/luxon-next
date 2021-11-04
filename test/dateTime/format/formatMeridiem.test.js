import { fromGregorian } from "../../../src/dateTime/core";
import { formatMeridiem } from "../../../src/dateTime/format";

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

test("formatMeridiem defaults to English", () => {
  expect(formatMeridiem()(dtMaker())).toEqual("AM");
});

test("formatMeridiem accepts a locale", () => {
  expect(formatMeridiem("en-GB")(dtMaker())).toEqual("am");
});

test("formatMeridiem accepts a width option", () => {
  expect(formatMeridiem({ width: "long" })(dtMaker())).toEqual("in the morning");
});

test("formatMeridiem accepts both a locale and a width", () => {
  expect(formatMeridiem("fr", { width: "long" })(dtMaker())).toEqual("du matin");
});
