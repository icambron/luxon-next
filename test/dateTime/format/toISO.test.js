import { fromGregorian, fromMillis, setTime, toISO, toFixedOffset, setZone } from "../../../src/luxon";

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

test("toISO() shows 'Z' for UTC", () => {
  expect(toISO(dt)).toBe("1982-05-25T09:23:54.123Z");
});

test("toISO() shows the offset, unless explicitely asked", () => {
  const offsetted = toFixedOffset(dt, -6 * 60);
  expect(toISO(offsetted)).toBe("1982-05-25T03:23:54.123-06:00");
  expect(toISO(offsetted, { includeOffset: false })).toBe("1982-05-25T03:23:54.123");
});

test("toISO() supports the 'basic' format", () => {
  expect(toISO(dt, { format: "basic" })).toBe("19820525T092354.123Z");
});

test("toISO({ elideZeroMilliseconds }) suppresses milliseconds", () => {
  const noZeroMilliseconds = { elideZeroMilliseconds: true };
  expect(toISO(dt, noZeroMilliseconds)).toBe("1982-05-25T09:23:54.123Z");

  const zeroed = setTime(dt, { millisecond: 0 });
  expect(toISO(zeroed, noZeroMilliseconds)).toBe("1982-05-25T09:23:54Z");
});

test("toISO({ elideZeroSeconds }) suppresses seconds", () => {
  const noZeroSeconds = { elideZeroSeconds: true, elideZeroMilliseconds: true };

  let zeroed = setTime(dt, { millisecond: 0 });
  expect(toISO(zeroed, noZeroSeconds)).toBe("1982-05-25T09:23:54Z");

  zeroed = setTime(dt, { second: 0, millisecond: 0 });
  expect(toISO(zeroed, noZeroSeconds)).toBe("1982-05-25T09:23Z");
});

// #724, Firefox specific issue, offset prints as '-05:50.60000000000002'
test("toISO() rounds fractional timezone minute offsets", () => {
  const i = setZone(fromMillis(-62090696591000), "America/Chicago");
  expect(toISO(i)).toBe("0002-06-04T10:26:13.000-05:50");
});
