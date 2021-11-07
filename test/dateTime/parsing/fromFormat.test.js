import { fromFormat, fromFormatExplain, simpleParsingOptions } from "../../../src/parsing/parse";
import {
  year,
  month,
  day,
  hour,
  minute,
  second,
  millisecond,
  quarter,
  now,
  zoneName,
  offset,
  fromMillis,
} from "../../../src/dateTime/core";
import { ConflictingSpecificationError } from "../../../src/errors";
import { weekday, weekNumber, weekYear } from "../../../src/dateTime/isoWeek";
import { ordinal } from "../../../src/dateTime/ordinal";
import { toUTC } from "../../../src/dateTime/zone";
import { withDefaultLocale } from "../../helpers";

test("fromFormat() parses basic times", () => {
  const dt = fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);
  expect(dt |> hour).toBe(9);
  expect(dt |> minute).toBe(10);
  expect(dt |> second).toBe(11);
  expect(dt |> millisecond).toBe(445);
});

test("fromFormat() throws on invalid formats", () => {
  expect(() => fromFormat("Mar 3, 2020", "MMM dd, yyyy")).toThrow();
});

test("fromFormat() parses with variable-length input", () => {
  let dt = fromFormat("1982/05/03 09:07:05.004", "y/M/d H:m:s.S");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(9);
  expect(dt |> minute).toBe(7);
  expect(dt |> second).toBe(5);
  expect(dt |> millisecond).toBe(4);

  dt = fromFormat("82/5/3 9:7:5.4", "yy/M/d H:m:s.S");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(3);
  expect(dt |> hour).toBe(9);
  expect(dt |> minute).toBe(7);
  expect(dt |> second).toBe(5);
  expect(dt |> millisecond).toBe(4);
});

test("fromFormat() parses meridiems", () => {
  let dt = fromFormat("1982/05/25 9 PM", "yyyy/MM/dd h a");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);
  expect(dt |> hour).toBe(21);

  dt = fromFormat("1982/05/25 9 AM", "yyyy/MM/dd h a");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);
  expect(dt |> hour).toBe(9);

  dt = fromFormat("1982/05/25 12 AM", "yyyy/MM/dd h a");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);
  expect(dt |> hour).toBe(0);

  dt = fromFormat("1982/05/25 12 PM", "yyyy/MM/dd h a");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);
  expect(dt |> hour).toBe(12);
});

test("fromFormat() throws if you specify meridiem with 24-hour time", () => {
  expect(() => fromFormat("930PM", "Hmma")).toThrow(ConflictingSpecificationError);
});
//
//// #714
const nbsp = String.fromCharCode(160);
test.each([
  ["10:45 a. m.", true],
  ["10:45 a. m", true],
  ["10:45 a m.", true],
  ["10:45 a m", true],
  ["10:45 p. m", false],
  ["10:45 p m.", false],
  ["10:45 p m", false],
  [`10:45 a.${nbsp}m.`, true],
  [`10:45 a.${nbsp}m`, true],
  [`10:45 a${nbsp}m.`, true],
  [`10:45 a${nbsp}m`, true],
  [`10:45 p.${nbsp}m.`, false],
  [`10:45 p.${nbsp}m`, false],
  [`10:45 p${nbsp}m.`, false],
  [`10:45 p${nbsp}m`, false],
])("fromFormat() makes dots optional and handles non breakable spaces: %p", (input, isAM) => {
  withDefaultLocale("es-ES", () => {
    const dt = fromFormat(input, "hh:mm a");
    expect(dt |> hour).toBe(isAM ? 10 : 22);
    expect(dt |> minute).toBe(45);
    expect(dt |> second).toBe(0);
  });
});

test("fromFormat() parses variable-digit years", () => {
  expect(fromFormat("2", "y") |> year).toBe(2);
  expect(fromFormat("22", "y") |> year).toBe(22);
  expect(fromFormat("222", "y") |> year).toBe(222);
  expect(fromFormat("2222", "y") |> year).toBe(2222);
  expect(fromFormat("22222", "y") |> year).toBe(22222);
  expect(fromFormat("222222", "y") |> year).toBe(222222);
});

