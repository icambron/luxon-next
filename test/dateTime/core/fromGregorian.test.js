/* global test expect */
import {
  day,
  fromGregorian,
  hour,
  isOffsetFixed,
  millisecond,
  minute,
  month,
  offset,
  second,
  toJSDate,
  year,
  zone,
} from "../../../src/luxon";
import { InvalidZoneError, UnitOutOfRangeError } from "../../../src/errors";

const baseObject = {
  year: 1982,
  month: 5,
  day: 25,
  hour: 9,
  minute: 23,
  second: 54,
  millisecond: 123,
};

const expectLocallyCorrect = (dt) => {
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);
  expect(hour(dt)).toBe(9);
  expect(minute(dt)).toBe(23);
  expect(second(dt)).toBe(54);
  expect(millisecond(dt)).toBe(123);
};

test("fromGregorian sets all the fields", () => {
  const dt = fromGregorian(baseObject);
  expect(zone(dt).type).toBe("system");
  expectLocallyCorrect(dt);
});

test("fromGregorian accepts a 'utc' zone option", () => {
  const dt = fromGregorian(baseObject, "utc");
  expect(isOffsetFixed(dt)).toBe(true);
  expect(offset(dt)).toBe(0);
  expectLocallyCorrect(dt);
});

test("fromGregorian accepts a 'utc-8' zone option", () => {
  const dt = fromGregorian(baseObject, "utc-8");
  expect(isOffsetFixed(dt)).toBe(true);
  expect(offset(dt)).toBe(-8 * 60);
  expectLocallyCorrect(dt);
});

test("fromGregorian accepts a 'America/Los_Angeles' zone option", () => {
  const dt = fromGregorian(baseObject, "America/Los_Angeles");
  expect(isOffsetFixed(dt)).toBe(false);
  expect(offset(dt)).toBe(-7 * 60);
  expectLocallyCorrect(dt);
});

test("fromGregorian rejects invalid zones", () => {
  expect(() => fromGregorian({}, "blorp")).toThrow(InvalidZoneError);
});

test("fromGregorian ignores the case of object keys", () => {
  const dt = fromGregorian({ Year: 2019, MONTH: 4, daYs: 10 });
  expect(year(dt)).toBe(2019);
  expect(month(dt)).toBe(4);
  expect(day(dt)).toBe(10);
});

test("fromGregorian throws with invalid value types", () => {
  expect(() => fromGregorian({ year: "blorp" })).toThrow();
  expect(() => fromGregorian({ year: "" })).toThrow();
  expect(() => fromGregorian({ month: NaN })).toThrow();
  expect(() => fromGregorian({ day: true })).toThrow();
  expect(() => fromGregorian({ day: false })).toThrow();
  expect(() => fromGregorian({ hour: {} })).toThrow();
  expect(() => fromGregorian({ hour: { unit: 42 } })).toThrow();
});

test("fromGregorian rejects invalid values", () => {
  expect(() => fromGregorian({ minute: -6 })).toThrow(UnitOutOfRangeError);
  expect(() => fromGregorian({ millisecond: new Date() })).toThrow(UnitOutOfRangeError);
});

test("fromGregorian defaults high-order values to the current date", () => {
  const dt = fromGregorian({});
  const now = new Date();

  expect(year(dt)).toBe(now.getFullYear());
  expect(month(dt)).toBe(now.getMonth() + 1);
  expect(day(dt)).toBe(now.getDate());
});

test("fromGregorian defaults lower-order values to their minimums if a high-order value is set", () => {
  const dt = fromGregorian({ year: 2017 });
  expect(year(dt)).toBe(2017);
  expect(month(dt)).toBe(1);
  expect(day(dt)).toBe(1);
  expect(hour(dt)).toBe(0);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("fromGregorian handles years < 100", () => {
  const dt = fromGregorian({ year: 99, month: 8, day: 6 });
  expect(year(dt)).toBe(99);
  expect(toJSDate(dt).getFullYear()).toBe(99);
});
