import { duration, durToFormat, durFromMillis } from "../../../src/luxon";

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

test("durToFormat('S') returns milliseconds", () => {
  expect(durToFormat(dur, "S")).toBe("37598706007");

  const lil = durFromMillis(5);
  expect(durToFormat(lil, "S")).toBe("5");
  expect(durToFormat(lil, "SS")).toBe("05");
  expect(durToFormat(lil, "SSSSS")).toBe("00005");
});

test("durToFormat('s') returns seconds", () => {
  expect(durToFormat(dur, "s")).toBe("37598706");
  expect(durToFormat(dur, "s", { floor: false })).toBe("37598706.007");
  expect(durToFormat(dur, "s.SSS")).toBe("37598706.007");

  const lil = duration({ seconds: 6 });
  expect(durToFormat(lil, "s")).toBe("6");
  expect(durToFormat(lil, "ss")).toBe("06");
  expect(durToFormat(lil, "sss")).toBe("006");
  expect(durToFormat(lil, "ssss")).toBe("0006");
});

test("durToFormat('m') returns minutes", () => {
  expect(durToFormat(dur, "m")).toBe("626645");
  expect(durToFormat(dur, "m", { floor: false })).toBe("626645.1");
  expect(durToFormat(dur, "m:ss")).toBe("626645:06");
  expect(durToFormat(dur, "m:ss.SSS")).toBe("626645:06.007");

  const lil = duration({ minutes: 6 });
  expect(durToFormat(lil, "m")).toBe("6");
  expect(durToFormat(lil, "mm")).toBe("06");
  expect(durToFormat(lil, "mmm")).toBe("006");
  expect(durToFormat(lil, "mmmm")).toBe("0006");
});

test("durToFormat('h') returns hours", () => {
  expect(durToFormat(dur, "h")).toBe("10444");
  expect(durToFormat(dur, "h", { floor: false })).toBe("10444.085");
  expect(durToFormat(dur, "h:ss")).toBe("10444:306");
  expect(durToFormat(dur, "h:mm:ss.SSS")).toBe("10444:05:06.007");

  const lil = duration({ hours: 6 });
  expect(durToFormat(lil, "h")).toBe("6");
  expect(durToFormat(lil, "hh")).toBe("06");
  expect(durToFormat(lil, "hhh")).toBe("006");
  expect(durToFormat(lil, "hhhh")).toBe("0006");
});

test("durToFormat('d') returns days", () => {
  expect(durToFormat(dur, "d")).toBe("435");
  expect(durToFormat(dur, "d", { floor: false })).toBe("435.17");
  expect(durToFormat(dur, "d:h:ss")).toBe("435:4:306");
  expect(durToFormat(dur, "d:h:mm:ss.SSS")).toBe("435:4:05:06.007");

  const lil = duration({ days: 6 });
  expect(durToFormat(lil, "d")).toBe("6");
  expect(durToFormat(lil, "dd")).toBe("06");
  expect(durToFormat(lil, "ddd")).toBe("006");
  expect(durToFormat(lil, "dddd")).toBe("0006");
});

test("durToFormat('M') returns months", () => {
  expect(durToFormat(dur, "M")).toBe("14");
  expect(durToFormat(dur, "M", { floor: false })).toBe("14.356");
  expect(durToFormat(dur, "M:s")).toBe("14:878706");
  expect(durToFormat(dur, "M:dd:h:mm:ss.SSS")).toBe("14:10:4:05:06.007");

  const lil = duration({ months: 6 });
  expect(durToFormat(lil, "M")).toBe("6");
  expect(durToFormat(lil, "MM")).toBe("06");
  expect(durToFormat(lil, "MMM")).toBe("006");
  expect(durToFormat(lil, "MMMM")).toBe("0006");
});

test("durToFormat('y') returns years", () => {
  expect(durToFormat(dur, "y")).toBe("1");
  expect(durToFormat(dur, "y", { floor: false })).toBe("1.195");
  expect(durToFormat(dur, "y:m")).toBe("1:101045");
  expect(durToFormat(dur, "y:M:dd:h:mm:ss.SSS")).toBe("1:2:10:4:05:06.007");

  const lil = duration({ years: 5 });
  expect(durToFormat(lil, "y")).toBe("5");
  expect(durToFormat(lil, "yy")).toBe("05");
  expect(durToFormat(lil, "yyyyy")).toBe("00005");
});

test("durToFormat leaves in zeros", () => {
  const tiny = duration({ seconds: 5 });
  expect(durToFormat(tiny, "hh:mm:ss")).toBe("00:00:05");
  expect(durToFormat(tiny, "hh:mm:ss.SSS")).toBe("00:00:05.000");
});

test("durToFormat rounds down", () => {
  const tiny = duration({ seconds: 5.7 });
  expect(durToFormat(tiny, "s")).toBe("5");

  const unpromoted = duration({ seconds: 59.7 });
  expect(durToFormat(unpromoted, "mm:ss")).toBe("00:59");
});

test("durToFormat localizes the numbers", () => {
  expect(durToFormat(dur, "yy:MM:dd:h:mm:ss.SSS", "bn")).toBe("০১:০২:১০:৪:০৫:০৬.০০৭");
});

test("durToFormat accepts number formatter options", () => {
  expect(durToFormat(durFromMillis(200000000), "SSS", { notation: "compact" })).toBe("200M");
});
