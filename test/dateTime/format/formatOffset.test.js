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

test("formatOffset accepts locales", () => {
  expect(formatOffset(dt, "be", { width: "long" } )).toEqual("Паўночнаамерыканскі ўсходні летні час");
});

test.each([
  ["long", "Eastern Daylight Time"],
  ["short", "EDT"],
  ["techie", "-0400"],
  ["standard", "-04:00"],
  ["narrow", "-4"],
])("formatOffset accepts width argument: %p", (width, expected) =>
  expect(formatOffset(dt, { width })).toEqual(expected)
);

