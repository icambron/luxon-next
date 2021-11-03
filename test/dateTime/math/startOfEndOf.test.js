/* global test expect */

const { fromGregorian, year, month, day, hour, minute, second, millisecond } = require("../../../src/dateTime/core");
const { startOf, endOf } = require("../../../src/dateTime/math");

function createDateTime() {
  return fromGregorian({
    year: 2010,
    month: 2,
    day: 3,
    hour: 4,
    minute: 5,
    second: 6,
    millisecond: 7,
  });
}

test("startOf('year') goes to the start of the year", () => {
  const dt = createDateTime() |> startOf("year");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(1);
  expect(dt |> day).toBe(1);
  expect(dt |> hour).toBe(0);
  expect(dt |> minute).toBe(0);
  expect(dt |> second).toBe(0);
  expect(dt |> millisecond).toBe(0);
});

test("startOf('quarter') goes to the start of the quarter", () => {
  const monthToQuarterStart = (m, quarterStart) => {
    const dt =
      fromGregorian({
        year: 2017,
        month: m,
        day: 10,
        hour: 4,
        minute: 5,
        second: 6,
        millisecond: 7,
      }) |> startOf("quarter");

    expect(dt |> year).toBe(2017);
    expect(dt |> month).toBe(quarterStart);
    expect(dt |> day).toBe(1);
    expect(dt |> hour).toBe(0);
    expect(dt |> minute).toBe(0);
    expect(dt |> second).toBe(0);
    expect(dt |> millisecond).toBe(0);
  };

  monthToQuarterStart(1, 1);
  monthToQuarterStart(2, 1);
  monthToQuarterStart(3, 1);
  monthToQuarterStart(4, 4);
  monthToQuarterStart(5, 4);
  monthToQuarterStart(6, 4);
  monthToQuarterStart(7, 7);
  monthToQuarterStart(8, 7);
  monthToQuarterStart(9, 7);
  monthToQuarterStart(10, 10);
  monthToQuarterStart(11, 10);
  monthToQuarterStart(12, 10);
});

test("startOf('month') goes to the start of the month", () => {
  const dt = createDateTime() |> startOf("month");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(1);
  expect(dt |> hour).toBe(0);
  expect(dt |> minute).toBe(0);
  expect(dt |> second).toBe(0);
  expect(dt |> millisecond).toBe(0);
});

test("startOf('day') goes to the start of the day", () => {
  const dt = createDateTime() |> startOf("day");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(0);
  expect(dt |> minute).toBe(0);
  expect(dt |> second).toBe(0);
  expect(dt |> millisecond).toBe(0);
});

test("startOf('hour') goes to the start of the hour", () => {
  const dt = createDateTime() |> startOf("hour");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(4);
  expect(dt |> minute).toBe(0);
  expect(dt |> second).toBe(0);
  expect(dt |> millisecond).toBe(0);
});

test("startOf('minute') goes to the start of the minute", () => {
  const dt = createDateTime() |> startOf("minute");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(4);
  expect(dt |> minute).toBe(5);
  expect(dt |> second).toBe(0);
  expect(dt |> millisecond).toBe(0);
});

test("startOf('second') goes to the start of the second", () => {
  const dt = createDateTime() |> startOf("second");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(4);
  expect(dt |> minute).toBe(5);
  expect(dt |> second).toBe(6);
  expect(dt |> millisecond).toBe(0);
});

test("startOf('week') goes to the start of the week", () => {
  // using a different day so that it doesn't end up as the first of the month
  const dt = fromGregorian({ year: 2016, month: 3, day: 12, hour: 10 }) |> startOf("week");

  expect(dt |> year).toBe(2016);
  expect(dt |> month).toBe(3);
  expect(dt |> day).toBe(7);
  expect(dt |> hour).toBe(0);
  expect(dt |> minute).toBe(0);
  expect(dt |> second).toBe(0);
  expect(dt |> millisecond).toBe(0);
});

test("startOf throws on invalid convert", () => {
  expect(() => createDateTime() |> startOf("splork")).toThrow();
  expect(() => createDateTime() |> startOf("")).toThrow();
});