test("fromFormat() with yyyyy optionally parses extended years", () => {
  expect(() => fromFormat("222", "yyyyy")).toThrow();
  expect(fromFormat("2222", "yyyyy") |> year).toBe(2222);
  expect(fromFormat("22222", "yyyyy") |> year).toBe(22222);
  expect(fromFormat("222222", "yyyyy") |> year).toBe(222222);
});

test("fromFormat() with yyyyyy strictly parses extended years", () => {
  expect(() => fromFormat("2222", "yyyyyy")).toThrow();
  expect(fromFormat("222222", "yyyyyy") |> year).toBe(222222);
  expect(fromFormat("022222", "yyyyyy") |> year).toBe(22222);
  expect(() => fromFormat("2222222", "yyyyyy")).toThrow();
});

test("fromFormat() defaults yy to the right century", () => {
  expect(fromFormat("55", "yy") |> year).toBe(2055);
  expect(fromFormat("70", "yy") |> year).toBe(1970);
  expect(fromFormat("1970", "yy") |> year).toBe(1970);
});

test("fromFormat() parses hours", () => {
  expect(fromFormat("5", "h") |> hour).toBe(5);
  expect(fromFormat("12", "h") |> hour).toBe(12);
  expect(fromFormat("05", "hh") |> hour).toBe(5);
  expect(fromFormat("12", "hh") |> hour).toBe(12);
  expect(fromFormat("5", "H") |> hour).toBe(5);
  expect(fromFormat("13", "H") |> hour).toBe(13);
  expect(fromFormat("05", "HH") |> hour).toBe(5);
  expect(fromFormat("13", "HH") |> hour).toBe(13);
});

test.each([
  ["1", "S", 1],
  ["12", "S", 12],
  ["123", "S", 123],
  ["1", "S", 1],
  ["12", "S", 12],
  ["123", "S", 123],
  ["123", "SSS", 123],
  ["023", "SSS", 23],
])("fromFormat() parses milliseconds: %p with %p", (ms, token, expected) => {
  expect(fromFormat(ms, token) |> millisecond).toBe(expected);
});

test.each([
  ["1234", "S"],
  ["1", "SSS"],
  ["12", "SSS"],
  ["1234", "SSS"],
])("fromFormat() can't parse invalid %p with %p", (ms, token) => {
  expect(() => fromFormat(ms, token)).toThrow();
});

test("fromFormat() parses fractional seconds", () => {
  expect(fromFormat("1", "u") |> millisecond).toBe(100);
  expect(fromFormat("12", "u") |> millisecond).toBe(120);
  expect(fromFormat("123", "u") |> millisecond).toBe(123);
  expect(fromFormat("023", "u") |> millisecond).toBe(23);
  expect(fromFormat("003", "u") |> millisecond).toBe(3);
  expect(fromFormat("1234", "u") |> millisecond).toBe(123);
  expect(fromFormat("1235", "u") |> millisecond).toBe(123);

  expect(fromFormat("1", "uu") |> millisecond).toBe(100);
  expect(fromFormat("12", "uu") |> millisecond).toBe(120);
  expect(fromFormat("02", "uu") |> millisecond).toBe(20);

  expect(fromFormat("1", "uuu") |> millisecond).toBe(100);

  expect(() => fromFormat("-33", "uu")).toThrow();
  expect(() => fromFormat("-2", "uuu")).toThrow();
});

test("fromFormat() parses weekdays", () => {
  expect(fromFormat("5", "E") |> weekday).toBe(5);
  expect(fromFormat("5", "c") |> weekday).toBe(5);

  expect(fromFormat("Fri", "EEE") |> weekday).toBe(5);
  expect(fromFormat("Fri", "ccc") |> weekday).toBe(5);

  expect(fromFormat("Friday", "EEEE") |> weekday).toBe(5);
  expect(fromFormat("Friday", "cccc") |> weekday).toBe(5);
});

test("fromFormat() parses eras", () => {
  let dt = fromFormat("0206 AD", "yyyy G");
  expect(dt |> year).toEqual(206);

  dt = fromFormat("0206 BC", "yyyy G");
  expect(dt |> year).toEqual(-206);

  dt = fromFormat("0206 Before Christ", "yyyy GG");
  expect(dt |> year).toEqual(-206);
});

test("fromFormat() parses variable-length days", () => {
  let dt = fromFormat("Mar 3, 2020", "MMM d, yyyy");
  expect(dt |> day).toBe(3);

  dt = fromFormat("Mar 13, 2020", "MMM d, yyyy");
  expect(dt |> day).toBe(13);
});

