import {
  day,
  hour,
  millisecond,
  minute,
  month,
  second,
  year,
  zoneName,
  fromMillis,
  toMillis
} from "../../../src/dateTime/core";
import {toUTC} from "../../../src/dateTime/zone";

test("fromMillis results in the right timestamp", () => {
  const bigValue = 391147200000;
  expect(fromMillis(bigValue) |> toMillis).toBe(bigValue);
  expect(fromMillis(0).valueOf()).toBe(0);
});

test("fromMillis translates to the right gregorian value", () => {
  const dt = fromMillis(1615082936814) |> toUTC;

  expect(toMillis(dt)).toBe(1615082936814);

  expect(year(dt)).toBe(2021);
  expect(month(dt)).toBe(3);
  expect(day(dt)).toBe(7);
  expect(hour(dt)).toBe(2);
  expect(minute(dt)).toBe(8);
  expect(second(dt)).toBe(56);
  expect(millisecond(dt)).toBe(814);
});

 test("fromMillis accepts a zone option", () => {
   const value = 391147200000;
   const dt = fromMillis(value, "America/Santiago");

   expect(toMillis(dt)).toBe(value);
   expect(zoneName(dt)).toBe("America/Santiago");
 });

 test("fromMillis throws InvalidArgumentError for non-numeric input", () => {
   expect(() => fromMillis("slurp")).toThrow();
 });

 test("fromMillis does not accept out-of-bounds numbers", () => {
   expect(() => fromMillis(-8.64e15 - 1)).toThrow();
   expect(() => fromMillis(8.64e15 + 1)).toThrow();
 });

