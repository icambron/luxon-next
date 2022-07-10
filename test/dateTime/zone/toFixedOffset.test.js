import { fromMillis, toFixedOffset, hour, isOffsetFixed, zoneName } from "../../../src/luxon";

// 1982-05-25T04:00:00.000Z
const millis = 391147200000;
const dt = fromMillis(millis);

test("toFixedOffset() puts the dt in UTC 'mode'", () => {
  const zoned = toFixedOffset(dt, 5 * 60);
  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.offset).toBe(5 * 60);
  expect(hour(zoned)).toBe(4 + 5);
  expect(zoneName(zoned)).toBe("UTC+5");
  expect(isOffsetFixed(zoned)).toBe(true);
});
