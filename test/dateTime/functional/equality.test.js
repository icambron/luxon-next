/* global test expect */

import {ymd} from "../../../src/dateTime/core";
import {setZone} from "../../../src/dateTime/zone";

test("equals self", () => {
  const l = ymd(2017, 5, 15);
  expect(l.equals(l)).toBe(true);
});

test("equals identically constructed", () => {
  const l1 = ymd(2017, 5, 15);
  const l2 = ymd(2017, 5, 15);
  expect(l1.equals(l2)).toBe(true);
});

test("does not equal a different zone", () => {
  const l1 = ymd(2017, 5, 15) |> (x => setZone(x, "America/New_York"));
  const l2 = ymd(2017, 5, 15) |> (x => setZone(x, "America/Los_Angeles"));
  expect(l1.equals(l2)).toBe(false);
});

test("does not equal undefined", () => {
  const l1 = ymd(2017, 5, 15) |> (x => setZone(x, "America/New_York"));
  expect(l1.equals(undefined)).toBe(false);
});

test("does not equal null", () => {
  const l1 = ymd(2017, 5, 15) |> (x => setZone(x, "America/New_York"));
  expect(l1.equals(null)).toBe(false);
});

test("does not equal a random thing", () => {
  const l1 = ymd(2017, 5, 15) |> (x => setZone(x, "America/New_York"));
  expect(l1.equals("splort")).toBe(false);
});
