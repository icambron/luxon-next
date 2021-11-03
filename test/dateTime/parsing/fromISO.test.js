import { fromISO, simpleParsingOptions } from "../../../src/parse";
import { now, offset, toGregorian, zoneName } from "../../../src/dateTime/core";
import { toUTC } from "../../../src/dateTime/zone";
import { UnitOutOfRangeError } from "../../../src/model/errors";
import { withDefaultZone } from "../../helpers";
import { fixedOffsetZone } from "../../../src/model/zones/fixedOffsetZone";

test("fromISO() parses as local by default", () => {
  const dt = fromISO("2016-05-25T09:08:34.123");
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123,
  });
});

test("fromISO() uses the offset provided, but keeps the dateTime as local", () => {
  const dt = fromISO("2016-05-25T09:08:34.123+06:00");
  expect(dt |> toUTC() |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 3,
    minute: 8,
    second: 34,
    millisecond: 123,
  });
});

test("fromISO() uses the Z if provided, but keeps the dateTime as local", () => {
  const dt = fromISO("2016-05-25T09:08:34.123Z");
  expect(dt |> toUTC() |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123,
  });
});

test("fromISO() optionally adopts the UTC offset provided", () => {
  let dt = fromISO("2016-05-25T09:08:34.123+06:00", { useTargetZoneFromInput: true });
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123,
  });

  dt = fromISO("1983-10-14T13:30Z", { useTargetZoneFromInput: true });
  expect(offset(dt)).toBe(0);
  expect(dt |> toGregorian()).toEqual({
    year: 1983,
    month: 10,
    day: 14,
    hour: 13,
    minute: 30,
    second: 0,
    millisecond: 0,
  });

  // #580
  dt = fromISO("2016-05-25T09:08:34.123-00:30", { useTargetZoneFromInput: true });
  expect(zoneName(dt)).toBe("UTC-0:30");
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123,
  });
});

test("fromISO() can optionally specify a targetZone", () => {
  withDefaultZone(fixedOffsetZone(6 * 60), () => {
    let dt = fromISO("2016-05-25T09:08:34.123", { targetZone: "utc" });
    expect(offset(dt)).toEqual(0);
    expect(dt |> toGregorian()).toEqual({
      year: 2016,
      month: 5,
      day: 25,
      hour: 9 - 6, // minus 6 because the string was interpreted as +6 and converted to utc, so subtract
      minute: 8,
      second: 34,
      millisecond: 123,
    });
  });
});

test("fromISO()'s useTargetZoneFromInput overrides targetZone", () => {
  let dt = fromISO("2016-05-25T09:08:34.123+06:00", { targetZone: "utc", useTargetZoneFromInput: true });
  expect(offset(dt)).toEqual(6 * 60);
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123,
  });
});

test("fromISO() can optionally specify an interpretationZone for strings without offsets", () => {
  let dt = fromISO("2016-05-25T09:08:34.123", { interpretationZone: "utc" });
  expect(dt |> toUTC() |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123,
  });
});

test("fromISO()'s interpretationZone option doesn't affect strings with built-in offsets", () => {
  const dt = fromISO("2016-05-25T09:08:34.123+06:00", {interpretationZone: "utc"});
  expect(dt |> toUTC() |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 3,
    minute: 8,
    second: 34,
    millisecond: 123,
  });
});

test("fromISO()'s interpretationZone and targetZone can work in combination", () => {
  const dt = fromISO("2016-05-25T09:08:34.123", {interpretationZone: "utc", targetZone: "utc+6"});
  expect(offset(dt)).toEqual(6 * 60);
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9 + 6, // add 6 because we interpreted it as utc, then converted to +6, so we add 6
    minute: 8,
    second: 34,
    millisecond: 123,
  });
});

test("fromISO() accepts a simpleParingOptions that sets both target and interpretation zones", () => {
  const dt = fromISO("2016-05-25T09:08:34.123", simpleParsingOptions("utc+6"));
  expect(offset(dt)).toEqual(6 * 60);
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9, // hour matches because we didn't convert out of the interpretation zone
    minute: 8,
    second: 34,
    millisecond: 123,
  });
});

const isSame = (s, expected) => expect(fromISO(s) |> toGregorian()).toEqual(expected);