//------
// #endOf()
//------
test("endOf('year') goes to the start of the year", () => {
  const dt = createDateTime() |> endOf("year");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(12);
  expect(dt |> day).toBe(31);
  expect(dt |> hour).toBe(23);
  expect(dt |> minute).toBe(59);
  expect(dt |> second).toBe(59);
  expect(dt |> millisecond).toBe(999);
});

test("endOf('quarter') goes to the end of the quarter", () => {
  const dt = createDateTime() |> endOf("quarter");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(3);
  expect(dt |> day).toBe(31);
  expect(dt |> hour).toBe(23);
  expect(dt |> minute).toBe(59);
  expect(dt |> second).toBe(59);
  expect(dt |> millisecond).toBe(999);
});

test("endOf('quarter') goes to the end of the quarter in December", () => {
  const monthToQuarterEnd = (m, endMonth) => {
    const dt =
      fromGregorian({
        year: 2017,
        month: m,
        day: 10,
        hour: 4,
        minute: 5,
        second: 6,
        millisecond: 7,
      }) |> endOf("quarter");

    expect(dt |> year).toBe(2017);
    expect(dt |> month).toBe(endMonth);
    expect(dt |> day).toBe(dt |> endOf("month") |> day);
    expect(dt |> hour).toBe(23);
    expect(dt |> minute).toBe(59);
    expect(dt |> second).toBe(59);
    expect(dt |> millisecond).toBe(999);
  };

  monthToQuarterEnd(1, 3);
  monthToQuarterEnd(2, 3);
  monthToQuarterEnd(3, 3);
  monthToQuarterEnd(4, 6);
  monthToQuarterEnd(5, 6);
  monthToQuarterEnd(6, 6);
  monthToQuarterEnd(7, 9);
  monthToQuarterEnd(8, 9);
  monthToQuarterEnd(9, 9);
  monthToQuarterEnd(10, 12);
  monthToQuarterEnd(11, 12);
  monthToQuarterEnd(12, 12);
});

test("endOf('month') goes to the start of the month", () => {
  const dt = createDateTime() |> endOf("month");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(28);
  expect(dt |> hour).toBe(23);
  expect(dt |> minute).toBe(59);
  expect(dt |> second).toBe(59);
  expect(dt |> millisecond).toBe(999);
});

test("endOf('day') goes to the start of the day", () => {
  const dt = createDateTime() |> endOf("day");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(23);
  expect(dt |> minute).toBe(59);
  expect(dt |> second).toBe(59);
  expect(dt |> millisecond).toBe(999);
});

test("endOf('hour') goes to the start of the hour", () => {
  const dt = createDateTime() |> endOf("hour");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(4);
  expect(dt |> minute).toBe(59);
  expect(dt |> second).toBe(59);
  expect(dt |> millisecond).toBe(999);
});

test("endOf('minute') goes to the start of the minute", () => {
  const dt = createDateTime() |> endOf("minute");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(4);
  expect(dt |> minute).toBe(5);
  expect(dt |> second).toBe(59);
  expect(dt |> millisecond).toBe(999);
});

test("endOf('second') goes to the start of the second", () => {
  const dt = createDateTime() |> endOf("second");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(2);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(4);
  expect(dt |> minute).toBe(5);
  expect(dt |> second).toBe(6);
  expect(dt |> millisecond).toBe(999);
});

test("endOf('week') goes to the end of the week", () => {
  // using a different day so that it doesn't end up as the first of the month
  const dt = fromGregorian({ year: 2016, month: 3, day: 12, hour: 10 }) |> endOf("week");

  expect(dt |> year).toBe(2016);
  expect(dt |> month).toBe(3);
  expect(dt |> day).toBe(13);
  expect(dt |> hour).toBe(23);
  expect(dt |> minute).toBe(59);
  expect(dt |> second).toBe(59);
  expect(dt |> millisecond).toBe(999);
});

test("endOf throws on invalid convert", () => {
  expect(() => createDateTime() |> endOf("splork")).toThrow();
});

test("endOf accepts plural convert", () => {
  const dt = createDateTime() |> endOf("years");

  expect(dt |> year).toBe(2010);
  expect(dt |> month).toBe(12);
  expect(dt |> day).toBe(31);
  expect(dt |> hour).toBe(23);
  expect(dt |> minute).toBe(59);
  expect(dt |> second).toBe(59);
  expect(dt |> millisecond).toBe(999);
});
