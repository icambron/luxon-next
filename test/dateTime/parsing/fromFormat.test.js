import {
  fromFormat,
  simpleParseOpts,
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
  weekday,
  weekNumber,
  weekYear,
  ordinal,
  toUTC,
} from "../../../src/luxon";

import { withDefaultLocale } from "../../helpers";
import { ConflictingSpecificationError } from "../../../src/errors";

test("fromFormat() parses basic times", () => {
  const dt = fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);
  expect(hour(dt)).toBe(9);
  expect(minute(dt)).toBe(10);
  expect(second(dt)).toBe(11);
  expect(millisecond(dt)).toBe(445);
});

test("fromFormat() throws on invalid formats", () => {
  expect(() => fromFormat("Mar 3, 2020", "MMM dd, yyyy")).toThrow();
});

test("fromFormat() parses with variable-length input", () => {
  let dt = fromFormat("1982/05/03 09:07:05.004", "y/M/d H:m:s.S");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(9);
  expect(minute(dt)).toBe(7);
  expect(second(dt)).toBe(5);
  expect(millisecond(dt)).toBe(4);

  dt = fromFormat("82/5/3 9:7:5.4", "yy/M/d H:m:s.S");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(3);
  expect(hour(dt)).toBe(9);
  expect(minute(dt)).toBe(7);
  expect(second(dt)).toBe(5);
  expect(millisecond(dt)).toBe(4);
});

test("fromFormat() parses meridiems", () => {
  let dt = fromFormat("1982/05/25 9 PM", "yyyy/MM/dd h a");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);
  expect(hour(dt)).toBe(21);

  dt = fromFormat("1982/05/25 9 AM", "yyyy/MM/dd h a");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);
  expect(hour(dt)).toBe(9);

  dt = fromFormat("1982/05/25 12 AM", "yyyy/MM/dd h a");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);
  expect(hour(dt)).toBe(0);

  dt = fromFormat("1982/05/25 12 PM", "yyyy/MM/dd h a");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);
  expect(hour(dt)).toBe(12);
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
    expect(hour(dt)).toBe(isAM ? 10 : 22);
    expect(minute(dt)).toBe(45);
    expect(second(dt)).toBe(0);
  });
});

test("fromFormat() parses variable-digit years", () => {
  expect(year(fromFormat("2", "y"))).toBe(2);
  expect(year(fromFormat("22", "y"))).toBe(22);
  expect(year(fromFormat("222", "y"))).toBe(222);
  expect(year(fromFormat("2222", "y"))).toBe(2222);
  expect(year(fromFormat("22222", "y"))).toBe(22222);
  expect(year(fromFormat("222222", "y"))).toBe(222222);
});

test("fromFormat() with yyyyy optionally parses extended years", () => {
  expect(() => fromFormat("222", "yyyyy")).toThrow();
  expect(year(fromFormat("2222", "yyyyy"))).toBe(2222);
  expect(year(fromFormat("22222", "yyyyy"))).toBe(22222);
  expect(year(fromFormat("222222", "yyyyy"))).toBe(222222);
});

test("fromFormat() with yyyyyy strictly parses extended years", () => {
  expect(() => fromFormat("2222", "yyyyyy")).toThrow();
  expect(year(fromFormat("222222", "yyyyyy"))).toBe(222222);
  expect(year(fromFormat("022222", "yyyyyy"))).toBe(22222);
  expect(() => fromFormat("2222222", "yyyyyy")).toThrow();
});

test("fromFormat() defaults yy to the right century", () => {
  expect(year(fromFormat("55", "yy"))).toBe(2055);
  expect(year(fromFormat("70", "yy"))).toBe(1970);
  expect(year(fromFormat("1970", "yy"))).toBe(1970);
});

