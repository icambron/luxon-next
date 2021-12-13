/* global test expect */
import { fromTime, year, month, day, hour, minute, second, millisecond, now, zone } from "../../../src/luxon";

test("fromTime constructs a time in the current date", () => {
  const dt = fromTime({ hour: 1, minute: 2, second: 3, millisecond: 4 });
  expect(hour(dt)).toBe(1);
  expect(minute(dt)).toBe(2);
  expect(second(dt)).toBe(3);
  expect(millisecond(dt)).toBe(4);

  expect(zone(dt).type).toBe("system");

  const today = now();
  expect(year(dt)).toBe(year(today));
  expect(month(dt)).toBe(month(today));
  expect(day(dt)).toBe(day(today));
});

test("fromTime accepts a zone parameter", () => {
  const dt = fromTime({ hour: 1, minute: 2, second: 3, millisecond: 4 }, "Europe/Paris");
  expect(hour(dt)).toBe(1);
  expect(minute(dt)).toBe(2);
  expect(second(dt)).toBe(3);
  expect(millisecond(dt)).toBe(4);

  expect(zone(dt).type).toBe("iana");
  expect(zone(dt).name).toBe("Europe/Paris");
});
