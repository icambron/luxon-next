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
  zoneName,
  year,
  month,
  fromGregorian,
  ymd,
  fromJSDate,
} from "../../../src/dateTime/core";
import { setZone, toUTC } from "../../../src/dateTime/zone";
import { withDefaultZone } from "../../helpers";
import { InvalidZoneError } from "../../../src/errors";
import { createIANAZone } from "../../../src/model/zones/IANAZone";

const millis = 391147200000,
  // 1982-05-25T04:00:00.000Z
  dt = () => fromMillis(millis);

test("setZone setZone sets the TZ to the specified zone", () => {
  const zoned = dt() |> setZone("America/Los_Angeles");

  expect(zoned |> zoneName).toBe("America/Los_Angeles");
  expect(zoned |> isOffsetFixed).toBe(false);
  expect(zoned |> toMillis).toBe(millis);
  expect(zoned |> day).toBe(24);
  expect(zoned |> hour).toBe(21);

  // pacific daylight time
  // todo - implement isInDST
  // expect(zoned |> isInDST).toBe(true);
});

test("setZone accepts 'system'", () => {
  const zoned = utcNow() |> setZone("system");
  expect(zoned |> offset).toBe(now() |> offset);
});

test("setZone accepts 'system' and ignores the default zone", () => {
  const localZoneName = zoneName(now());
  withDefaultZone(createIANAZone("Europe/Paris"), () => {
    expect(utcNow() |> setZone("system") |> zoneName).toBe(localZoneName);
  });
});

test("setZone accepts 'default'", () => {
  const zoned = utcNow() |> setZone("default");
  expect(zoned.offset).toBe(now() |> offset);
});

test("setZone accepts 'default' and uses the default zone", () => {
  withDefaultZone(createIANAZone("Europe/Paris"), () => {
    expect(utcNow() |> setZone("default") |> zoneName).toBe("Europe/Paris");
  });
});

test('setZone accepts "utc"', () => {
  const zoned = now() |> setZone("utc");
  expect(zoned.offset).toBe(0);
});

test('setZone accepts "utc+3"', () => {
  const zoned = now() |> setZone("utc+3");
  expect(zoned.zone.name).toBe("UTC+3");
  expect(zoned.offset).toBe(3 * 60);
});

test('setZone accepts "utc-3"', () => {
  const zoned = now() |> setZone("utc-3");
  expect(zoned.zone.name).toBe("UTC-3");
  expect(zoned.offset).toBe(-3 * 60);
});

test('setZone accepts "utc-3:30"', () => {
  const zoned = now() |> setZone("utc-3:30");
  expect(zoned.zone.name).toBe("UTC-3:30");
  expect(zoned.offset).toBe(-3 * 60 - 30);
});

test("setZone does not accept dumb things", () => {
  expect(() => now() |> setZone("utc-yo")).toThrow(InvalidZoneError);
});

test("setZone accepts IANA zone names", () => {
  const zoned = dt() |> setZone("Europe/Paris");
  expect(zoned |> zoneName).toBe("Europe/Paris");
  // not convinced this is universal. Could also be 'CEDT'
  expect(zoned |> toMillis).toBe(millis);
  expect(zoned |> hour).toBe(6); // cedt is +2
});

test("setZone accepts a keepLocalTime option", () => {
  const expectCorrectLocalTime = (dt) => {
    expect(dt |> year).toBe(1982);
    expect(dt |> month).toBe(5);
    expect(dt |> day).toBe(25);
    expect(dt |> hour).toBe(4);
    expect(dt |> isOffsetFixed).toBe(false);
  };

  const zoned = dt() |> toUTC() |> setZone("America/Los_Angeles", { keepLocalTime: true });

  expect(zoneName(zoned)).toBe("America/Los_Angeles");
  expectCorrectLocalTime(zoned);

  const zonedMore = zoned |> setZone("America/New_York", { keepLocalTime: true });
  expectCorrectLocalTime(zonedMore);
});

test("setZone with keepLocalTime can span wacky offsets", () => {
  const d = fromGregorian({ year: 1, month: 1, day: 1 }, "UTC") |> setZone("America/Curacao", { keepLocalTime: true });
  expect(d |> year).toBe(1);
  expect(d |> month).toBe(1);
  expect(d |> day).toBe(1);
  expect(d |> hour).toBe(0);
});

test("setZone with keepLocalTime handles zones with very different offsets than the current one", () => {
  const zoned = ymd(2016, 10, 30, 2, 59) |> setZone("Europe/Athens", { keepLocalTime: true });
  expect(hour(zoned)).toBe(2);
});

test("setZone rejects jibberish", () => {
  expect((_) => setZone("blorp")).toThrow(InvalidZoneError);
});

// #650
test("setZone works for dates before 1970 with milliseconds", () => {
  const o = fromJSDate(new Date("1967-01-01T00:00:00.001Z")) |> setZone("America/New_York") |> offset;
  expect(o).toBe(-300);
});