test("fromFormat() parses hours", () => {
  expect(hour(fromFormat("5", "h"))).toBe(5);
  expect(hour(fromFormat("12", "h"))).toBe(12);
  expect(hour(fromFormat("05", "hh"))).toBe(5);
  expect(hour(fromFormat("12", "hh"))).toBe(12);
  expect(hour(fromFormat("5", "H"))).toBe(5);
  expect(hour(fromFormat("13", "H"))).toBe(13);
  expect(hour(fromFormat("05", "HH"))).toBe(5);
  expect(hour(fromFormat("13", "HH"))).toBe(13);
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
  expect(millisecond(fromFormat(ms, token))).toBe(expected);
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
  expect(millisecond(fromFormat("1", "u"))).toBe(100);
  expect(millisecond(fromFormat("12", "u"))).toBe(120);
  expect(millisecond(fromFormat("123", "u"))).toBe(123);
  expect(millisecond(fromFormat("023", "u"))).toBe(23);
  expect(millisecond(fromFormat("003", "u"))).toBe(3);
  expect(millisecond(fromFormat("1234", "u"))).toBe(123);
  expect(millisecond(fromFormat("1235", "u"))).toBe(123);

  expect(millisecond(fromFormat("1", "uu"))).toBe(100);
  expect(millisecond(fromFormat("12", "uu"))).toBe(120);
  expect(millisecond(fromFormat("02", "uu"))).toBe(20);

  expect(millisecond(fromFormat("1", "uuu"))).toBe(100);

  expect(() => fromFormat("-33", "uu")).toThrow();
  expect(() => fromFormat("-2", "uuu")).toThrow();
});

test("fromFormat() parses weekdays", () => {
  expect(weekday(fromFormat("5", "E"))).toBe(5);
  expect(weekday(fromFormat("5", "c"))).toBe(5);

  expect(weekday(fromFormat("Fri", "EEE"))).toBe(5);
  expect(weekday(fromFormat("Fri", "ccc"))).toBe(5);

  expect(weekday(fromFormat("Friday", "EEEE"))).toBe(5);
  expect(weekday(fromFormat("Friday", "cccc"))).toBe(5);
});

test("fromFormat() parses eras", () => {
  let dt = fromFormat("0206 AD", "yyyy G");
  expect(year(dt)).toEqual(206);

  dt = fromFormat("0206 BC", "yyyy G");
  expect(year(dt)).toEqual(-206);

  dt = fromFormat("0206 Before Christ", "yyyy GG");
  expect(year(dt)).toEqual(-206);
});

test("fromFormat() parses variable-length days", () => {
  let dt = fromFormat("Mar 3, 2020", "MMM d, yyyy");
  expect(day(dt)).toBe(3);

  dt = fromFormat("Mar 13, 2020", "MMM d, yyyy");
  expect(day(dt)).toBe(13);
});

test("fromFormat() parses fixed-length days", () => {
  let i = fromFormat("Mar 03, 2020", "MMM dd, yyyy");
  expect(day(i)).toBe(3);

  i = fromFormat("Mar 13, 2020", "MMM dd, yyyy");
  expect(day(i)).toBe(13);
});

test("fromFormat() parses standalone month names", () => {
  let dt = fromFormat("May 25 1982", "LLLL dd yyyy");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);

  dt = fromFormat("Sep 25 1982", "LLL dd yyyy");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(9);
  expect(day(dt)).toBe(25);

  dt = fromFormat("5 25 1982", "L dd yyyy");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);

  dt = fromFormat("05 25 1982", "LL dd yyyy");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);

  dt = fromFormat("mai 25 1982", "LLLL dd yyyy", { locale: "fr" });
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);

  dt = fromFormat("janv. 25 1982", "LLL dd yyyy", { locale: "fr" });
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(1);
  expect(day(dt)).toBe(25);
});

test("fromFormat() parses format month names", () => {
  let dt = fromFormat("May 25 1982", "MMMM dd yyyy");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);

  dt = fromFormat("Sep 25 1982", "MMM dd yyyy");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(9);
  expect(day(dt)).toBe(25);

  dt = fromFormat("5 25 1982", "M dd yyyy");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);

  dt = fromFormat("05 25 1982", "MM dd yyyy");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);

  dt = fromFormat("mai 25 1982", "MMMM dd yyyy", { locale: "fr" });
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);

  dt = fromFormat("janv. 25 1982", "MMM dd yyyy", { locale: "fr" });
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(1);
  expect(day(dt)).toBe(25);
});

