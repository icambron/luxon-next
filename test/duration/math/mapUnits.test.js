import { mapUnits, duration, hours, minutes, seconds, milliseconds } from "../../../src/duration/core";

test("mapUnits can multiply durations", () => {
  const result = duration({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 }) |> mapUnits((x) => x * 5);

  expect(result |> hours).toBe(5);
  expect(result |> minutes).toBe(10);
  expect(result |> seconds).toBe(-15);
  expect(result |> milliseconds).toBe(-20);
});

test("mapUnits can take the unit into account", () => {
  const result =
    duration({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 })
    |> mapUnits((x, u) => x * (u === "milliseconds" ? 2 : 5));

  expect(result |> hours).toBe(5);
  expect(result |> minutes).toBe(10);
  expect(result |> seconds).toBe(-15);
  expect(result |> milliseconds).toBe(-8);
});

test("mapUnits requires that fn return a number", () => {
  const dur = duration({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 });
  expect(() => dur |> mapUnits(() => "hello?")).toThrow();
});
