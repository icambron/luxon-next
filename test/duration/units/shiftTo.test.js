import { fromMillis, fromValues, values, hours, minutes, milliseconds } from "../../../src/duration/core";
import { shiftTo } from "../../../src/duration/convert";

test("shiftTo() rolls milliseconds up hours and minutes", () => {
  const dur = fromMillis(5760000);
  let hrs = shiftTo(["hours"])(dur) |> hours
  expect(hrs).toBe(1.6);

  const mod = dur |> shiftTo(["hours", "minutes"]) |> values;
  expect(mod).toEqual({ hours: 1, minutes: 36 });
});

test("shiftTo boils hours down milliseconds", () => {
  const millis = fromValues({ hours: 1 }) |> shiftTo(["milliseconds"]) |> milliseconds;
  expect(millis).toBe(3600000);
});

test("Duration boils hours down shiftTo minutes and milliseconds", () => {
  const vals = fromValues({ hours: 1, seconds: 30 }) |> shiftTo(["minutes", "milliseconds"]) |> values;
  expect(vals).toEqual({ minutes: 60, milliseconds: 30000 });
});

test("shiftTo boils down and then rolls up", () => {
  const vals = fromValues({ years: 2, hours: 5000 }) |> shiftTo(["months", "days", "minutes"]) |> values;
  expect(vals).toEqual({ months: 30, days: 28, minutes: 8 * 60 });
});

test("shiftTo throws on invalid units", () => {
  expect(() => {
    fromValues({ years: 2, hours: 5000 }) |> shiftTo(["months", "glorp"]);
  }).toThrow();
});

test("shiftTo tacks decimals onto the end", () => {
  const hrs = fromValues({ minutes: 73 }) |> shiftTo(["hours"]) |> hours;
  expect(hrs).toBeCloseTo(1.2167, 4);
});

test("shiftTo deconstructs decimal inputs", () => {
  const dur = fromValues({ hours: 2.3 }) |> shiftTo(["hours", "minutes"]);
  expect(dur |> hours).toBe(2);
  expect(dur |> minutes).toBeCloseTo(18, 8);
});

test("shiftTo without any units no-ops", () => {
  const dur = fromValues({ years: 3 }) |> shiftTo([]) |> values;
  expect(dur).toEqual({ years: 3 });
});

test("shiftTo accumulates when rolling up", () => {
  expect(
    fromValues({ minutes: 59, seconds: 183 })
      |> shiftTo(["hours", "minutes", "seconds"])
      |> values
  ).toEqual({ hours: 1, minutes: 2, seconds: 3 });
});

test("shiftTo keeps unnecessary higher-order negative units 0", () => {
  expect(
    fromValues({ milliseconds: -100 }) |> shiftTo(["hours", "minutes", "seconds"]) |> values
  ).toEqual({ hours: 0, minutes: 0, seconds: -0.1 });
});

test("shiftTo does not normalize values", () => {
  // Normalizing would convert to { quarters: 4, months: 1, days: 10 }
  // which would be converted back to 404 days instead
  expect(
    fromValues({ quarters: 0, months: 0, days: 400 }) |> shiftTo(["days"]) |> values
  ).toEqual({ days: 400 });
});