test("fromISO() accepts just the year", () => {
  isSame("2016", {
    year: 2016,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts year-month", () => {
  isSame("2016-05", {
    year: 2016,
    month: 5,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts yearmonth", () => {
  isSame("201605", {
    year: 2016,
    month: 5,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts year-month-day", () => {
  isSame("2016-05-25", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts yearmonthday", () => {
  isSame("20160525", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts extended years", () => {
  isSame("+002016-05-25", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  isSame("-002016-05-25", {
    year: -2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts year-month-dayThour", () => {
  isSame("2016-05-25T09", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts year-month-dayThour:minute", () => {
  isSame("2016-05-25T09:24", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 0,
    millisecond: 0,
  });

  isSame("2016-05-25T0924", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts year-month-dayThour:minute:second", () => {
  isSame("2016-05-25T09:24:15", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 0,
  });

  isSame("2016-05-25T092415", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 0,
  });
});

test("fromISO() accepts year-month-dayThour:minute:second.millisecond", () => {
  isSame("2016-05-25T09:24:15.123", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });

  isSame("2016-05-25T092415.123", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });

  isSame("2016-05-25T09:24:15,123", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });

  isSame("2016-05-25T09:24:15.1239999", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });

  isSame("2016-05-25T09:24:15.023", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 23,
  });

  // we round down always
  isSame("2016-05-25T09:24:15.3456", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 345,
  });

  isSame("2016-05-25T09:24:15.999999", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 999,
  });

  // Support up to 20 digits
  isSame("2016-05-25T09:24:15.12345678901234567890123456789", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });

  isSame("2016-05-25T09:24:15.1", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 100,
  });
});

test("fromISO() accepts year-week", () => {
  isSame("2016-W21", {
    year: 2016,
    month: 5,
    day: 23,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts year-week-day", () => {
  isSame("2016-W21-3", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  isSame("2016W213", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts year-week-dayTtime", () => {
  isSame("2016-W21-3T09:24:15.123", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });

  isSame("2016W213T09:24:15.123", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });
});

test("fromISO() accepts year-ordinal", () => {
  isSame("2016-200", {
    year: 2016,
    month: 7,
    day: 18,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  isSame("2016200", {
    year: 2016,
    month: 7,
    day: 18,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts year-ordinalTtime", () => {
  isSame("2016-200T09:24:15.123", {
    year: 2016,
    month: 7,
    day: 18,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });
});

test("fromISO() accepts year-ordinalTtime+offset", () => {
  const dt = fromISO("2016-200T09:24:15.123+0600", { useTargetZoneFromInput: true });
  expect(zoneName(dt)).toBe("UTC+6");
  expect(dt|> toGregorian()).toEqual({
    year: 2016,
    month: 7,
    day: 18,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });
});

test("fromISO() accepts hour:minute:second.millisecond", () => {
  const { year, month, day } = now() |> toGregorian();
  isSame("09:24:15.123", {
    year,
    month,
    day,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });
});

test("fromISO() accepts hour:minute:second,millisecond", () => {
  const { year, month, day } = now() |> toGregorian();
  isSame("09:24:15,123", {
    year,
    month,
    day,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });
});

test("fromISO() accepts hour:minute:second", () => {
  const { year, month, day } = now() |> toGregorian();
  isSame("09:24:15", {
    year,
    month,
    day,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 0,
  });
});

test("fromISO() accepts hour:minute", () => {
  const { year, month, day } = now() |> toGregorian();
  isSame("09:24", {
    year,
    month,
    day,
    hour: 9,
    minute: 24,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts hour:minute", () => {
  const { year, month, day } = now() |> toGregorian();
  isSame("09:24", {
    year,
    month,
    day,
    hour: 9,
    minute: 24,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() accepts 24:00", () => {
  isSame("2018-01-04T24:00", {
    year: 2018,
    month: 1,
    day: 5,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test("fromISO() doesn't accept 24:23", () => {
  expect(() => fromISO("2018-05-25T24:23")).toThrow(UnitOutOfRangeError);
});

test("fromISO() accepts some technically incorrect stuff", () => {
  // these are formats that aren't technically valid but we parsing anyway.
  // Testing them more to document them than anything else
  isSame("2016-05-25T0924:15.123", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });

  isSame("2016-05-25T09:2415.123", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123,
  });

  isSame("2016-W213", {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

test.each([
  null,
  "",
  " ",
  "2016-1",
  "2016-1-15",
  "2016-01-5",
  "2016-01-00",
  "2016-00-01",
  "2016-05-25 08:34:34",
  "2016-05-25Q08:34:34",
  "2016-05-25T8:04:34",
  "2016-05-25T08:4:34",
  "2016-05-25T08:04:4",
  "2016-05-25T:03:4",
  "2016-05-25T08::4",
  "2016-W32-02",
])("fromISO() rejects %p", (input) =>
  expect(() => {
    fromISO(input);
  }).toThrow()
);
