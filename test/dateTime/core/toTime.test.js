/* global test expect */
import { toTime, ymd } from "../../../src/dateTime/core";

test("toTime returns the time representation of the DateTime", () => {
  const dt = ymd(1982, 5, 25, 9, 23, 54, 123);
  expect(toTime(dt)).toEqual({
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  });
});
