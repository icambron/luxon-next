import { fromGregorian, formatMonth } from "../../../src/luxon";

const dt = fromGregorian(
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
  expect(formatMonth(dt)).toEqual("August");
});

test("formatMonth accepts locales", () => {
  expect(formatMonth(dt, "be")).toEqual("жнівень");
});

test("formatMonth accepts format options", () => {
  expect(formatMonth(dt, { width: "2-digit" })).toEqual("08");
});

test("formatMonth accepts locale and options", () => {
  expect(formatMonth(dt, "be", { width: "short" })).toEqual("жні");
});

test("formatMonth accepts dtf options", () => {
  expect(formatMonth(dt, { calendar: "coptic" })).toEqual("Epep");
  expect(formatMonth(dt, "fr", { numberingSystem: "mong", width: "2-digit" })).toEqual("᠐᠘");
  expect(formatMonth(dt, { locale: "fr", numberingSystem: "mong", width: "2-digit" })).toEqual("᠐᠘");
  expect(formatMonth(dt, { numberingSystem: "mong", width: "2-digit" })).toEqual("᠐᠘");
});
