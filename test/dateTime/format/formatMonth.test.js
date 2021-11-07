import { fromGregorian } from "../../../src/dateTime/core";
import { formatMonth } from "../../../src/dateTime/format";

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

test("formatMonth defaults to English", () => {
  expect(formatMonth()(dtMaker())).toEqual("August");
});

test("formatMonth accepts locales", () => {
  expect(formatMonth("be")(dtMaker())).toEqual("жнівень");
});

test("formatMonth accepts format options", () => {
  expect(formatMonth({ width: "2-digit" })(dtMaker())).toEqual("08");
});

test("formatMonth accepts locale and options", () => {
  expect(formatMonth("be", { width: "short" })(dtMaker())).toEqual("жні");
});

test("formatMonth accepts dtf options", () => {
  expect(formatMonth({ calendar: "coptic" })(dtMaker())).toEqual("Epep");
  expect(formatMonth("fr", { numberingSystem: "mong", width: "2-digit" })(dtMaker())).toEqual("᠐᠘");
  expect(formatMonth({ locale: "fr", numberingSystem: "mong", width: "2-digit" })(dtMaker())).toEqual("᠐᠘");
  expect(formatMonth({ numberingSystem: "mong", width: "2-digit" })(dtMaker())).toEqual("᠐᠘");
});
