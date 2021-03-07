/* global test expect */

import {
  now,
  offset,
  toMillis,
  fromMillis,
  utcNow,
  hour,
  day,
  isOffsetFixed,
  zoneName, year, month, fromGregorian, ymd, fromJSDate
} from "../../../src/dateTime/core";
import {setZone, toUTC} from "../../../src/dateTime/zone";
import {withDefaultZone} from "../../helpers";
import {InvalidZoneError} from "../../../src/model/errors";
import {createIANAZone} from "../../../src/model/zones/IANAZone";

const millis = 391147200000,
  // 1982-05-25T04:00:00.000Z
  dt = () => fromMillis(millis);

test("setZone setZone sets the TZ to the specified zone", () => {
  const zoned = setZone(dt(), "America/Los_Angeles");

  expect(zoned |> zoneName).toBe("America/Los_Angeles");
  expect(zoned |> isOffsetFixed).toBe(false);
  expect(zoned |> toMillis).toBe(millis);
  expect(zoned |> day).toBe(24);
  expect(zoned |> hour).toBe(21);

  // pacific daylight time
  // expect(zoned |> isInDST).toBe(true);
});

test("setZone accepts 'system'", () => {
  const zoned = setZone(utcNow(), "system");
  expect(zoned |> offset).toBe(now() |> offset);
});

test("setZone accepts 'system' and ignores the default zone", () => {
  const localZoneName = zoneName(now());
  withDefaultZone(createIANAZone("Europe/Paris"), () => {
    expect(utcNow |> (x => setZone(x, "system")) |> zoneName).toBe(localZoneName);
  });
});

test("setZone accepts 'default'", () => {
  const zoned = setZone(utcNow(), "default");
  expect(zoned.offset).toBe(now() |> offset)
});

test("setZone accepts 'default' and uses the default zone", () => {
  withDefaultZone(createIANAZone("Europe/Paris"), () => {
    expect(utcNow() |> (x => setZone(x, "default")) |> zoneName).toBe("Europe/Paris");
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
  // this will only work in Chrome/V8 for now
  const zoned = setZone(dt(), "Europe/Paris");
  expect(zoned |> zoneName).toBe("Europe/Paris");
  // not convinced this is universal. Could also be 'CEDT'
  expect(zoned |> toMillis).toBe(millis);
  expect(zoned |> hour).toBe(6); // cedt is +2
});

test("setZone accepts a keepLocalTime option", () => {
  const zoned = dt()
    |> toUTC
    |> (x => setZone(x, "America/Los_Angeles", { keepLocalTime: true }));
  expect(zoned |> zoneName).toBe("America/Los_Angeles");
  expect(zoned |> year).toBe(1982);
  expect(zoned |> month).toBe(5);
  expect(zoned |> day).toBe(25);
  expect(zoned |> hour).toBe(4);
  expect(zoned |> isOffsetFixed).toBe(false);

  const zonedMore = setZone(zoned, "America/New_York", {
    keepLocalTime: true
  });
  expect(zonedMore |> zoneName).toBe("America/New_York");
  expect(zonedMore |> year).toBe(1982);
  expect(zonedMore |> month).toBe(5);
  expect(zonedMore |> day).toBe(25);
  expect(zonedMore |> hour).toBe(4);
  expect(zonedMore |> isOffsetFixed).toBe(false);
});

test("setZone with keepLocalTime can span wacky offsets", () => {
  const d = fromGregorian({year: 1, month: 1, day: 1}, "UTC");
  const d2 = setZone(d, "America/Curacao", { keepLocalTime: true });
  expect(d2 |> year).toBe(1);
  expect(d2 |> month).toBe(1);
  expect(d2 |> day).toBe(1);
  expect(d2 |> hour).toBe(0);
});

test("setZone with keepLocalTime handles zones with very different offsets than the current one", () => {
  const local = ymd(2016, 10, 30, 2, 59);
  const zoned = setZone(local, "Europe/Athens", { keepLocalTime: true });
  expect(zoned |> hour).toBe(2);
});

test("setZone rejects jibberish", () => {
  expect(() => setZone(dt(), "blorp")).toThrow(InvalidZoneError);
});

// #650
test("setZone works for dates before 1970 with milliseconds", () => {
  const o = fromJSDate(new Date("1967-01-01T00:00:00.001Z"))
    |> (x => setZone(x, "America/New_York"))
    |> offset;
  expect(o).toBe(-300);
});

//------
// Etc/GMT zones
//------
test("Etc/GMT zones work even though V8 does not support them", () => {
  let zoned = setZone(now(), "Etc/GMT+8");
  expect(zoned |> zoneName).toBe("UTC-8");
  zoned = setZone(now(), "Etc/GMT-5");
  expect(zoned |> zoneName).toBe("UTC+5");
  zoned = setZone(now(), "Etc/GMT-0");
  expect(zoned |> zoneName).toBe("UTC");
});

