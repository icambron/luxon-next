import { fromMillis, toUTC, hour, isOffsetFixed, zoneName, isInDST } from "../../../src/luxon";

// 1982-05-25T04:00:00.000Z
const millis = 391147200000;
const dt = fromMillis(millis);

test("toUTC() puts the dt in UTC 'mode'", () => {
  const zoned = toUTC(dt);
  expect(zoned.valueOf()).toBe(millis);
  expect(hour(zoned)).toBe(4);
  expect(zoneName(zoned)).toBe("UTC");
  expect(isOffsetFixed(zoned)).toBe(true);
  expect(isInDST(zoned)).toBe(false);
});
