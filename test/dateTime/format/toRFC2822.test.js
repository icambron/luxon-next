import { fromGregorian, setTime, toRFC2822, setZone, toUTC } from "../../../src/luxon";

const dt = fromGregorian(
  {
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  },
  "utc"
);

test("toRFC2822() returns an RFC 2822 date", () => {
  expect(toRFC2822(toUTC(dt))).toBe("Tue, 25 May 1982 09:23:54 +0000");
  expect(toRFC2822(setZone(dt, "America/New_York"))).toBe("Tue, 25 May 1982 05:23:54 -0400");
  expect(toRFC2822(setTime(dt, { hour: 15 }))).toBe("Tue, 25 May 1982 15:23:54 +0000");
});
