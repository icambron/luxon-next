import { durMapInputs, duration, durHours, durMinutes, durSeconds, durMilliseconds } from "../../../src/duration/core";

test("mapUnits can multiply durations", () => {
  const result = duration({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 }) |> durMapInputs((x) => x * 5);

  expect(result |> durHours).toBe(5);
  expect(result |> durMinutes).toBe(10);
  expect(result |> durSeconds).toBe(-15);
  expect(result |> durMilliseconds).toBe(-20);
});

test("mapUnits can take the unit into account", () => {
  const result =
    duration({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 })
    |> durMapInputs((x, u) => x * (u === "milliseconds" ? 2 : 5));

  expect(result |> durHours).toBe(5);
  expect(result |> durMinutes).toBe(10);
  expect(result |> durSeconds).toBe(-15);
  expect(result |> durMilliseconds).toBe(-8);
});

test("mapUnits requires that fn return a number", () => {
  const dur = duration({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 });
  expect(() => dur |> durMapInputs(() => "hello?")).toThrow();
});
