import { fromHTTP, toGregorian, toUTC } from "../../../src/luxon";

test("fromHTTP() can parse RFC 1123", () => {
  const dt = fromHTTP("Sun, 06 Nov 1994 08:49:37 GMT");
  expect(toGregorian(toUTC(dt))).toEqual({
    year: 1994,
    month: 11,
    day: 6,
    hour: 8,
    minute: 49,
    second: 37,
    millisecond: 0,
  });
});

test("fromHTTP() can parse RFC 850", () => {
  const dt = fromHTTP("Sunday, 06-Nov-94 08:49:37 GMT");
  expect(toGregorian(toUTC(dt))).toEqual({
    year: 1994,
    month: 11,
    day: 6,
    hour: 8,
    minute: 49,
    second: 37,
    millisecond: 0,
  });
});

test("fromHTTP() can parse ASCII dates with one date digit", () => {
  const dt = fromHTTP("Sun Nov  6 08:49:37 1994");
  expect(toGregorian(toUTC(dt))).toEqual({
    year: 1994,
    month: 11,
    day: 6,
    hour: 8,
    minute: 49,
    second: 37,
    millisecond: 0,
  });
});

test("fromHTTP() can parse ASCII dates with two date digits", () => {
  const dt = fromHTTP("Wed Nov 16 08:49:37 1994");
  expect(toGregorian(toUTC(dt))).toEqual({
    year: 1994,
    month: 11,
    day: 16,
    hour: 8,
    minute: 49,
    second: 37,
    millisecond: 0,
  });
});

test.each([
  "goats",
  "Spork Nov 32 08:49:37 1994",
  "Wed Spork 32 08:49:37 1994",
  "Wed Nov 32 08:49:37 1994",
  "Wed Nov 32 08:49:37 Spork",
])("fromHTTP throws for bad input %p", (input) => {
  expect(() => fromHTTP(input)).toThrow();
});