test("fromFormat() parses fixed-length days", () => {
  let i = fromFormat("Mar 03, 2020", "MMM dd, yyyy");
  expect(i |> day).toBe(3);

  i = fromFormat("Mar 13, 2020", "MMM dd, yyyy");
  expect(i |> day).toBe(13);
});

test("fromFormat() parses standalone month names", () => {
  let dt = fromFormat("May 25 1982", "LLLL dd yyyy");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);

  dt = fromFormat("Sep 25 1982", "LLL dd yyyy");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(9);
  expect(dt |> day).toBe(25);

  dt = fromFormat("5 25 1982", "L dd yyyy");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);

  dt = fromFormat("05 25 1982", "LL dd yyyy");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);

  dt = fromFormat("mai 25 1982", "LLLL dd yyyy", { locale: "fr" });
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);

  dt = fromFormat("janv. 25 1982", "LLL dd yyyy", { locale: "fr" });
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(1);
  expect(dt |> day).toBe(25);
});

test("fromFormat() parses format month names", () => {
  let dt = fromFormat("May 25 1982", "MMMM dd yyyy");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);

  dt = fromFormat("Sep 25 1982", "MMM dd yyyy");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(9);
  expect(dt |> day).toBe(25);

  dt = fromFormat("5 25 1982", "M dd yyyy");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);

  dt = fromFormat("05 25 1982", "MM dd yyyy");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);

  dt = fromFormat("mai 25 1982", "MMMM dd yyyy", { locale: "fr" });
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);

  dt = fromFormat("janv. 25 1982", "MMM dd yyyy", { locale: "fr" });
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(1);
  expect(dt |> day).toBe(25);
});

test("fromFormat() parses quarters", () => {
  const i = fromFormat("1982Q2", "yyyy[Q]q");
  expect(i |> year).toBe(1982);
  expect(i |> month).toBe(4);
  expect(i |> quarter).toBe(2);
  expect(fromFormat("2019Q1", "yyyy[Q]q") |> month).toBe(1);
  expect(fromFormat("2019Q2", "yyyy[Q]q") |> month).toBe(4);
  expect(fromFormat("2019Q3", "yyyy[Q]q") |> month).toBe(7);
  expect(fromFormat("2019Q4", "yyyy[Q]q") |> month).toBe(10);
  expect(fromFormat("2019Q01", "yyyy[Q]qq") |> month).toBe(1);
  expect(fromFormat("2019Q02", "yyyy[Q]qq") |> month).toBe(4);
  expect(fromFormat("2019Q03", "yyyy[Q]qq") |> month).toBe(7);
  expect(fromFormat("2019Q04", "yyyy[Q]qq") |> month).toBe(10);
});

test("fromFormat() makes trailing periods in month names optional", () => {
  const i = fromFormat("janv 25 1982", "LLL dd yyyy", {
    locale: "fr",
  });
  expect(i |> year).toBe(1982);
  expect(i |> month).toBe(1);
  expect(i |> day).toBe(25);
});

test("fromFormat() does not match arbitrary stuff with those periods", () => {
  expect(() => fromFormat("janvQ 25 1982", "LLL dd yyyy", { locale: "fr" })).toThrow();
});

test("fromFormat() uses case-insensitive matching", () => {
  const i = fromFormat("Janv. 25 1982", "LLL dd yyyy", {
    locale: "fr",
  });
  expect(i |> year).toBe(1982);
  expect(i |> month).toBe(1);
  expect(i |> day).toBe(25);
});

test("fromFormat() parses offsets", () => {});

test("fromFormat() defaults weekday to this week", () => {
  const d = fromFormat("Monday", "EEEE");
  const dt = now();
  expect(d |> weekYear).toBe(dt |> weekYear);
  expect(d |> weekNumber).toBe(dt |> weekNumber);
  expect(d |> weekday).toBe(1);

  const d2 = fromFormat("3", "E");
  expect(d2 |> weekYear).toBe(dt |> weekYear);
  expect(d2 |> weekNumber).toBe(dt |> weekNumber);
  expect(d2 |> weekday).toBe(3);
});

