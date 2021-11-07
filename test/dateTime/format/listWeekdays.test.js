import { listWeekdays } from "../../../src/dateTime/format";

test("listWeekdays() lists all the weekdays", () => {
  expect(listWeekdays()).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

  expect(listWeekdays({ width: "short" })).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

  expect(listWeekdays({ width: "narrow" })).toEqual(["M", "T", "W", "T", "F", "S", "S"]);

  expect(listWeekdays("ru")).toEqual([
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота",
    "воскресенье",
  ]);
});

test("listWeekdays() defaults to long names", () => {
  expect(listWeekdays()).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
});

test("listWeekdays() accepts a mode option", () => {
  expect(listWeekdays({ mode: "format" })).toEqual([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);

  expect(listWeekdays({ width: "short", mode: "format" })).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
});
