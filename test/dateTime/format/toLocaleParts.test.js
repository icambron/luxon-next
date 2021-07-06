import { fromGregorian } from "../../../src/dateTime/core";
import { TIME_24_SIMPLE, toLocaleParts } from "../../../src/dateTime/format";

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
      "utc");

const dt = dtMaker();

test("toLocaleParts returns a en-US by default", () => {
  expect(toLocaleParts()(dt)).toEqual([
    { type: "month", value: "May" },
    { type: "literal", value: " " },
    { type: "day", value: "25" },
    { type: "literal", value: ", " },
    { type: "year", value: "1982" },
    { type: "literal", value: ", " },
    { type: "hour", value: "9" },
    { type: "literal", value: ":" },
    { type: "minute", value: "23" },
    { type: "literal", value: ":" },
    { type: "second", value: "54" },
    { type: "literal", value: " " },
    { type: "dayPeriod", value: "AM" }
  ]);
});

test("DateTime#toLocaleParts accepts locale settings from the dateTime", () => {
  expect(toLocaleParts({ locale: "be" })(dt)).toEqual([
      { type: "day", value: "25" },
      { type: "literal", value: "." },
      { type: "month", value: "05" },
      { type: "literal", value: "." },
      { type: "year", value: "1982" },
      { type: "literal", value: ", " },
      { type: "hour", value: "09" },
      { type: "literal", value: ":" },
      { type: "minute", value: "23" },
      { type: "literal", value: ":" },
      { type: "second", value: "54" }
    ]);
});

test("DateTime#toLocaleParts accepts date formatting options", () => {
  expect(toLocaleParts({}, TIME_24_SIMPLE)(dt)).toEqual([
    { type: "hour", value: "09" },
    { type: "literal", value: ":" },
    { type: "minute", value: "23" },
  ]);
});
