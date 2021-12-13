import { fromGregorian, fromJSDate, toGregorian } from "../../../src/dateTime/core";
import { diff } from "../../../src/duration/diff";
import { durValues, durMonths, durDays, durMilliseconds } from "../../../src/duration/core";

const diffFromObjs = (o1, o2, units) => {
  const dt1 = fromGregorian(o1);
  const dt2 = fromGregorian(o2);
  return diff(dt1, dt2, units);
};

const diffObjs = (o1, o2, units) => durValues(diffFromObjs(o1, o2, units));

test("diff() defaults to milliseconds", () => {
  expect(diffObjs({ year: 2017, millisecond: 12 }, { year: 2017 })).toEqual({
    milliseconds: 12,
  });
  const dur = diffFromObjs({ year: 2017 }, { year: 2017 })
  expect(durMilliseconds(dur)).toBe(0);
});

test("diff() makes simple diffs", () => {
  expect(diffObjs({ year: 2017 }, { year: 2017 }, "years")).toEqual({ years: 0 });
  expect(diffObjs({ year: 2017 }, { year: 2016 }, "years")).toEqual({ years: 1 });
  expect(diffObjs({ year: 2016, month: 4 }, { year: 2016, month: 1 }, "quarters")).toEqual({ quarters: 1 });
  expect(diffObjs({ year: 2017, month: 10 }, { year: 2017, month: 4 }, "quarters")).toEqual({ quarters: 2 });

  expect(diffObjs({ year: 2016, month: 6, day: 28 }, { year: 2016, month: 5, day: 28 }, "months")).toEqual({
    months: 1,
  });

  expect(diffObjs({ year: 2016, month: 6, day: 28 }, { year: 2016, month: 6, day: 25 }, "days")).toEqual({ days: 3 });

  expect(diffObjs({ year: 2016, month: 6, day: 1 }, { year: 2016, month: 5, day: 28 }, "days")).toEqual({ days: 4 });

  expect(diffObjs({ year: 2016, month: 6, day: 29 }, { year: 2016, month: 6, day: 1 }, "weeks")).toEqual({ weeks: 4 });

  expect(diffObjs({ year: 2016, month: 3, day: 3 }, { year: 2016, month: 2, day: 18 }, "weeks")).toEqual({ weeks: 2 });

  expect(
    diffObjs({ year: 2016, month: 6, day: 28, hour: 13 }, { year: 2016, month: 6, day: 28, hour: 5 }, "hours")
  ).toEqual({ hours: 8 });

  expect(
    diffObjs({ year: 2016, month: 6, day: 28, hour: 13 }, { year: 2016, month: 6, day: 28, hour: 5 }, "days")
  ).toEqual({ days: 1 / 3 });

  expect(
    diffObjs({ year: 2016, month: 6, day: 28, hour: 13 }, { year: 2016, month: 6, day: 25, hour: 5 }, "hours")
  ).toEqual({ hours: 24 * 3 + 8 });
});

test("diff() accepts multiple units", () => {
  expect(
    diffObjs(
      { year: 2016, month: 3, day: 28, hour: 13, minute: 46 },
      { year: 2016, month: 3, day: 16, hour: 5, second: 18 },
      ["days", "hours", "minutes", "seconds"]
    )
  ).toEqual({ days: 12, hours: 8, minutes: 45, seconds: 42 });

  expect(diffObjs({ year: 2016, month: 3, day: 25 }, { year: 2016, month: 3, day: 1 }, ["weeks", "days"])).toEqual({
    weeks: 3,
    days: 3,
  });

  expect(diffObjs({ year: 2016, month: 3, day: 28 }, { year: 2010, month: 3, day: 16 }, ["years", "days"])).toEqual({
    years: 6,
    days: 12,
  });

  expect(diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 16 }, ["years", "days"])).toEqual({
    years: 5,
    days: 364,
  });

  expect(diffObjs({ year: 2015, month: 3, day: 14 }, { year: 2009, month: 3, day: 16 }, ["years", "days"])).toEqual({
    years: 5,
    days: 363,
  });
});

