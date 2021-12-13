import {
  durFromMillis,
  durFromValues,
  durValues,
  durHours,
  durMinutes,
  durMilliseconds,
} from "../../../src/duration/core";
import { durShiftTo } from "../../../src/duration/convert";

test("shiftTo() rolls milliseconds up hours and minutes", () => {
  const dur = durFromMillis(5760000);
  let shifted = durShiftTo(dur, ["hours"]);
  expect(durHours(shifted)).toBe(1.6);

  const mod = durShiftTo(dur, ["hours", "minutes"]);
  expect(durValues(mod)).toEqual({ hours: 1, minutes: 36 });
});

test("shiftTo boils hours down milliseconds", () => {
  const dur = durFromValues({ hours: 1 });
  const shifted = durShiftTo(dur, ["milliseconds"]);
  expect(durMilliseconds(shifted)).toBe(3600000);
});

test("Duration boils hours down shiftTo minutes and milliseconds", () => {
  const dur = durFromValues({ hours: 1, seconds: 30 });
  const shifted = durShiftTo(dur, ["minutes", "milliseconds"]);
  expect(durValues(shifted)).toEqual({ minutes: 60, milliseconds: 30000 });
});

test("shiftTo boils down and then rolls up", () => {
  const dur = durFromValues({ years: 2, hours: 5000 });
  const shifted = durShiftTo(dur, ["months", "days", "minutes"]);
  expect(durValues(shifted)).toEqual({ months: 30, days: 28, minutes: 8 * 60 });
});

test("shiftTo throws on invalid convert", () => {
  const dur = durFromValues({ years: 2, hours: 5000 });
  expect(() => {
    durShiftTo(dur, ["months", "glorp"]);
  }).toThrow();
});

test("shiftTo tacks decimals onto the end", () => {
  const dur = durFromValues({ minutes: 73 });
  const shifted = durShiftTo(dur, ["hours"]);
  expect(durHours(shifted)).toBeCloseTo(1.2167, 4);
});

test("shiftTo deconstructs decimal inputs", () => {
  const dur = durFromValues({ hours: 2.3 });
  const shifted = durShiftTo(dur, ["hours", "minutes"]);
  expect(durHours(shifted)).toBe(2);
  expect(durMinutes(shifted)).toBeCloseTo(18, 8);
});

test("shiftTo without any convert no-ops", () => {
  const dur = durFromValues({ years: 3 });
  const shifted = durShiftTo(dur, []);
  expect(durValues(shifted)).toEqual({ years: 3 });
});

test("shiftTo accumulates when rolling up", () => {
  const dur = durFromValues({ minutes: 59, seconds: 183 });
  const shifted = durShiftTo(dur, ["hours", "minutes", "seconds"]);
  expect(durValues(shifted)).toEqual({
    hours: 1,
    minutes: 2,
    seconds: 3,
  });
});

test("shiftTo keeps unnecessary higher-order negative convert 0", () => {
  const dur = durFromValues({ milliseconds: -100 });
  const shifted = durShiftTo(dur, ["hours", "minutes", "seconds"]) 
  expect(durValues(shifted)).toEqual({
    hours: 0,
    minutes: 0,
    seconds: -0.1,
  });
});

test("shiftTo does not normalize values", () => {
  // Normalizing would convert to { quarters: 4, months: 1, days: 10 }
  // which would be converted back to 404 days instead
  const dur = durFromValues({ quarters: 0, months: 0, days: 400 });
  const shifted = durShiftTo(dur, ["days"]);
  expect(durValues(shifted)).toEqual({
    days: 400,
  });
});

test("shiftTo boils hours down to hours and minutes", () => {
  const dur = durFromValues({ hours: 2.4 });
  const shifted = durShiftTo(dur, ["hours", "minutes"]);
  expect(durValues(shifted)).toEqual({
    hours: 2,
    minutes: 24
  });
});
