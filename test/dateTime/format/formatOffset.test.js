import { fromGregorian } from "../../../src/dateTime/core";
import { formatOffset } from "../../../src/dateTime/format";

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
    "America/New_York"
  );

test("formatOffset defaults to English", () => {
  expect(formatOffset()(dtMaker())).toEqual("EDT");
});

// test("formatOffset accepts locales", () => {
//   expect(formatOffset("be")(dtMaker())).toEqual("жнівень");
// });

test.each([
  ["long", "Eastern Daylight Time"],
  ["short", "EDT"],
  ["techie", "-0400"],
  ["standard", "-04:00"],
  ["narrow", "-4"]
])("formatOffset accepts width argument: %p", (width, expected ) =>
  expect(formatOffset({ width })(dtMaker())).toEqual(expected));

// test("formatOffset accepts locale and options", () => {
//   expect(formatOffset("be", { width: "short" })(dtMaker())).toEqual("жні");
// });
//
// test("formatOffset accepts dtf options", () => {
//   expect(formatOffset({ calendar: "coptic" })(dtMaker())).toEqual("Epep");
//   expect(formatOffset("fr", { numberingSystem: "mong", width: "2-digit" })(dtMaker())).toEqual("᠐᠘");
//   expect(formatOffset({ locale: "fr", numberingSystem: "mong", width: "2-digit" })(dtMaker())).toEqual("᠐᠘");
//   expect(formatOffset({ numberingSystem: "mong", width: "2-digit" })(dtMaker())).toEqual("᠐᠘");
// });
//