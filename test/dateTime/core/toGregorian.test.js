/* global test expect */

import { toGregorian, ymd } from "../../../src/dateTime/core";

test("toGregorian returns the object", () => {
  const dt = ymd(1982, 5, 25, 9, 23, 54, 123);
  expect(toGregorian(dt)).toEqual({
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  });
});
