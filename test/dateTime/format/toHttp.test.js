import { setZone, toUTC, fromGregorian, plus, toHTTP } from "../../../src/luxon";

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

test("toHTTP() returns an RFC 1123 date", () => {
  expect(toHTTP(toUTC(dt))).toBe("Tue, 25 May 1982 09:23:54 GMT");
  expect(toHTTP(setZone(dt, "America/New_York"))).toBe("Tue, 25 May 1982 09:23:54 GMT");
  expect(toHTTP(plus(dt, { hours: 10 }))).toBe("Tue, 25 May 1982 19:23:54 GMT");
});
