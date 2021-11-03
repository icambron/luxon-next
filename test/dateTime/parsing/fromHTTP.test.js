import { fromHTTP } from "../../../src/parse";
import { toGregorian } from "../../../src/dateTime/core";
import { toUTC } from "../../../src/dateTime/zone";

test("fromHTTP() can parse RFC 1123", () => {
  const dt = fromHTTP("Sun, 06 Nov 1994 08:49:37 GMT");
  expect(dt |> toUTC() |> toGregorian()).toEqual({
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
  expect(dt |> toUTC() |> toGregorian()).toEqual({
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
  expect(dt |> toUTC() |> toGregorian()).toEqual({
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
  expect(dt |> toUTC() |> toGregorian()).toEqual({
    year: 1994,
    month: 11,
    day: 16,
    hour: 8,
    minute: 49,
    second: 37,
    millisecond: 0,
  });
});