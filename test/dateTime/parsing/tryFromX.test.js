import { tryFromHTTP, tryFromISO, tryFromRFC2822 } from "../../../src/dateTime/parse";
import { DateTime } from "../../../src/model/dateTime";
import { offset } from "../../../src/dateTime/core";

test("tryFromISO returns a DateTime for valid values", () => {
  expect(tryFromISO("2021-11-06")).toBeInstanceOf(DateTime);
});

test("tryFromISO accepts options", () => {
  const dt = tryFromISO("2021-11-06", { targetZone: "utc+6" });
  expect(offset(dt)).toEqual(6 * 60);
});

test.each(["goats", "2016-14-06", "2021-02-30"])("tryFromISO returns null for bad input %p", (input) => {
  expect(tryFromISO(input)).toBeNull();
});

test("tryFromRFC2822() returns a DateTime for valid values", () => {
  expect(tryFromRFC2822("Sun, 12 Apr 2015 13:23:12 +0600")).toBeInstanceOf(DateTime);
});

test.each([
  "goats",
  "12 Gork 2015 05:06:07 GMT",
  "31 Feb 2016 05:06:07 GMT",
  "Florm, 12 Apr 2015 05:06:07 GMT",
  "Sun, 12 Apr 2015 05:06:07 Sporks",
])(" returns null for bad input %p", (input) => {
  expect(tryFromRFC2822(input)).toBeNull();
});

test("tryFromHTTP() returns a DateTime for valid values", () => {
  expect(tryFromHTTP("Wed Nov 16 08:49:37 1994")).toBeInstanceOf(DateTime);
});

test.each([
  "goats",
  "Spork Nov 32 08:49:37 1994",
  "Wed Spork 32 08:49:37 1994",
  "Wed Nov 32 08:49:37 1994",
  "Wed Nov 32 08:49:37 Spork",
])("tryFromHTTP returns null for bad input %p", (input) => {
  expect(tryFromHTTP(input)).toBeNull();
});
