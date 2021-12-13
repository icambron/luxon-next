/* global test expect */

const { fromGregorian, year, month, day, hour, minute, second, millisecond } = require("../../../src/dateTime/core");
const { startOf, endOf } = require("../../../src/dateTime/math");

function makeDt() {
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
  const dt = startOf(makeDt(), "year");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(1);
  expect(day(dt)).toBe(1);
  expect(hour(dt)).toBe(0);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('quarter') goes to the start of the quarter", () => {
  const monthToQuarterStart = (m, quarterStart) => {
    const dt =
      startOf(fromGregorian({
        year: 2017,
        month: m,
        day: 10,
        hour: 4,
        minute: 5,
        second: 6,
        millisecond: 7,
      }), "quarter");

    expect(year(dt)).toBe(2017);
    expect(month(dt)).toBe(quarterStart);
    expect(day(dt)).toBe(1);
    expect(hour(dt)).toBe(0);
    expect(minute(dt)).toBe(0);
    expect(second(dt)).toBe(0);
    expect(millisecond(dt)).toBe(0);
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
  const dt = startOf(makeDt(), "month");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(1);
  expect(hour(dt)).toBe(0);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('day') goes to the start of the day", () => {
  const dt = startOf(makeDt(), "day");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(0);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('hour') goes to the start of the hour", () => {
  const dt = startOf(makeDt(), "hour");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('minute') goes to the start of the minute", () => {
  const dt = startOf(makeDt(), "minute");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(5);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('second') goes to the start of the second", () => {
  const dt = startOf(makeDt(), "second");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(5);
  expect(second(dt)).toBe(6);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('week') goes to the start of the week", () => {
  // using a different day so that it doesn't end up as the first of the month
  const dt = startOf(fromGregorian({ year: 2016, month: 3, day: 12, hour: 10 }), "week");

  expect(year(dt)).toBe(2016);
  expect(month(dt)).toBe(3);
  expect(day(dt)).toBe(7);
  expect(hour(dt)).toBe(0);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf throws on invalid convert", () => {
  expect(() => startOf(makeDt(), "splork")).toThrow();
  expect(() => startOf(makeDt(), "")).toThrow();
});

//------
// #endOf()
//------
test("endOf('year') goes to the start of the year", () => {
  const dt = endOf(makeDt(), "year");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(12);
  expect(day(dt)).toBe(31);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('quarter') goes to the end of the quarter", () => {
  const dt = endOf(makeDt(), "quarter");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(3);
  expect(day(dt)).toBe(31);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('quarter') goes to the end of the quarter in December", () => {
  const monthToQuarterEnd = (m, endMonth) => {
    const dt =
      endOf(fromGregorian({
        year: 2017,
        month: m,
        day: 10,
        hour: 4,
        minute: 5,
        second: 6,
        millisecond: 7,
      }), "quarter");

    expect(year(dt)).toBe(2017);
    expect(month(dt)).toBe(endMonth);
    expect(day(dt)).toBe(day(endOf(dt, "month")));
    expect(hour(dt)).toBe(23);
    expect(minute(dt)).toBe(59);
    expect(second(dt)).toBe(59);
    expect(millisecond(dt)).toBe(999);
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
  const dt = endOf(makeDt(), "month");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(28);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('day') goes to the start of the day", () => {
  const dt = endOf(makeDt(), "day");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('hour') goes to the start of the hour", () => {
  const dt = endOf(makeDt(), "hour");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('minute') goes to the start of the minute", () => {
  const dt = endOf(makeDt(), "minute");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(5);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('second') goes to the start of the second", () => {
  const dt = endOf(makeDt(), "second");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(5);
  expect(second(dt)).toBe(6);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('week') goes to the end of the week", () => {
  // using a different day so that it doesn't end up as the first of the month
  const dt = endOf(fromGregorian({ year: 2016, month: 3, day: 12, hour: 10 }), "week");

  expect(year(dt)).toBe(2016);
  expect(month(dt)).toBe(3);
  expect(day(dt)).toBe(13);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf throws on invalid convert", () => {
  expect(() => endOf(makeDt(), "splork")).toThrow();
});

test("endOf accepts plural convert", () => {
  const dt = endOf(makeDt(), "years");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(12);
  expect(day(dt)).toBe(31);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});
