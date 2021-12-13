/* global test expect */

import { day, fromGregorian, hour, minute, offset, second, endOf, minus, plus, startOf } from "../../../src/luxon";
import { withNow } from "../../helpers";

const ny = (year, month, day, hour) => fromGregorian({ year, month, day, hour }, "America/New_York");

test("Hole dates are bumped forward", () => {
  const d = ny(2017, 3, 12, 2);
  expect(hour(d)).toBe(3);
  expect(offset(d)).toBe(-4 * 60);
});

// this is questionable behavior, but I wanted to document it
test("Ambiguous dates pick the one with the current offset", () => {
  withNow(
    () => 1495653314595, // May 24, 2017
    () => {
      const d = ny(2017, 11, 5, 1);
      expect(hour(d)).toBe(1);
      expect(offset(d)).toBe(-4 * 60);
    }
  );

  withNow(
    () => 1484456400000, // Jan 15, 2017
    () => {
      const d = ny(2017, 11, 5, 1);
      expect(hour(d)).toBe(1);
      expect(offset(d)).toBe(-5 * 60);
    }
  );
});

test("Adding an hour to land on the Spring Forward springs forward", () => {
  const d = plus(ny(2017, 3, 12, 1), { hours: 1 });
  expect(hour(d)).toBe(3);
  expect(offset(d)).toBe(-4 * 60);
});

test("Subtracting an hour to land on the Spring Forward springs forward", () => {
  const d = minus(ny(2017, 3, 12, 3), { hours: 1 });
  expect(hour(d)).toBe(1);
  expect(offset(d)).toBe(-5 * 60);
});

test("Adding an hour to land on the Fall Back falls back", () => {
  const d = plus(ny(2017, 11, 5, 0), { hours: 2 });
  expect(hour(d)).toBe(1);
  expect(offset(d)).toBe(-5 * 60);
});

test("Subtracting an hour to land on the Fall Back falls back", () => {
  let d = minus(ny(2017, 11, 5, 3), { hours: 2 });
  expect(hour(d)).toBe(1);
  expect(offset(d)).toBe(-5 * 60);

  d = minus(d, { hours: 1 });
  expect(hour(d)).toBe(1);
  expect(offset(d)).toBe(-4 * 60);
});

test("Changing a calendar date to land on a hole bumps forward", () => {
  let d = plus(ny(2017, 3, 11, 2), { days: 1 });
  expect(hour(d)).toBe(3);
  expect(offset(d)).toBe(-4 * 60);

  d = minus(ny(2017, 3, 13, 2), { days: 1 });
  expect(hour(d)).toBe(3);
  expect(offset(d)).toBe(-4 * 60);
});

test("Changing a calendar date to land on an ambiguous time chooses the closest one", () => {
  let d = plus(ny(2017, 11, 4, 1), { days: 1 });
  expect(hour(d)).toBe(1);
  expect(offset(d)).toBe(-4 * 60);

  d = minus(ny(2017, 11, 6, 1), { days: 1 });
  expect(hour(d)).toBe(1);
  expect(offset(d)).toBe(-5 * 60);
});

test("Start of a 0:00->1:00 DST day is 1:00", () => {
  const d = startOf(
    fromGregorian(
      {
        year: 2017,
        month: 10,
        day: 15,
      },
      "America/Sao_Paulo"
    ),
    "day"
  );
  expect(day(d)).toBe(15);
  expect(hour(d)).toBe(1);
  expect(minute(d)).toBe(0);
  expect(second(d)).toBe(0);
});

test("End of a 0:00->1:00 DST day is 23:59", () => {
  const d = endOf(
    fromGregorian(
      {
        year: 2017,
        month: 10,
        day: 15,
      },
      "America/Sao_Paulo"
    ),
    "day"
  );
  expect(day(d)).toBe(15);
  expect(hour(d)).toBe(23);
  expect(minute(d)).toBe(59);
  expect(second(d)).toBe(59);
});
