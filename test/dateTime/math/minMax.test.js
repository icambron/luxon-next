import { max, min, fromJSDate } from "../../../src/luxon";

test("min() returns the only dateTime if solo", () => {
  const m = min([fromJSDate(new Date(1982, 5, 25))]);
  expect(m).toBeTruthy();
  expect(m.valueOf()).toBe(fromJSDate(new Date(1982, 5, 25)).valueOf());
});

test("min() returns the min dateTime", () => {
  const m = min([
    fromJSDate(new Date(1982, 4, 25)),
    fromJSDate(new Date(1982, 3, 25)),
    fromJSDate(new Date(1982, 3, 26)),
  ]);
  expect(m.valueOf()).toBe(fromJSDate(new Date(1982, 3, 25)).valueOf());
});

test("min() returns null if no argument", () => {
  const m = min([]);
  expect(m).toBeNull();
});

test("max() returns the only dateTime if solo", () => {
  const m = max([fromJSDate(new Date(1982, 5, 25))]);
  expect(m).toBeTruthy();
  expect(m.valueOf()).toBe(fromJSDate(new Date(1982, 5, 25)).valueOf());
});

test("max() returns the max dateTime", () => {
  const m = max([
    fromJSDate(new Date(1982, 5, 25)),
    fromJSDate(new Date(1982, 3, 25)),
    fromJSDate(new Date(1982, 3, 26)),
  ]);
  expect(m.valueOf()).toBe(fromJSDate(new Date(1982, 5, 25)).valueOf());
});

test("max() returns null if no argument", () => {
  const m = max([]);
  expect(m).toBeNull();
});
