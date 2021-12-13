import { formatEra, fromGregorian } from "../../../src/luxon";

const dt = fromGregorian(
  {
    year: 2014,
    month: 8,
    day: 6,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  },
  "utc"
);

test("formatEra defaults to English", () => {
  expect(formatEra(dt)).toEqual("AD");
});

test("formatEra accepts locales", () => {
  expect(formatEra(dt, "be")).toEqual("н.э.");
});

test("formatEra accepts options", () => {
  expect(formatEra(dt, { width: "long" })).toEqual("Anno Domini");
});

test("formatEra accepts locale and options", () => {
  expect(formatEra(dt, "be", { width: "long" })).toEqual("ад нараджэння Хрыстова");
});