test("DateTime.fromFormat() parses ordinals", () => {
  let d = fromFormat("2016 200", "yyyy ooo");
  expect(d |> year).toBe(2016);
  expect(d |> ordinal).toBe(200);

  d = fromFormat("2016 200", "yyyy ooo");
  expect(d |> year).toBe(2016);
  expect(d |> ordinal).toBe(200);

  d = fromFormat("2016 016", "yyyy ooo");
  expect(d |> year).toBe(2016);
  expect(d |> ordinal).toBe(16);

  d = fromFormat("2016 200", "yyyy o");
  expect(d |> year).toBe(2016);
  expect(d |> ordinal).toBe(200);

  d = fromFormat("2016 16", "yyyy o");
  expect(d |> year).toBe(2016);
  expect(d |> ordinal).toBe(16);
});

// todo - consider doing this
// test("fromFormat() throws on mixed units", () => {
//   expect(() => { fromFormat("2017 34", "yyyy WW") }).toThrow();
//   expect(() => { fromFormat("2017 05 340", "yyyy MM ooo") }).toThrow();
// });

test("fromFormat() accepts weekYear by itself", () => {
  let d = fromFormat("2004", "kkkk");
  expect(d |> weekYear).toBe(2004);
  expect(d |> weekNumber).toBe(1);
  expect(d |> weekday).toBe(1);

  d = fromFormat("04", "kk");
  expect(d |> weekYear).toBe(2004);
  expect(d |> weekNumber).toBe(1);
  expect(d |> weekday).toBe(1);
});

test("fromFormat() accepts weekNumber by itself", () => {
  const n = now();

  let d = fromFormat("17", "WW");
  expect(d |> weekYear).toBe(n |> weekYear);
  expect(d |> weekNumber).toBe(17);
  expect(d |> weekday).toBe(1);

  d = fromFormat("17", "W");
  expect(d |> weekYear).toBe(n |> weekYear);
  expect(d |> weekNumber).toBe(17);
  expect(d |> weekday).toBe(1);
});

test("fromFormat() accepts weekYear/weekNumber/weekday", () => {
  const d = fromFormat("2004 17 2", "kkkk WW E");
  expect(d |> weekYear).toBe(2004);
  expect(d |> weekNumber).toBe(17);
  expect(d |> weekday).toBe(2);
});

test("fromFormat() allows regex content", () => {
  const d = fromFormat("Monday", "EEEE");
  const dt = now();
  expect(d |> weekYear).toBe(dt |> weekYear);
  expect(d |> weekNumber).toBe(dt |> weekNumber);
  expect(d |> weekday).toBe(1);
});

test("fromFormat() allows literals", () => {
  const dt = fromFormat("1982/05/25 hello 09:10:11.445", "yyyy/MM/dd [hello] HH:mm:ss.SSS");
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);
  expect(dt |> hour).toBe(9);
  expect(dt |> minute).toBe(10);
  expect(dt |> second).toBe(11);
  expect(dt |> millisecond).toBe(445);
});

test("fromFormat() throws when it can't parse", () => {
  expect(() => fromFormat("Splurk", "EEEE")).toThrow();
});

test("fromFormat() throws when quarter value is not valid", () => {
  expect(() => fromFormat("2019Qaa", "yyyy[Q]qq")).toThrow();
  expect(() => fromFormat("2019Q00", "yyyy[Q]qq")).toThrow();
  expect(() => fromFormat("2019Q0", "yyyy[Q]q")).toThrow();
  expect(() => fromFormat("2019Q1", "yyyy[Q]q")).not.toThrow();
  expect(() => fromFormat("2019Q5", "yyyy[Q]q")).toThrow();
});

test.each([
  ["8, 05/25/1982", "E, MM/dd/yyyy", { locale: "fr" }],
  ["Tuesday, 05/25/1982", "EEEE, MM/dd/yyyy", { locale: "fr" }],
  ["Giberish, 05/25/1982", "EEEE, MM/dd/yyyy"],
  ["14/25/1982", "MM/dd/yyyy"],
  ["05/46/1982", "MM/dd/yyyy"],
])("fromFormat() throws for out-of-range values like %p", ([s, fmt, opts]) => {
  expect(() => fromFormat(s, fmt, opts)).toThrow();
});

