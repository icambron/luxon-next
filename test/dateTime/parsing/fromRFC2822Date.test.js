import { fromRFC2822, simpleParseOpts, day, offset, toGregorian, zone, toUTC } from "../../../src/luxon";

test("fromRFC2822() accepts full format", () => {
  const dt = fromRFC2822("Tue, 01 Nov 2016 13:23:12 +0630");
  expect(toGregorian(toUTC(dt))).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 6,
    minute: 53,
    second: 12,
    millisecond: 0,
  });
});

test.each([
  ["Sun, 12 Apr 2015 05:06:07 GMT", [2015, 4, 12, 5, 6, 7]],
  ["Tue, 01 Nov 2016 01:23:45 +0000", [2016, 11, 1, 1, 23, 45]],
  ["Tue, 01 Nov 16 04:23:45 Z", [2016, 11, 1, 4, 23, 45]],
  ["01 Nov 2016 05:23:45 z", [2016, 11, 1, 5, 23, 45]],
  ["Mon, 02 Jan 2017 06:00:00 -0800", [2017, 1, 2, 6 + 8, 0, 0]],
  ["Mon, 02 Jan 2017 06:00:00 +0800", [2017, 1, 1, 22, 0, 0]],
  ["Mon, 02 Jan 2017 06:00:00 +0330", [2017, 1, 2, 2, 30, 0]],
  ["Mon, 02 Jan 2017 06:00:00 -0330", [2017, 1, 2, 9, 30, 0]],
  ["Mon, 02 Jan 2017 06:00:00 PST", [2017, 1, 2, 6 + 8, 0, 0]],
  ["Mon, 02 Jan 2017 06:00:00 PDT", [2017, 1, 2, 6 + 7, 0, 0]],
])("fromRFC2822 can parse %p", (input, expected) => {
  const { day, hour, minute, month, second, year } = toGregorian(toUTC(fromRFC2822(input)));
  const actual = [year, month, day, hour, minute, second];
  expect(actual).toEqual(expected);
});

test("fromRFC2822() ignores incorrect days of the week", () => {
  expect(day(fromRFC2822("Wed, 01 Nov 2016 13:23:12 +0600"))).toEqual(1);
});

test("fromRFC2822() can elide the day of the week", () => {
  const dt = fromRFC2822("01 Nov 2016 13:23:12 +0600");
  expect(toGregorian(toUTC(dt))).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 7,
    minute: 23,
    second: 12,
    millisecond: 0,
  });
});

test("fromRFC2822() can elide seconds", () => {
  const dt = fromRFC2822("01 Nov 2016 13:23 +0600");
  expect(toGregorian(toUTC(dt))).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 7,
    minute: 23,
    second: 0,
    millisecond: 0,
  });
});

test("fromRFC2822() can use Z", () => {
  const dt = fromRFC2822("01 Nov 2016 13:23:12 Z");
  expect(toGregorian(toUTC(dt))).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 13,
    minute: 23,
    second: 12,
    millisecond: 0,
  });
});

test("fromRFC2822() can use a weird subset of offset abbreviations", () => {
  const dt = fromRFC2822("01 Nov 2016 13:23:12 EST");
  expect(toGregorian(toUTC(dt))).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 18,
    minute: 23,
    second: 12,
    millisecond: 0,
  });
});

test("fromRFC2822() uses -0000 to indicate that the zone is unknown", () => {
  let dt = fromRFC2822("01 Nov 2016 13:23:12 -0000");
  expect(zone(dt).type).toBe("system");
  expect(toGregorian(dt)).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 13,
    minute: 23,
    second: 12,
    millisecond: 0,
  });

  dt = fromRFC2822("01 Nov 2016 13:23:12 -0000", simpleParseOpts("utc"));
  expect(zone(dt).type).toBe("fixed");
  expect(offset(dt)).toEqual(0);
  expect(toGregorian(dt)).toEqual({
    year: 2016,
    month: 11,
    day: 1,
    hour: 13,
    minute: 23,
    second: 12,
    millisecond: 0,
  });
});
