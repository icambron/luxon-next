/* global test expect */
import { toJSDate, fromGregorian, toMillis } from "../../../src/luxon";

test("toJSDate() returns a native Date equivalent", () => {
  const dt = fromGregorian({
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  });

  const js = toJSDate(dt);
  expect(js).toBeInstanceOf(Date);
  expect(js.getTime()).toBe(toMillis(dt));
});
