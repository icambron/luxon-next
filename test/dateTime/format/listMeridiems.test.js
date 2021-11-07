import { listMeridiems } from "../../../src/dateTime/format";

test("listMeridiems() lists the meridiems", () => {
  expect(listMeridiems("en")).toEqual(["AM", "PM"]);
  expect(listMeridiems("my")).toEqual(["နံနက်", "ညနေ"]);
});

test("listMeridiems() defaults to the current locale", () => {
  expect(listMeridiems()).toEqual(["AM", "PM"]);
});

test("listMeridiems() accepts widths", () => {
  expect(listMeridiems({ width: "long" })).toEqual([
    "at night",
    "in the morning",
    "noon",
    "in the afternoon",
    "in the evening",
  ]);
});

test("listMeridiems() accepts locales and widths", () => {
  expect(listMeridiems({ locale: "fr", width: "long" })).toEqual(["du matin", "midi", "de l’après-midi", "du soir"]);
});
