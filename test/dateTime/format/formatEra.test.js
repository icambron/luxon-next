import { formatEra } from "../../../src/dateTime/format";
import { fromGregorian } from "../../../src/dateTime/core";

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

test("formatEra defaults to English", () => {
  expect(formatEra(dtMaker())).toEqual("AD");
});

test("formatEra accepts locales", () => {
  expect(formatEra(dtMaker(), "be")).toEqual("н.э.");
});

test("formatEra accepts options", () => {
  expect(formatEra(dtMaker(), { width: "long" })).toEqual("Anno Domini");
});

test("formatEra accepts locale and options", () => {
  expect(formatEra(dtMaker(), "be", { width: "long" })).toEqual("ад нараджэння Хрыстова");
});
