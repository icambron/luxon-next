/* global test expect */

import { day, fromGregorian, hour, minute, offset, second } from "../../../src/dateTime/core";
import { withNow } from "../../helpers";
import { endOf, minus, plus, startOf } from "../../../src/dateTime/math";

const ny = (year, month, day, hour) => fromGregorian({ year, month, day, hour }, "America/New_York");

test("Hole dates are bumped forward", () => {
  const d = ny(2017, 3, 12, 2);
  expect(d |> hour).toBe(3);
  expect(d |> offset).toBe(-4 * 60);
});

// this is questionable behavior, but I wanted to document it
test("Ambiguous dates pick the one with the current offset", () => {
  withNow(
    () => 1495653314595, // May 24, 2017
    () => {
      const d = ny(2017, 11, 5, 1);
      expect(d |> hour).toBe(1);
      expect(d |> offset).toBe(-4 * 60);
    }
  );

  withNow(
    () => 1484456400000, // Jan 15, 2017
    () => {
      const d = ny(2017, 11, 5, 1);
      expect(d |> hour).toBe(1);
      expect(d |> offset).toBe(-5 * 60);
    }
  );
});

test("Adding an hour to land on the Spring Forward springs forward", () => {
  const d = ny(2017, 3, 12, 1) |> ((x) => plus(x, { hours: 1 }));
  expect(d |> hour).toBe(3);
  expect(d |> offset).toBe(-4 * 60);
});

test("Subtracting an hour to land on the Spring Forward springs forward", () => {
  const d = ny(2017, 3, 12, 3) |> ((x) => minus(x, { hours: 1 }));
  expect(d |> hour).toBe(1);
  expect(d |> offset).toBe(-5 * 60);
});

test("Adding an hour to land on the Fall Back falls back", () => {
  const d = ny(2017, 11, 5, 0) |> ((x) => plus(x, { hours: 2 }));
  expect(d |> hour).toBe(1);
  expect(d |> offset).toBe(-5 * 60);
});

test("Subtracting an hour to land on the Fall Back falls back", () => {
  let d = ny(2017, 11, 5, 3) |> ((x) => minus(x, { hours: 2 }));
  expect(d |> hour).toBe(1);
  expect(d |> offset).toBe(-5 * 60);

  d = minus(d, { hours: 1 });
  expect(d |> hour).toBe(1);
  expect(d |> offset).toBe(-4 * 60);
});

test("Changing a calendar date to land on a hole bumps forward", () => {
  let d = ny(2017, 3, 11, 2) |> ((x) => plus(x, { days: 1 }));
  expect(d |> hour).toBe(3);
  expect(d |> offset).toBe(-4 * 60);

  d = ny(2017, 3, 13, 2) |> ((x) => minus(x, { days: 1 }));
  expect(d |> hour).toBe(3);
  expect(d |> offset).toBe(-4 * 60);
});

test("Changing a calendar date to land on an ambiguous time chooses the closest one", () => {
  let d = ny(2017, 11, 4, 1) |> ((x) => plus(x, { days: 1 }));
  expect(d |> hour).toBe(1);
  expect(d |> offset).toBe(-4 * 60);

  d = ny(2017, 11, 6, 1) |> ((x) => minus(x, { days: 1 }));
  expect(d |> hour).toBe(1);
  expect(d |> offset).toBe(-5 * 60);
});

test("Start of a 0:00->1:00 DST day is 1:00", () => {
  const d =
    fromGregorian(
      {
        year: 2017,
        month: 10,
        day: 15,
      },
      "America/Sao_Paulo"
    ) |> ((x) => startOf(x, "day"));
  expect(d |> day).toBe(15);
  expect(d |> hour).toBe(1);
  expect(d |> minute).toBe(0);
  expect(d |> second).toBe(0);
});

test("End of a 0:00->1:00 DST day is 23:59", () => {
  const d =
    fromGregorian(
      {
        year: 2017,
        month: 10,
        day: 15,
      },
      "America/Sao_Paulo"
    ) |> ((x) => endOf(x, "day"));
  expect(d |> day).toBe(15);
  expect(d |> hour).toBe(23);
  expect(d |> minute).toBe(59);
  expect(d |> second).toBe(59);
});
