import { isInDST, setZone, setGregorian, fromISO } from "../../../src/luxon";

const dt = fromISO("1982-05-25T04:00:00.000Z");

test("isInDST() returns false for pre-DST times", () => {
  const zoned = setZone(dt, "America/Los_Angeles");
  const changed = setGregorian(zoned, { month: 1 });
  expect(isInDST(changed)).toBe(false);
});

test("isInDST() returns true for during-DST times", () => {
  const zoned = setZone(dt, "America/Los_Angeles");
  const changed = setGregorian(zoned, { month: 5 });
  expect(isInDST(changed)).toBe(true);
});

test("isInDST() returns false for post-DST times", () => {
  const zoned = setZone(dt, "America/Los_Angeles");
  const changed = setGregorian(zoned, { month: 12 });
  expect(isInDST(changed)).toBe(false);
});
