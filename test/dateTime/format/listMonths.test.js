import { listMonths } from "../../../src/dateTime/format";

test("listMonths lists the months in English by default", () => {
  expect(listMonths()).toEqual([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);
});

test("listMonths lists accepts a locale", () => {
  expect(listMonths("fr")).toEqual([
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ]);
});

test("listMonths lists accepts options", () => {
  expect(listMonths({ width: "short" })).toEqual([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]);
});

test("listMonths lists accepts a locale and options", () => {
  expect(listMonths("fr", { width: "short" })).toEqual([
    "janv.",
    "févr.",
    "mars",
    "avr.",
    "mai",
    "juin",
    "juil.",
    "août",
    "sept.",
    "oct.",
    "nov.",
    "déc.",
  ]);
});

test("listMonths lists accepts a dtf options", () => {
  expect(listMonths("zh", { numberingSystem: "hanidec" }, { width: "long" })).toEqual([
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ]);
});
