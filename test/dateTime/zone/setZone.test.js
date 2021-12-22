import {
  now,
  offset,
  toMillis,
  fromMillis,
  utcNow,
  hour,
  day,
  isOffsetFixed,
  zoneName,
  year,
  month,
  fromGregorian,
  ymd,
  fromJSDate,
  setZone,
  toUTC,
  InvalidZoneError,
  ianaZone,
  isInDST,
} from "../../../src/luxon";

import { withDefaultZone } from "../../helpers";

// 1982-05-25T04:00:00.000Z
const millis = 391147200000;
const dt = fromMillis(millis);

test("setZone setZone sets the TZ to the specified zone", () => {
  const zoned = setZone(dt, "America/Los_Angeles");

  expect(zoneName(zoned)).toBe("America/Los_Angeles");
  expect(isOffsetFixed(zoned)).toBe(false);
  expect(toMillis(zoned)).toBe(millis);
  expect(day(zoned)).toBe(24);
  expect(hour(zoned)).toBe(21);

  // pacific daylight time
  expect(isInDST(zoned)).toBe(true);
});

test("setZone accepts 'system'", () => {
  const zoned = setZone(utcNow(), "system");
  expect(offset(zoned)).toBe(offset(now()));
});

test("setZone accepts 'system' and ignores the default zone", () => {
  const localZoneName = zoneName(now());
  withDefaultZone(ianaZone("Europe/Paris"), () => {
    expect(zoneName(setZone(utcNow(), "system"))).toBe(localZoneName);
  });
});

test("setZone accepts 'default'", () => {
  const zoned = setZone(utcNow(), "default");
  expect(zoned.offset).toBe(offset(now()));
});

test("setZone accepts 'default' and uses the default zone", () => {
  withDefaultZone(ianaZone("Europe/Paris"), () => {
    expect(zoneName(setZone(utcNow(), "default"))).toBe("Europe/Paris");
  });
});

test('setZone accepts "utc"', () => {
  const zoned = setZone(now(), "utc");
  expect(zoned.offset).toBe(0);
});

test('setZone accepts "utc+3"', () => {
  const zoned = setZone(now(), "utc+3");
  expect(zoned.zone.name).toBe("UTC+3");
  expect(zoned.offset).toBe(3 * 60);
});

test('setZone accepts "utc-3"', () => {
  const zoned = setZone(now(), "utc-3");
  expect(zoned.zone.name).toBe("UTC-3");
  expect(zoned.offset).toBe(-3 * 60);
});

test('setZone accepts "utc-3:30"', () => {
  const zoned = setZone(now(), "utc-3:30");
  expect(zoned.zone.name).toBe("UTC-3:30");
  expect(zoned.offset).toBe(-3 * 60 - 30);
});

test("setZone does not accept dumb things", () => {
  expect(() => setZone(now(), "utc-yo")).toThrow(InvalidZoneError);
});

test("setZone accepts IANA zone names", () => {
  const zoned = setZone(dt, "Europe/Paris");
  expect(zoneName(zoned)).toBe("Europe/Paris");
  // not convinced this is universal. Could also be 'CEDT'
  expect(toMillis(zoned)).toBe(millis);
  expect(hour(zoned)).toBe(6); // cedt is +2
});

test("setZone accepts a keepLocalTime option", () => {
  const expectCorrectLocalTime = (dt) => {
    expect(year(dt)).toBe(1982);
    expect(month(dt)).toBe(5);
    expect(day(dt)).toBe(25);
    expect(hour(dt)).toBe(4);
    expect(isOffsetFixed(dt)).toBe(false);
  };

  const zoned = setZone(toUTC(dt), "America/Los_Angeles", { keepLocalTime: true });

  expect(zoneName(zoned)).toBe("America/Los_Angeles");
  expectCorrectLocalTime(zoned);

  const zonedMore = setZone(zoned, "America/New_York", { keepLocalTime: true });
  expect(zoneName(zonedMore)).toBe("America/New_York");
  expectCorrectLocalTime(zonedMore);
});

test("setZone with keepLocalTime can span wacky offsets", () => {
  const d = fromGregorian({ year: 1, month: 1, day: 1 }, "UTC");
  const zoned = setZone(d, "America/Curacao", { keepLocalTime: true });
  expect(year(zoned)).toBe(1);
  expect(month(zoned)).toBe(1);
  expect(day(zoned)).toBe(1);
  expect(hour(zoned)).toBe(0);
});

test("setZone with keepLocalTime handles zones with very different offsets than the current one", () => {
  const i = ymd(2016, 10, 30, 2, 59);
  const zoned = setZone(i, "Europe/Athens", { keepLocalTime: true });
  expect(hour(zoned)).toBe(2);
});

test("setZone rejects jibberish", () => {
  expect((_) => setZone(_, "blorp")).toThrow(InvalidZoneError);
});

// #650
test("setZone works for dates before 1970 with milliseconds", () => {
  const o = fromJSDate(new Date("1967-01-01T00:00:00.001Z"));
  const zoned = setZone(o, "America/New_York");
  expect(offset(zoned)).toBe(-300);
});
