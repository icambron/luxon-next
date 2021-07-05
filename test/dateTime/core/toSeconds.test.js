/* global test expect */

import { fromMillis, toSeconds } from "../../../src/dateTime/core";
import { toUTC } from "../../../src/dateTime/zone";

test("fromMillis translates to the right gregorian value", () => {
  const dt = fromMillis(1615082936814) |> toUTC();
  expect(toSeconds(dt)).toBe(1615082936814 / 1000.0);
});
