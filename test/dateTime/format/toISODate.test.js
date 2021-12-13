import { fromGregorian, toISODate, toFixedOffset } from "../../../src/luxon";

const dt = fromGregorian(
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

test("toISODate() returns ISO 8601 date", () => {
  expect(toISODate(dt)).toBe("1982-05-25");
});

test("toISODate() is local to the zone", () => {
  expect(toISODate(toFixedOffset(dt, -10 * 60))).toBe("1982-05-24");
});

test("toISODate() can output the basic format", () => {
  expect(toISODate(dt, { format: "basic" })).toBe("19820525");
});

test("toISODate() returns ISO 8601 date in format [±YYYYY]", () => {
  let dt = fromGregorian({ year: 118040, month: 5, day: 25 }, "utc");
  expect(toISODate(dt)).toBe("+118040-05-25");

  dt = fromGregorian({ year: -118040, month: 5, day: 25 }, "utc");
  expect(toISODate(dt)).toBe("-118040-05-25");
});

test("toISODate() correctly pads negative years", () => {
  let dt = fromGregorian({ year: -1, month: 1, day: 1 }, "utc");
  expect(toISODate(dt)).toBe("-0001-01-01");

  dt = fromGregorian({ year: -10, month: 1, day: 1 }, "utc");
  expect(toISODate(dt)).toBe("-0010-01-01");
});
