import { ymdUTC, hour, toSystemZone } from "../../../src/luxon";

// NB: this test only works with system zone set to America/New_York
test("toSystemZone switches to the system zone", () => {
  const inUtc = ymdUTC(2020, 11, 16, 9);
  const zoned = toSystemZone(inUtc);

  expect(zoned.offset).toBe(-5 * 60);
  expect(hour(zoned)).toBe(4);
});
