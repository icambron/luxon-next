import { fromGregorian, formatMeridiem } from "../../../src/luxon";

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
  expect(formatMeridiem(dtMaker())).toEqual("AM");
});

test("formatMeridiem accepts a locale", () => {
  expect(formatMeridiem(dtMaker(), "en-GB")).toEqual("am");
});

test("formatMeridiem accepts a width option", () => {
  expect(formatMeridiem(dtMaker(), { width: "long" })).toEqual("in the morning");
});

test("formatMeridiem accepts both a locale and a width", () => {
  expect(formatMeridiem(dtMaker(), { locale: "fr", width: "long" })).toEqual("du matin");
});
