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
