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
  let hrs = durShiftTo(["hours"])(dur) |> durHours;
  expect(hrs).toBe(1.6);

  const mod = dur |> durShiftTo(["hours", "minutes"]) |> durValues;
  expect(mod).toEqual({ hours: 1, minutes: 36 });
});

test("shiftTo boils hours down milliseconds", () => {
  const millis = durFromValues({ hours: 1 }) |> durShiftTo(["milliseconds"]) |> durMilliseconds;
  expect(millis).toBe(3600000);
});

test("Duration boils hours down shiftTo minutes and milliseconds", () => {
  const vals = durFromValues({ hours: 1, seconds: 30 }) |> durShiftTo(["minutes", "milliseconds"]) |> durValues;
  expect(vals).toEqual({ minutes: 60, milliseconds: 30000 });
});

test("shiftTo boils down and then rolls up", () => {
  const vals = durFromValues({ years: 2, hours: 5000 }) |> durShiftTo(["months", "days", "minutes"]) |> durValues;
  expect(vals).toEqual({ months: 30, days: 28, minutes: 8 * 60 });
});

test("shiftTo throws on invalid convert", () => {
  expect(() => {
    durFromValues({ years: 2, hours: 5000 }) |> durShiftTo(["months", "glorp"]);
  }).toThrow();
});

test("shiftTo tacks decimals onto the end", () => {
  const hrs = durFromValues({ minutes: 73 }) |> durShiftTo(["hours"]) |> durHours;
  expect(hrs).toBeCloseTo(1.2167, 4);
});

test("shiftTo deconstructs decimal inputs", () => {
  const dur = durFromValues({ hours: 2.3 }) |> durShiftTo(["hours", "minutes"]);
  expect(dur |> durHours).toBe(2);
  expect(dur |> durMinutes).toBeCloseTo(18, 8);
});

test("shiftTo without any convert no-ops", () => {
  const dur = durFromValues({ years: 3 }) |> durShiftTo([]) |> durValues;
  expect(dur).toEqual({ years: 3 });
});

test("shiftTo accumulates when rolling up", () => {
  expect(
    durFromValues({ minutes: 59, seconds: 183 }) |> durShiftTo(["hours", "minutes", "seconds"]) |> durValues
  ).toEqual({
    hours: 1,
    minutes: 2,
    seconds: 3,
  });
});

test("shiftTo keeps unnecessary higher-order negative convert 0", () => {
  expect(durFromValues({ milliseconds: -100 }) |> durShiftTo(["hours", "minutes", "seconds"]) |> durValues).toEqual({
    hours: 0,
    minutes: 0,
    seconds: -0.1,
  });
});

test("shiftTo does not normalize values", () => {
  // Normalizing would convert to { quarters: 4, months: 1, days: 10 }
  // which would be converted back to 404 days instead
  expect(durFromValues({ quarters: 0, months: 0, days: 400 }) |> durShiftTo(["days"]) |> durValues).toEqual({
    days: 400,
  });
});
