/* global test expect */
import {
  fromTime,
  year,
  month,
  day,
  hour,
  minute,
  second,
  millisecond,
  now,
  zone
} from "../../../src/dateTime/core";

test("fromTime constructs a time in the current date", () => {
  const dt = fromTime({ hour: 1, minute: 2, second: 3, millisecond: 4});
  expect(dt |> hour).toBe(1);
  expect(dt |> minute).toBe(2);
  expect(dt |> second).toBe(3);
  expect(dt |> millisecond).toBe(4);

  expect(zone(dt).type).toBe("system");

  const today = now();
  expect(dt |> year).toBe(today |> year);
  expect(dt |> month).toBe(today |> month);
  expect(dt |> day).toBe(today |> day);
});

test("fromTime accepts a zone parameter", () => {
  const dt = fromTime({ hour: 1, minute: 2, second: 3, millisecond: 4}, "Europe/Paris");
  expect(dt |> hour).toBe(1);
  expect(dt |> minute).toBe(2);
  expect(dt |> second).toBe(3);
  expect(dt |> millisecond).toBe(4);

  expect(zone(dt).type).toBe("iana");
  expect(zone(dt).name).toBe("Europe/Paris");
});
