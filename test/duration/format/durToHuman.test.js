import { duration, durToHuman } from "../../../src/luxon";

const dur = duration({
  years: 1,
  months: 2,
  weeks: 1,
  days: 3,
  hours: 4,
  minutes: 5,
  seconds: 6,
  milliseconds: 7,
});

test("durToHuman formats out a list", () => {
  expect(durToHuman(dur)).toEqual("1 year, 2 months, 1 week, 3 days, 4 hours, 5 minutes, 6 seconds, 7 milliseconds");
});

test("durToHuman accepts a listStyle", () => {
  expect(durToHuman(dur, { listStyle: "long" })).toEqual("1 year, 2 months, 1 week, 3 days, 4 hours, 5 minutes, 6 seconds, and 7 milliseconds");
});

test("durToHuman accepts number format opts", () => {
  expect(durToHuman(dur, { unitDisplay: "short" })).toEqual("1 yr, 2 mths, 1 wk, 3 days, 4 hr, 5 min, 6 sec, 7 ms");
});
