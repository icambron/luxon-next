import { startOf, endOf, fromGregorian, year, month, day, hour, minute, second, millisecond } from "../../../src/luxon";

const baseDt = fromGregorian({
  year: 2010,
  month: 2,
  day: 3,
  hour: 4,
  minute: 5,
  second: 6,
  millisecond: 7,
});

test("startOf('year') goes to the start of the year", () => {
  const dt = startOf(baseDt, "year");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(1);
  expect(day(dt)).toBe(1);
  expect(hour(dt)).toBe(0);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test.each([
  [1, 1], 
  [2, 1],
  [3, 1],
  [4, 4],
  [5, 4],
  [6, 4],
  [7, 7],
  [8, 7],
  [9, 7],
  [10, 10],
  [11, 10],
  [12, 10]
])("startOf('quarter') from month %p goes to the start of the quarter %p", (m, startMonth) => {
  const dt = startOf(
    fromGregorian({
      year: 2017,
      month: m,
      day: 10,
      hour: 4,
      minute: 5,
      second: 6,
      millisecond: 7,
    }),
    "quarter"
  );

  expect(year(dt)).toBe(2017);
  expect(month(dt)).toBe(startMonth);
  expect(day(dt)).toBe(1);
  expect(hour(dt)).toBe(0);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('month') goes to the start of the month", () => {
  const dt = startOf(baseDt, "month");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(1);
  expect(hour(dt)).toBe(0);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('day') goes to the start of the day", () => {
  const dt = startOf(baseDt, "day");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(0);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('hour') goes to the start of the hour", () => {
  const dt = startOf(baseDt, "hour");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(0);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('minute') goes to the start of the minute", () => {
  const dt = startOf(baseDt, "minute");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(5);
  expect(second(dt)).toBe(0);
  expect(millisecond(dt)).toBe(0);
});

test("startOf('second') goes to the start of the second", () => {
  const dt = startOf(baseDt, "second");

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
  expect(() => startOf(baseDt, "splork")).toThrow();
  expect(() => startOf(baseDt, "")).toThrow();
});

//------
// #endOf()
//------
test("endOf('year') goes to the start of the year", () => {
  const dt = endOf(baseDt, "year");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(12);
  expect(day(dt)).toBe(31);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('quarter') goes to the end of the quarter", () => {
  const dt = endOf(baseDt, "quarter");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(3);
  expect(day(dt)).toBe(31);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test.each([
  [1, 3], 
  [2, 3],
  [3, 3],
  [4, 6],
  [5, 6],
  [6, 6],
  [7, 9],
  [8, 9],
  [9, 9],
  [10, 12],
  [11, 12],
  [12, 12]
])("endOf('quarter') from month %p goes to the end of the quarter %p", (m, endMonth) => {
  const dt = endOf(
    fromGregorian({
      year: 2017,
      month: m,
      day: 10,
      hour: 4,
      minute: 5,
      second: 6,
      millisecond: 7,
    }),
    "quarter"
  );

  expect(year(dt)).toBe(2017);
  expect(month(dt)).toBe(endMonth);
  expect(day(dt)).toBe(day(endOf(dt, "month")));
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('month') goes to the start of the month", () => {
  const dt = endOf(baseDt, "month");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(28);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('day') goes to the start of the day", () => {
  const dt = endOf(baseDt, "day");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('hour') goes to the start of the hour", () => {
  const dt = endOf(baseDt, "hour");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('minute') goes to the start of the minute", () => {
  const dt = endOf(baseDt, "minute");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(2);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(4);
  expect(minute(dt)).toBe(5);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});

test("endOf('second') goes to the start of the second", () => {
  const dt = endOf(baseDt, "second");

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
  expect(() => endOf(baseDt, "splork")).toThrow();
});

test("endOf accepts plural convert", () => {
  const dt = endOf(baseDt, "years");

  expect(year(dt)).toBe(2010);
  expect(month(dt)).toBe(12);
  expect(day(dt)).toBe(31);
  expect(hour(dt)).toBe(23);
  expect(minute(dt)).toBe(59);
  expect(second(dt)).toBe(59);
  expect(millisecond(dt)).toBe(999);
});