test("fromFormat() parses quarters", () => {
  const i = fromFormat("1982Q2", "yyyy[Q]q");
  expect(year(i)).toBe(1982);
  expect(month(i)).toBe(4);
  expect(quarter(i)).toBe(2);
  expect(month(fromFormat("2019Q1", "yyyy[Q]q"))).toBe(1);
  expect(month(fromFormat("2019Q2", "yyyy[Q]q"))).toBe(4);
  expect(month(fromFormat("2019Q3", "yyyy[Q]q"))).toBe(7);
  expect(month(fromFormat("2019Q4", "yyyy[Q]q"))).toBe(10);
  expect(month(fromFormat("2019Q01", "yyyy[Q]qq"))).toBe(1);
  expect(month(fromFormat("2019Q02", "yyyy[Q]qq"))).toBe(4);
  expect(month(fromFormat("2019Q03", "yyyy[Q]qq"))).toBe(7);
  expect(month(fromFormat("2019Q04", "yyyy[Q]qq"))).toBe(10);
});

test("fromFormat() makes trailing periods in month names optional", () => {
  const i = fromFormat("janv 25 1982", "LLL dd yyyy", {
    locale: "fr",
  });
  expect(year(i)).toBe(1982);
  expect(month(i)).toBe(1);
  expect(day(i)).toBe(25);
});

test("fromFormat() does not match arbitrary stuff with those periods", () => {
  expect(() => fromFormat("janvQ 25 1982", "LLL dd yyyy", { locale: "fr" })).toThrow();
});

test("fromFormat() uses case-insensitive matching", () => {
  const i = fromFormat("Janv. 25 1982", "LLL dd yyyy", {
    locale: "fr",
  });
  expect(year(i)).toBe(1982);
  expect(month(i)).toBe(1);
  expect(day(i)).toBe(25);
});

test("fromFormat() parses offsets", () => {});

test("fromFormat() defaults weekday to this week", () => {
  const d = fromFormat("Monday", "EEEE");
  const dt = now();
  expect(weekYear(d)).toBe(weekYear(dt));
  expect(weekNumber(d)).toBe(weekNumber(dt));
  expect(weekday(d)).toBe(1);

  const d2 = fromFormat("3", "E");
  expect(weekYear(d2)).toBe(weekYear(dt));
  expect(weekNumber(d2)).toBe(weekNumber(dt));
  expect(weekday(d2)).toBe(3);
});

test("DateTime.fromFormat() parses ordinals", () => {
  let d = fromFormat("2016 200", "yyyy ooo");
  expect(year(d)).toBe(2016);
  expect(ordinal(d)).toBe(200);

  d = fromFormat("2016 200", "yyyy ooo");
  expect(year(d)).toBe(2016);
  expect(ordinal(d)).toBe(200);

  d = fromFormat("2016 016", "yyyy ooo");
  expect(year(d)).toBe(2016);
  expect(ordinal(d)).toBe(16);

  d = fromFormat("2016 200", "yyyy o");
  expect(year(d)).toBe(2016);
  expect(ordinal(d)).toBe(200);

  d = fromFormat("2016 16", "yyyy o");
  expect(year(d)).toBe(2016);
  expect(ordinal(d)).toBe(16);
});

// todo - consider doing this
// test("fromFormat() throws on mixed units", () => {
//   expect(() => { fromFormat("2017 34", "yyyy WW") }).toThrow();
//   expect(() => { fromFormat("2017 05 340", "yyyy MM ooo") }).toThrow();
// });

test("fromFormat() accepts weekYear by itself", () => {
  let d = fromFormat("2004", "kkkk");
  expect(weekYear(d)).toBe(2004);
  expect(weekNumber(d)).toBe(1);
  expect(weekday(d)).toBe(1);

  d = fromFormat("04", "kk");
  expect(weekYear(d)).toBe(2004);
  expect(weekNumber(d)).toBe(1);
  expect(weekday(d)).toBe(1);
});

test("fromFormat() accepts weekNumber by itself", () => {
  const n = now();

  let d = fromFormat("17", "WW");
  expect(weekYear(d)).toBe(weekYear(n));
  expect(weekNumber(d)).toBe(17);
  expect(weekday(d)).toBe(1);

  d = fromFormat("17", "W");
  expect(weekYear(d)).toBe(weekYear(n));
  expect(weekNumber(d)).toBe(17);
  expect(weekday(d)).toBe(1);
});

