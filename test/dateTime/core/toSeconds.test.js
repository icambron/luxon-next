/* global test expect */

import { fromMillis, toSeconds, toUTC } from "../../../src/luxon";

test("fromMillis translates to the right gregorian value", () => {
  const dt = toUTC(fromMillis(1615082936814));
  expect(toSeconds(dt)).toBe(1615082936814 / 1000.0);
});
