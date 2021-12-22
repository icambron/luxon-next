import { durFromISO, durValues } from "../../../src/luxon";

const check = (s, ob) => {
  expect(durValues(durFromISO(s))).toEqual(ob);
};

test("durFromISO can parse a variety of ISO formats", () => {
  check("P5Y3M", { years: 5, months: 3 });
  check("PT54M32S", { minutes: 54, seconds: 32 });
  check("P3DT54M32S", { days: 3, minutes: 54, seconds: 32 });
  check("P1YT34000S", { years: 1, seconds: 34000 });
  check("P1W1DT13H23M34S", { weeks: 1, days: 1, hours: 13, minutes: 23, seconds: 34 });
  check("P2W", { weeks: 2 });
  check("PT10000000000000000000.999S", { seconds: 10000000000000000000, milliseconds: 999 });
});

test("durFromISO can parse mixed or negative durations", () => {
  check("P-5Y-3M", { years: -5, months: -3 });
  check("PT-54M32S", { minutes: -54, seconds: 32 });
  check("P-3DT54M-32S", { days: -3, minutes: 54, seconds: -32 });
  check("P1YT-34000S", { years: 1, seconds: -34000 });
  check("P-1W1DT13H23M34S", { weeks: -1, days: 1, hours: 13, minutes: 23, seconds: 34 });
  check("P-2W", { weeks: -2 });
  check("-P1D", { days: -1 });
  check("-P5Y3M", { years: -5, months: -3 });
  check("-P-5Y-3M", { years: 5, months: 3 });
  check("-P-1W1DT13H-23M34S", { weeks: 1, days: -1, hours: -13, minutes: 23, seconds: -34 });
  check("PT-1.5S", { seconds: -1, milliseconds: -500 });
  check("PT-0.5S", { seconds: 0, milliseconds: -500 });
  check("PT1.5S", { seconds: 1, milliseconds: 500 });
  check("PT0.5S", { seconds: 0, milliseconds: 500 });
});

test("durFromISO can parse fractions of seconds", () => {
  check("PT54M32.5S", {
    minutes: 54,
    seconds: 32,
    milliseconds: 500,
  });
  check("PT54M32.53S", {
    minutes: 54,
    seconds: 32,
    milliseconds: 530,
  });
  check("PT54M32.534S", {
    minutes: 54,
    seconds: 32,
    milliseconds: 534,
  });
  check("PT54M32.5348S", {
    minutes: 54,
    seconds: 32,
    milliseconds: 534,
  });
  check("PT54M32.034S", {
    minutes: 54,
    seconds: 32,
    milliseconds: 34,
  });
});

test("durFromISO can parse fractions", () => {
  check("P1.5Y", {
    years: 1.5,
  });
  check("P1.5M", {
    months: 1.5,
  });
  check("P1.5W", {
    weeks: 1.5,
  });
  check("P1.5D", {
    days: 1.5,
  });
  check("PT9.5H", {
    hours: 9.5,
  });
});

const rejects = (s) => {
  expect(() => durFromISO(s)).toThrow();
};

test("fromISO rejects junk", () => {
  rejects("poop");
  rejects("PTglorb");
  rejects("P5Y34S");
  rejects("5Y");
  rejects("P34S");
  rejects("P34K");
  rejects("P5D2W");
});