test("fromFormat() accepts weekYear/weekNumber/weekday", () => {
  const d = fromFormat("2004 17 2", "kkkk WW E");
  expect(weekYear(d)).toBe(2004);
  expect(weekNumber(d)).toBe(17);
  expect(weekday(d)).toBe(2);
});

test("fromFormat() allows regex content", () => {
  const d = fromFormat("Monday", "EEEE");
  const dt = now();
  expect(weekYear(d)).toBe(weekYear(dt));
  expect(weekNumber(d)).toBe(weekNumber(dt));
  expect(weekday(d)).toBe(1);
});

test("fromFormat() allows literals", () => {
  const dt = fromFormat("1982/05/25 hello 09:10:11.445", "yyyy/MM/dd [hello] HH:mm:ss.SSS");
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);
  expect(hour(dt)).toBe(9);
  expect(minute(dt)).toBe(10);
  expect(second(dt)).toBe(11);
  expect(millisecond(dt)).toBe(445);
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
  const dt = fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS", simpleParseOpts("Asia/Tokyo"));
  expect(zoneName(dt)).toBe("Asia/Tokyo");
  expect(offset(dt)).toBe(9 * 60);
  expect(year(dt)).toBe(1982);
  expect(month(dt)).toBe(5);
  expect(day(dt)).toBe(25);
  expect(hour(dt)).toBe(9);
  expect(minute(dt)).toBe(10);
  expect(second(dt)).toBe(11);
  expect(millisecond(dt)).toBe(445);
});

test("fromFormat() parses IANA zones", () => {
  let d = toUTC(fromFormat("1982/05/25 09:10:11.445 Asia/Tokyo", "yyyy/MM/dd HH:mm:ss.SSS z"));
  expect(offset(d)).toBe(0);
  expect(hour(d)).toBe(0);
  expect(minute(d)).toBe(10);

  d = toUTC(fromFormat("1982/05/25 09:10:11.445 UTC", "yyyy/MM/dd HH:mm:ss.SSS z"));
  expect(offset(d)).toBe(0);
  expect(hour(d)).toBe(9);
  expect(minute(d)).toBe(10);
});

test("fromFormat() with setZone parses IANA zones and sets it", () => {
  const d = fromFormat("1982/05/25 09:10:11.445 Asia/Tokyo", "yyyy/MM/dd HH:mm:ss.SSS z", {
    useTargetZoneFromInput: true,
  });
  expect(zoneName(d)).toBe("Asia/Tokyo");
  expect(offset(d)).toBe(9 * 60);
  expect(hour(d)).toBe(9);
  expect(minute(d)).toBe(10);
});

test.each([
  ["Z", "-4"],
  ["ZZ", "-4:00"],
  ["ZZZ", "-0400"],
])("fromFormat() uses %p to parse fixed offsets like %p", (format, example) => {
  const dt = fromFormat(`1982/05/25 09:10:11.445 ${example}`, `yyyy/MM/dd HH:mm:ss.SSS ${format}`);
  expect(hour(toUTC(dt))).toBe(13);
  expect(minute(toUTC(dt))).toBe(10);
});

test.each([
  ["Z", "-4"],
  ["ZZ", "-4:00"],
  ["ZZZ", "-0400"],
])("fromFormat() with setZone parses fixed offsets like %p and sets it", (format, example) => {
  const dt = fromFormat(`1982/05/25 09:10:11.445 ${example}`, `yyyy/MM/dd HH:mm:ss.SSS ${format}`, {
    useTargetZoneFromInput: true,
  });
  expect(offset(dt)).toBe(-4 * 60);
  expect(hour(toUTC(dt))).toBe(13);
  expect(minute(toUTC(dt))).toBe(10);
});

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
  expect(zoneName(dt)).toBe("Indian/Maldives");

  expect(() => fromFormat("2019-01-14T11-30[[Indian/Maldives]]", "yyyy-MM-dd[T]HH-mm\\[\\[z\\]\\]")).not.toThrow();
  expect(() => fromFormat("2019-01-14T11-30tIndian/Maldivest", "yyyy-MM-dd[T]HH-mm[t]z[t]")).not.toThrow();
  expect(() => fromFormat("2019-01-14T11-30\tIndian/Maldives\t", "yyyy-MM-dd[T]HH-mm[t]z[t]")).toThrow();
});

