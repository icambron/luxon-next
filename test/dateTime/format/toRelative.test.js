import { fromGregorian, toRelative, plus, minus, endOf } from "../../../src/luxon";

test("toRelative works down through the units", () => {
  const base = fromGregorian({ year: 1983, month: 10, day: 14 });
  expect(toRelative(base, plus(base, { minutes: 1 }))).toBe("in 1 minute");
  expect(toRelative(base, plus(base, { minutes: 5 }))).toBe("in 5 minutes");
  expect(toRelative(base, plus(base, { minutes: 65 }))).toBe("in 1 hour");
  expect(toRelative(base, plus(base, { minutes: 165 }))).toBe("in 2 hours");
  expect(toRelative(base, plus(base, { hours: 24 }))).toBe("in 1 day");
  expect(toRelative(base, plus(base, { days: 3 }))).toBe("in 3 days");
  expect(toRelative(base, plus(base, { months: 5 }))).toBe("in 5 months");
  expect(toRelative(base, plus(base, { months: 15 }))).toBe("in 1 year");

  expect(toRelative(base, minus(base, { minutes: 1 }))).toBe("1 minute ago");
  expect(toRelative(base, minus(base, { minutes: 5 }))).toBe("5 minutes ago");
  expect(toRelative(base, minus(base, { minutes: 65 }))).toBe("1 hour ago");
  expect(toRelative(base, minus(base, { minutes: 165 }))).toBe("2 hours ago");
  expect(toRelative(base, minus(base, { hours: 24 }))).toBe("1 day ago");
  expect(toRelative(base, minus(base, { days: 3 }))).toBe("3 days ago");
  expect(toRelative(base, minus(base, { months: 5 }))).toBe("5 months ago");
  expect(toRelative(base, minus(base, { months: 15 }))).toBe("1 year ago");
});

test("toRelative takes a roundTo argument", () => {
  const base = fromGregorian({ year: 1983, month: 10, day: 14 });
  expect(toRelative(base, plus(base, { months: 15 }), { roundTo: 2 })).toBe("in 1.25 years");
  expect(toRelative(base, minus(base, { months: 15 }), { roundTo: 2 })).toBe("1.25 years ago");
  expect(toRelative(base, minus(base, { months: 7, days: 15 }), { roundTo: 2 })).toBe("7.56 months ago");
});

test("toRelative takes a units argument", () => {
  const base = fromGregorian({ year: 2018, month: 10, day: 14 }, "utc");

  expect(toRelative(base, plus(base, { months: 15 }), { units: ["months"] })).toBe("in 15 months");

  expect(toRelative(base, minus(base, { months: 15 }), { units: ["months"] })).toBe("15 months ago");

  expect(toRelative(base, plus(base, { months: 3 }), { units: ["years"], roundTo: 2 })).toBe("in 0.25 years");

  expect(toRelative(base, minus(base, { months: 3 }), { units: ["years"], roundTo: 2 })).toBe("0.25 years ago");

  expect(toRelative(base, minus(base, { seconds: 30 }), { units: ["days", "hours", "minutes"] })).toBe("0 minutes ago");

  expect(toRelative(base, minus(base, { seconds: 1 }), { units: ["minutes"] })).toBe("0 minutes ago");

  expect(toRelative(base, plus(base, { seconds: 1 }), { units: ["minutes"] })).toBe("in 0 minutes");

  expect(toRelative(base, plus(base, { seconds: 30 }), { units: ["days", "hours", "minutes"] })).toBe("in 0 minutes");

  expect(toRelative(base, plus(base, { years: 2 }), { units: ["days", "hours", "minutes"] })).toBe("in 731 days");
});

test("toRelative always rounds toward 0", () => {
  const base = fromGregorian({ year: 1983, month: 10, day: 14 });
  expect(toRelative(base, endOf(base, "day"))).toBe("in 23 hours");
  expect(toRelative(base, minus(base, { days: 1, milliseconds: -1 }))).toBe("23 hours ago");
});

test("toRelative uses the absolute time", () => {
  const base = fromGregorian({ year: 1983, month: 10, day: 14, hour: 23, minute: 59 });
  const end = fromGregorian({ year: 1983, month: 10, day: 15, hour: 0, minute: 3 });
  expect(toRelative(base, end)).toBe("in 4 minutes");
  expect(toRelative(end, base)).toBe("4 minutes ago");
});