test("fromFormat() accepts a zone arguments", () => {
  const dt = fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS", simpleParsingOptions("Asia/Tokyo"));
  expect(dt |> zoneName).toBe("Asia/Tokyo");
  expect(dt |> offset).toBe(9 * 60);
  expect(dt |> year).toBe(1982);
  expect(dt |> month).toBe(5);
  expect(dt |> day).toBe(25);
  expect(dt |> hour).toBe(9);
  expect(dt |> minute).toBe(10);
  expect(dt |> second).toBe(11);
  expect(dt |> millisecond).toBe(445);
});

test("fromFormat() parses IANA zones", () => {
  let d = fromFormat("1982/05/25 09:10:11.445 Asia/Tokyo", "yyyy/MM/dd HH:mm:ss.SSS z") |> toUTC();
  expect(d |> offset).toBe(0);
  expect(d |> hour).toBe(0);
  expect(d |> minute).toBe(10);

  d = fromFormat("1982/05/25 09:10:11.445 UTC", "yyyy/MM/dd HH:mm:ss.SSS z") |> toUTC();
  expect(d |> offset).toBe(0);
  expect(d |> hour).toBe(9);
  expect(d |> minute).toBe(10);
});

test("fromFormat() with setZone parses IANA zones and sets it", () => {
  const d = fromFormat("1982/05/25 09:10:11.445 Asia/Tokyo", "yyyy/MM/dd HH:mm:ss.SSS z", {
    useTargetZoneFromInput: true,
  });
  expect(d |> zoneName).toBe("Asia/Tokyo");
  expect(d |> offset).toBe(9 * 60);
  expect(d |> hour).toBe(9);
  expect(d |> minute).toBe(10);
});

test.each([
  ["Z", "-4"],
  ["ZZ", "-4:00"],
  ["ZZZ", "-0400"],
])("fromFormat() uses %p to parse fixed offsets like %p", (format, example) => {
  const dt = fromFormat(`1982/05/25 09:10:11.445 ${example}`, `yyyy/MM/dd HH:mm:ss.SSS ${format}`);
  expect(dt |> toUTC() |> hour).toBe(13);
  expect(dt |> toUTC() |> minute).toBe(10);
});

test.each([
  ["Z", "-4"],
  ["ZZ", "-4:00"],
  ["ZZZ", "-0400"],
])("fromFormat() with setZone parses fixed offsets like %p and sets it", (format, example) => {
  const dt = fromFormat(`1982/05/25 09:10:11.445 ${example}`, `yyyy/MM/dd HH:mm:ss.SSS ${format}`, {
    useTargetZoneFromInput: true,
  });
  expect(dt |> offset).toBe(-4 * 60);
  expect(dt |> toUTC() |> hour).toBe(13);
  expect(dt |> toUTC() |> minute).toBe(10);
});
//
//// todo - see the "localized tokens in Luxon"
//
test("fromFormat() throws if you don't provide a format", () => {
  expect(() => fromFormat("yo")).toThrow();
});

test("fromFormat validates weekdays", () => {
  expect(() => fromFormat("Wed 2017-11-29 02:00", "EEE yyyy-MM-dd HH:mm")).not.toThrow();
  expect(() => fromFormat("Thu 2017-11-29 02:00", "EEE yyyy-MM-dd HH:mm")).not.toThrow();
  expect(() => fromFormat("Wed 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ")).not.toThrow();
  expect(() =>
    fromFormat("Wed 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ", { useTargetZoneFromInput: true })
  ).not.toThrow();
  expect(() =>
    fromFormat("Tue 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ", { useTargetZoneFromInput: true })
  ).not.toThrow();
});

test("fromFormat containing special regex token", () => {
  const ianaFormat = "yyyy-MM-dd[T]HH-mm\\[z\\]";
  const dt = fromFormat("2019-01-14T11-30[Indian/Maldives]", ianaFormat, { useTargetZoneFromInput: true });
  expect(dt |> zoneName).toBe("Indian/Maldives");

  expect(() => fromFormat("2019-01-14T11-30[[Indian/Maldives]]", "yyyy-MM-dd[T]HH-mm\\[\\[z\\]\\]")).not.toThrow();
  expect(() => fromFormat("2019-01-14T11-30tIndian/Maldivest", "yyyy-MM-dd[T]HH-mm[t]z[t]")).not.toThrow();
  expect(() => fromFormat("2019-01-14T11-30\tIndian/Maldives\t", "yyyy-MM-dd[T]HH-mm[t]z[t]")).toThrow();
});
