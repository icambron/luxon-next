import { durMapInputs, duration, durHours, durMinutes, durSeconds, durMilliseconds } from "../../../src/luxon";

test("mapUnits can multiply durations", () => {
  const dur = duration({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 });
  const result = durMapInputs(dur, (x) => x * 5);

  expect(durHours(result)).toBe(5);
  expect(durMinutes(result)).toBe(10);
  expect(durSeconds(result)).toBe(-15);
  expect(durMilliseconds(result)).toBe(-20);
});

test("mapUnits can take the unit into account", () => {
  const dur = duration({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 });
  const result = durMapInputs(dur, (x, u) => x * (u === "milliseconds" ? 2 : 5));

  expect(durHours(result)).toBe(5);
  expect(durMinutes(result)).toBe(10);
  expect(durSeconds(result)).toBe(-15);
  expect(durMilliseconds(result)).toBe(-8);
});

test("mapUnits requires that fn return a number", () => {
  const dur = duration({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 });
  expect(() => durMapInputs(dur, () => "hello?")).toThrow();
});
