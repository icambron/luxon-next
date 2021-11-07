/* global test expect */
const {
  durPlus,
  durMinus,
  duration,
  durHours,
  durMinutes,
  durSeconds,
  durMilliseconds,
} = require("../../../src/duration/core");

test("Duration#plus add straightforward durations", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 });
  const second = duration({ hours: 1, seconds: 6, milliseconds: 14 });
  const result = durPlus(first, second);

  expect(result |> durHours).toBe(5);
  expect(result |> durMinutes).toBe(12);
  expect(result |> durSeconds).toBe(8);
  expect(result |> durMilliseconds).toBe(14);
});

test("Duration#plus noops empty durations", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 });
  const second = duration({});
  const result = durPlus(first, second);

  expect(result |> durHours).toBe(4);
  expect(result |> durMinutes).toBe(12);
  expect(result |> durSeconds).toBe(2);
});

test("Duration#plus adds negatives", () => {
  const first = duration({ hours: 4, minutes: -12, seconds: -2 }),
    second = duration({ hours: -5, seconds: 6, milliseconds: 14 }),
    result = durPlus(first, second);

  expect(result |> durHours).toBe(-1);
  expect(result |> durMinutes).toBe(-12);
  expect(result |> durSeconds).toBe(4);
  expect(result |> durMilliseconds).toBe(14);
});

test("Duration#plus adds single values", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 }),
    result = durPlus(first, duration({ minutes: 5 }));

  expect(result |> durHours).toBe(4);
  expect(result |> durMinutes).toBe(17);
  expect(result |> durSeconds).toBe(2);
});

test("Duration#plus results in the superset of convert", () => {
  let dur = durPlus(duration({ hours: 1, minutes: 0 }), duration({ seconds: 3, milliseconds: 0 }));
  expect(dur.values).toEqual({ hours: 1, minutes: 0, seconds: 3, milliseconds: 0 });

  dur = durPlus(duration({ hours: 1, minutes: 0 }), duration({}));
  expect(dur.values).toEqual({ hours: 1, minutes: 0 });
});

test("Duration#plus throws with invalid parameter", () => {
  expect(() => durPlus(duration({}), "123")).toThrow();
});

test("Duration#minus subtracts durations", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 }),
    second = duration({ hours: 1, seconds: 6, milliseconds: 14 }),
    result = durMinus(first, second);

  expect(result |> durHours).toBe(3);
  expect(result |> durMinutes).toBe(12);
  expect(result |> durSeconds).toBe(-4);
  expect(result |> durMilliseconds).toBe(-14);
});

test("Duration#minus subtracts single values", () => {
  const first = duration({ hours: 4, minutes: 12, seconds: 2 }),
    result = durMinus(first, duration({ minutes: 5 }));

  expect(result |> durHours).toBe(4);
  expect(result |> durMinutes).toBe(7);
  expect(result |> durSeconds).toBe(2);
});
