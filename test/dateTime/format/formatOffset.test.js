import { fromGregorian, formatOffset } from "../../../src/luxon";

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
  "America/New_York"
);

test("formatOffset defaults to English", () => {
  expect(formatOffset(dt)).toEqual("EDT");
});

// test("formatOffset accepts locales", () => {
//   expect(formatOffset(dtMaker(), "be")).toEqual("жнівень");
// });

test.each([
  ["long", "Eastern Daylight Time"],
  ["short", "EDT"],
  ["techie", "-0400"],
  ["standard", "-04:00"],
  ["narrow", "-4"],
])("formatOffset accepts width argument: %p", (width, expected) =>
  expect(formatOffset(dt, { width })).toEqual(expected)
);

// test("formatOffset accepts locale and options", () => {
//   expect(formatOffset("be", { width: "short" })(dtMaker())).toEqual("жні");
// });
//
// test("formatOffset accepts dtf options", () => {
//   expect(formatOffset(dtMaker(), { calendar: "coptic" })).toEqual("Epep");
//   expect(formatOffset(dtMaker(), "fr", { numberingSystem: "mong", width: "2-digit" })).toEqual("᠐᠘");
//   expect(formatOffset(dtMaker(), { locale: "fr", numberingSystem: "mong", width: "2-digit" })).toEqual("᠐᠘");
//   expect(formatOffset(dtMaker(), { numberingSystem: "mong", width: "2-digit" })).toEqual("᠐᠘");
// });
//