test("fromFormat prefers z over ZZ", () => {
  const ianaFormat = "yyyy-MM-dd[T]HH-mmZZ\\[z\\]";
  const dt = fromFormat("2019-01-14T11-30+1:00[Indian/Maldives]", ianaFormat, { useTargetZoneFromInput: true });
  expect(zoneName(dt)).toBe("Indian/Maldives");

  expect(() => fromFormat("2019-01-14T11-30[[Indian/Maldives]]", "yyyy-MM-dd[T]HH-mm\\[\\[z\\]\\]")).not.toThrow();
  expect(() => fromFormat("2019-01-14T11-30tIndian/Maldivest", "yyyy-MM-dd[T]HH-mm[t]z[t]")).not.toThrow();
  expect(() => fromFormat("2019-01-14T11-30\tIndian/Maldives\t", "yyyy-MM-dd[T]HH-mm[t]z[t]")).toThrow();
});

test("fromFormat() ignores numerical offsets when they conflict with the zone", () => {
  // +11:00 is not a valid offset for the Australia/Perth time zone
  const i = fromFormat("2021-11-12T09:07:13.000+11:00[Australia/Perth]", "yyyy-MM-dd[T]HH:mm:ss.SSSZZ\\[z\\]", {
    useTargetZoneFromInput: true,
  });
  expect(year(i)).toBe(2021);
  expect(month(i)).toBe(11);
  expect(day(i)).toBe(12);
  expect(hour(i)).toBe(9);
  expect(minute(i)).toBe(7);
  expect(second(i)).toBe(13);
  expect(millisecond(i)).toBe(0);
  expect(offset(i)).toBe(480); //+08:00
  expect(zoneName(i)).toBe("Australia/Perth");
});

test("fromFormat() ignores numerical offsets when they are are wrong right now", () => {
  // DST is not in effect at this timestamp, so +10:00 is the correct offset
  const i = fromFormat("2021-10-03T01:30:00.000+11:00[Australia/Sydney]", "yyyy-MM-dd[T]HH:mm:ss.SSSZZ\\[z\\]", {
    useTargetZoneFromInput: true,
  });
  expect(year(i)).toBe(2021);
  expect(month(i)).toBe(10);
  expect(day(i)).toBe(3);
  expect(hour(i)).toBe(1);
  expect(minute(i)).toBe(30);
  expect(second(i)).toBe(0);
  expect(millisecond(i)).toBe(0);
  expect(offset(i)).toBe(600); //+10:00
  expect(zoneName(i)).toBe("Australia/Sydney");
});

test("fromFormat() maintains offset that belongs to time zone during overlap", () => {
  // On this day, 02:30 exists for both offsets, due to DST ending.
  let i = fromFormat("2021-04-04T02:30:00.000+11:00[Australia/Sydney]", "yyyy-MM-dd[T]HH:mm:ss.SSSZZ\\[z\\]", {
    useTargetZoneFromInput: true,
  });
  expect(year(i)).toBe(2021);
  expect(month(i)).toBe(4);
  expect(day(i)).toBe(4);
  expect(hour(i)).toBe(2);
  expect(minute(i)).toBe(30);
  expect(second(i)).toBe(0);
  expect(millisecond(i)).toBe(0);
  expect(offset(i)).toBe(660); //+11:00
  expect(zoneName(i)).toBe("Australia/Sydney");

  i = fromFormat("2021-04-04T02:30:00.000+10:00[Australia/Sydney]", "yyyy-MM-dd[T]HH:mm:ss.SSSZZ\\[z\\]", {
    useTargetZoneFromInput: true,
  });
  expect(year(i)).toBe(2021);
  expect(month(i)).toBe(4);
  expect(day(i)).toBe(4);
  expect(hour(i)).toBe(2);
  expect(minute(i)).toBe(30);
  expect(second(i)).toBe(0);
  expect(millisecond(i)).toBe(0);
  expect(offset(i)).toBe(600); //+10:00
  expect(zoneName(i)).toBe("Australia/Sydney");
});
