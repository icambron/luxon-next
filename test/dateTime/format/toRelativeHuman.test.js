import { fromGregorian, toRelativeHuman, plus, minus, endOf } from "../../../src/luxon";

test.each([
  [{ minutes: 1 }, "in 1 minute"],
  [{ minutes: 5 }, "in 5 minutes"],
  [{ hours: 13 }, "tomorrow"],
  [{ hours: 25 }, "tomorrow"],
  [{ months: 1 }, "in 1 month"],
  [{ months: 5 }, "in 5 months"],
  [{ months: 15 }, "in 1 year"],
])("toRelativeHuman adding %p results in %p", (toAdd, expected) => {
  const base = fromGregorian({ year: 1983, month: 10, day: 14, hour: 12 });
  expect(toRelativeHuman(base, plus(base, toAdd))).toEqual(expected);
});

test.each([
  [{ minutes: 1 }, "1 minute ago"],
  [{ minutes: 5 }, "5 minutes ago"],
  [{ hours: 11 }, "11 hours ago"],
  [{ hours: 13 }, "yesterday"],
  [{ hours: 25 }, "yesterday"],
  [{ months: 1 }, "1 month ago"],
  [{ months: 5 }, "5 months ago"],
  [{ months: 15 }, "1 year ago"],
])("toRelativeHuman subtracting %p results in %p", (toAdd, expected) => {
  const base = fromGregorian({ year: 1983, month: 10, day: 14, hour: 12 });
  expect(toRelativeHuman(base, minus(base, toAdd))).toEqual(expected);
});

test("toRelativeHuman has good behavior at the edge of days", () => {
  const almostMidnight = fromGregorian({ year: 1983, month: 10, day: 14, hour: 23, minute: 58 });
  const justOver = plus(almostMidnight, { minutes: 3 });

  expect(toRelativeHuman(almostMidnight, justOver)).toEqual("in 3 minutes");
});

test("toRelativeHuman has good behavior at the edge of years", () => {
  const almostMidnight = fromGregorian({ year: 1983, month: 11, day: 30, hour: 23, minute: 58 });
  const justOver = plus(almostMidnight, { days: 3 });

  expect(toRelativeHuman(almostMidnight, justOver)).toEqual("in 3 days");
});
