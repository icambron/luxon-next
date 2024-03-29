/* global test expect */
import { now, toJSDate } from "../../../src/luxon";

test("now() has today's date", () => {
  const dt = now();
  expect(toJSDate(dt).getDate()).toBe(new Date().getDate());
});
