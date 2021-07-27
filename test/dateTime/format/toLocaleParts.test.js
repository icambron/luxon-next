import { fromGregorian } from "../../../src/dateTime/core";
import { toLocaleParts } from "../../../src/dateTime/format";

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
    "utc"
  );

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
    { type: "dayPeriod", value: "AM" },
  ]);
});

test("DateTime#toLocaleParts accepts locale string from the dateTime", () => {
  expect(toLocaleParts("be")(dt)).toEqual([
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
    { type: "second", value: "54" },
  ]);
});

test("DateTime#toLocaleParts accepts intl settings", () => {
  expect(toLocaleParts({ calendar: "islamic" })(dt)).toEqual([
    { type: "month", value: "8" },
    { type: "literal", value: "/" },
    { type: "day", value: "2" },
    { type: "literal", value: "/" },
    { type: "year", value: "1402" },
    { type: "literal", value: " " },
    { type: "era", value: "AH" },
  ]);
});

test("DateTime#toLocaleParts accepts date formatting options", () => {
  expect(toLocaleParts({ timeStyle: "short" })(dt)).toEqual([
    { type: "hour", value: "9" },
    { type: "literal", value: ":" },
    { type: "minute", value: "23" },
    { type: "literal", value: " " },
    { type: "dayPeriod", value: "AM" },
  ]);
});

test("DateTime#toLocaleParts accepts locale and date formatting options", () => {
  expect(toLocaleParts("be", { timeStyle: "short" })(dt)).toEqual([
    { type: "hour", value: "09" }, // be likes 09 instead of just 9
    { type: "literal", value: ":" },
    { type: "minute", value: "23" },
  ]);
});
