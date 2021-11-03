/* global test expect */
const { plus, minus, duration, hours, minutes, seconds, milliseconds } = require("../../../src/duration/core");

test("Duration#plus add straightforward durations", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 });
  const second = duration({ hours: 1, seconds: 6, milliseconds: 14 });
  const result = plus(first, second);

  expect(result |> hours).toBe(5);
  expect(result |> minutes).toBe(12);
  expect(result |> seconds).toBe(8);
  expect(result |> milliseconds).toBe(14);
});

test("Duration#plus noops empty durations", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 });
  const second = duration({});
  const result = plus(first, second);

  expect(result |> hours).toBe(4);
  expect(result |> minutes).toBe(12);
  expect(result |> seconds).toBe(2);
});

test("Duration#plus adds negatives", () => {
  const first = duration({ hours: 4, minutes: -12, seconds: -2 }),
    second = duration({ hours: -5, seconds: 6, milliseconds: 14 }),
    result = plus(first, second);

  expect(result |> hours).toBe(-1);
  expect(result |> minutes).toBe(-12);
  expect(result |> seconds).toBe(4);
  expect(result |> milliseconds).toBe(14);
});

test("Duration#plus adds single values", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 }),
    result = plus(first, duration({ minutes: 5 }));

  expect(result |> hours).toBe(4);
  expect(result |> minutes).toBe(17);
  expect(result |> seconds).toBe(2);
});

test("Duration#plus results in the superset of units", () => {
  let dur = plus(duration({ hours: 1, minutes: 0 }), duration({ seconds: 3, milliseconds: 0 }));
  expect(dur.values).toEqual({ hours: 1, minutes: 0, seconds: 3, milliseconds: 0 });

  dur = plus(duration({ hours: 1, minutes: 0 }), duration({}));
  expect(dur.values).toEqual({ hours: 1, minutes: 0 });
});

test("Duration#plus throws with invalid parameter", () => {
  expect(() => plus(duration({}), "123")).toThrow();
});

test("Duration#minus subtracts durations", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 }),
    second = duration({ hours: 1, seconds: 6, milliseconds: 14 }),
    result = minus(first, second);

  expect(result |> hours).toBe(3);
  expect(result |> minutes).toBe(12);
  expect(result |> seconds).toBe(-4);
  expect(result |> milliseconds).toBe(-14);
});

test("Duration#minus subtracts single values", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 }),
    result = minus(first, duration({ minutes: 5 }));

  expect(result |> hours).toBe(4);
  expect(result |> minutes).toBe(7);
  expect(result |> seconds).toBe(2);
});