test("diff() handles unmatched units", () => {
  expect(
    diffObjs({ year: 2017, month: 6, day: 7, hour: 21 }, { year: 2017, month: 6, day: 1, hour: 22 }, [
      "weeks",
      "days",
      "hours",
    ])
  ).toEqual({ weeks: 0, days: 5, hours: 23 });

  expect(
    diffObjs({ year: 2017, month: 6, day: 27, hour: 21 }, { year: 2017, month: 6, day: 26, hour: 22 }, [
      "days",
      "hours",
    ])
  ).toEqual({ days: 0, hours: 23 });

  expect(
    diffObjs({ year: 2017, month: 6, day: 7, hour: 21 }, { year: 2017, month: 6, day: 1, hour: 22 }, ["weeks", "hours"])
  ).toEqual({ weeks: 0, hours: 23 + 5 * 24 });
});

test("diff() sets all its units to 0 if the duration is empty", () => {
  const t = fromGregorian({ year: 2018, month: 11, day: 5, hour: 0 });
  expect(durValues(diff(t, t))).toEqual({ milliseconds: 0 });
  expect(durValues(diff(t, t, "hours"))).toEqual({ hours: 0 });
  expect(durValues(diff(t, t, "days"))).toEqual({ days: 0 });
});

test("diff() puts fractional parts in the lowest order unit", () => {
  expect(diffObjs({ year: 2017, month: 7, day: 14 }, { year: 2016, month: 6, day: 16 }, ["years", "months"])).toEqual({
    years: 1,
    months: 1 - 2 / 30,
  });
});

test("diff() returns the fractional parts even when it can't find a whole unit", () => {
  expect(
    diffObjs({ year: 2017, month: 7, day: 14, hour: 6 }, { year: 2017, month: 7, day: 14, hour: 2 }, ["days"])
  ).toEqual({ days: 1 / 6 });
});

test("diff() is calendary for years, months, day", () => {
  // respecting the leap year
  expect(diffObjs({ year: 2016, month: 6, day: 14 }, { year: 2010, month: 6, day: 14 }, ["years", "days"])).toEqual({
    years: 6,
    days: 0,
  });

  expect(diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 16 }, ["years", "days"])).toEqual({
    years: 5,
    days: 364,
  });

  // ignores the DST, works in calendar days, not bubbled months
  expect(diffObjs({ year: 2016, month: 5, day: 14 }, { year: 2016, month: 2, day: 14 }, "days")).toEqual({ days: 90 });
});

test("diff() handles fractional years as fractions of those specific years", () => {
  // the point here is that we're crossing the leap year
  expect(diffObjs({ year: 2020, month: 3, day: 27 }, { year: 2018, month: 3, day: 28 }, "years")).toEqual({
    years: 1 + 365.0 / 366,
  });
});

test("diff() handles fractional months as fractions of those specific months", () => {
  // The point here is that January has 31 days
  expect(diffObjs({ year: 2018, month: 2, day: 24 }, { year: 2017, month: 12, day: 25 }, "months")).toEqual({
    months: 1 + 30.0 / 31,
  });
});

test("diff() handles fractional weeks as fractions of those specific weeks", () => {
  // America/New_York has a fall back Nov 4, 2018 at 2:00
  expect(
    diffObjs({ year: 2018, month: 11, day: 16, hour: 0 }, { year: 2018, month: 11, day: 2, hour: 1 }, "weeks")
  ).toEqual({ weeks: 1 + 6.0 / 7 + 23.0 / 24 / 7 });
});

test("diff() handles fractional days as fractions of those specific days", () => {
  // America/New_York has a fall back Nov 4, 2018 at 2:00
  expect(
    diffObjs({ year: 2018, month: 11, day: 5, hour: 0 }, { year: 2018, month: 11, day: 3, hour: 1 }, "days")
  ).toEqual({ days: 1 + 24 / 25 });
});

test("diff() is precise for lower order units", () => {
  // spring forward skips one hour
  expect(diffObjs({ year: 2016, month: 5, day: 5 }, { year: 2016, month: 1, day: 1 }, "hours")).toEqual({
    hours: 2999,
  });
});

// see https://github.com/moment/luxon/issues/487
test("diff() results works when needing to backtrack months", () => {
  const left = fromJSDate(new Date(1554036127038));
  const right = fromJSDate(new Date(1554122527128));

  const d = diff(right, left, ["months", "days", "hours"]);
  expect(durMonths(d)).toBe(0);
  expect(durDays(d)).toBe(1);
});
