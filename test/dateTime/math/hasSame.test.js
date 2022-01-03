/* global test expect */
import { now, plus, hasSame, startOf, fromISO } from "../../../src/luxon";

// test("hasSame() can use milliseconds for exact comparisons", () => {
//   const dt = now();
//   expect(hasSame(dt, dt, "millisecond")).toBe(true);
//   expect(hasSame(dt, plus(dt, { milliseconds: 1 }), "millisecond")).toBe(false);
// });
//
// test("hasSame() checks the unit", () => {
//   const dt = now();
//   expect(hasSame(dt, dt, "day")).toBe(true);
//   expect(hasSame(dt, startOf(dt, "day"), "day")).toBe(true);
//   expect(hasSame(dt, plus(dt, { days: 1 }), "days")).toBe(false);
// });
//
// test("hasSame() checks high-order units", () => {
//   const dt1 = fromISO("2001-02-03");
//   const dt2 = fromISO("2001-05-03");
//   expect(hasSame(dt1, dt2, "year")).toBe(true);
//   expect(hasSame(dt1, dt2, "month")).toBe(false);
//   // Even when days are equal, return false when a higher-order unit differs.
//   expect(hasSame(dt1, dt2, "day")).toBe(false);
// });

// #584
test.each(["day", "hour", "second", "millisecond"])(
  "hasSame() with unit %p ignores time offsets and is symmetric",
  (unit) => {
    const d1 = fromISO("2019-10-02T01:02:03.045+03:00", {
      zone: "Europe/Helsinki",
    });
    const d2 = fromISO("2019-10-02T01:02:03.045-05:00", {
      zone: "America/Chicago",
    });

    expect(hasSame(d1, d2, unit)).toBe(true);
    expect(hasSame(d2, d1, unit)).toBe(true);
  }
);
