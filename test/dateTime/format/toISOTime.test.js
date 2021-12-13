import { fromGregorian, setGregorian } from "../../../src/dateTime/core";
import { startOf } from "../../../src/dateTime/math";
import { setZone } from "../../../src/dateTime/zone";
import { toISOTime } from "../../../src/dateTime/format";

const dt = fromGregorian({
  year: 1982,
  month: 5,
  day: 25,
  hour: 9,
  minute: 23,
  second: 54,
  millisecond: 123,
}, "utc");

test("toISOTime() returns an ISO 8601 date", () => {
  expect(toISOTime(dt)).toBe("09:23:54.123Z");
});

test("toISOTime() won't suppress seconds by default", () => {
  const i = startOf(dt, "minute")
  expect(toISOTime(i)).toBe("09:23:00.000Z");
});

test("toISOTime() won't suppress milliseconds by default", () => {
  const i = startOf(dt, "second");
  expect(toISOTime(i)).toBe("09:23:54.000Z");
});

test("toISOTime({elideZeroMilliseconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(toISOTime(dt, { elideZeroMilliseconds: true })).toBe("09:23:54.123Z");
});

test("toISOTime({elideZeroMilliseconds: true}) will suppress milliseconds if they're zero", () => {
  let i = setGregorian(dt, { millisecond: 0 });
  expect(toISOTime(i, { elideZeroMilliseconds: true })).toBe("09:23:54Z");
});

test("toISOTime({elideZeroSeconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(toISOTime(dt, { elideZeroSeconds: true })).toBe("09:23:54.123Z");
});

test("toISOTime({elideZeroSeconds: true}) will suppress milliseconds if they're zero", () => {
  const i = setGregorian(dt, { second: 0, millisecond: 0 });
  expect(toISOTime(i, { elideZeroSeconds: true })).toBe("09:23Z");
});

test("toISOTime({seconds: false}) won't display seconds or milliseconds", () => {
  expect(toISOTime(dt, { seconds: false })).toBe("09:23Z");
});

test("toISOTime({milliseconds: false}) will won't display milliseconds", () => {
  expect(toISOTime(dt, { milliseconds: false })).toBe("09:23:54Z");
});

test("toISOTime() handles other offsets", () => {
  const i = setZone(dt, "America/New_York")
  expect(toISOTime(i)).toBe("05:23:54.123-04:00");
});

test("toISOTime() can omit the offset", () => {
  expect(toISOTime(dt, { includeOffset: false })).toBe("09:23:54.123");
});

test("toISOTime() can output the basic format", () => {
  expect(toISOTime(dt, { format: "basic" })).toBe("092354.123Z");

  const dt2 = setGregorian(dt, { second: 0, millisecond: 0 });
  expect(toISOTime(dt2, { format: "basic", elideZeroMilliseconds: true })).toBe("092300Z");
  expect(toISOTime(dt2, { format: "basic", elideZeroSeconds: true })).toBe("0923Z");
});
