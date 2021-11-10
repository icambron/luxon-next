import { fromGregorian, setGregorian } from "../../../src/dateTime/core";
import { setZone, toUTC } from "../../../src/dateTime/zone";
import { toFormat } from "../../../src/dateTime/format";
import { setISOWeek } from "../../../src/dateTime/isoWeek";
import { plus } from "../../../src/dateTime/math";

const dt = fromGregorian(
  {
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  },
  "utc"
);

const ny = dt |> setZone("America/New_York", { keepLocalTime: true });

test("toFormat accepts the locale options", () => {
  expect(dt |> toFormat("LLLL", "fr")).toBe("mai");
  expect(dt |> toFormat("LLLL", { locale: "fr" })).toBe("mai");
});

test("toFormat('u') returns fractional seconds", () => {
  expect(dt |> toFormat("u")).toBe("123");
  expect(dt |> setGregorian({ millisecond: 82 }) |> toFormat("u")).toBe("082");
  expect(dt |> setGregorian({ millisecond: 2 }) |> toFormat("u")).toBe("002");
  expect(dt |> setGregorian({ millisecond: 80 }) |> toFormat("u")).toBe("080"); // I think this is OK
});

test("toFormat('uu') returns fractional seconds as two digits", () => {
  expect(dt |> toFormat("uu")).toBe("12");
  expect(dt |> setGregorian({ millisecond: 82 }) |> toFormat("uu")).toBe("08");
  expect(dt |> setGregorian({ millisecond: 789 }) |> toFormat("uu")).toBe("78");
});

test("toFormat('uuu') returns fractional seconds as one digit", () => {
  expect(dt |> toFormat("uuu")).toBe("1");
  expect(dt |> setGregorian({ millisecond: 82 }) |> toFormat("uuu")).toBe("0");
  expect(dt |> setGregorian({ millisecond: 789 }) |> toFormat("uuu")).toBe("7");
});

test("toFormat('S') returns the millisecond", () => {
  expect(dt |> toFormat("S")).toBe("123");
  expect(dt |> toFormat("S", { locale: "bn" })).toBe("১২৩");
  expect(dt |> toFormat("S")).toBe("123");
  expect(dt |> setGregorian({ millisecond: 82 }) |> toFormat("S")).toBe("82");
});

test("toFormat('SSS') returns padded the millisecond", () => {
  expect(dt |> toFormat("SSS")).toBe("123");
  expect(dt |> toFormat("SSS", { locale: "bn" })).toBe("১২৩");
  expect(dt |> setGregorian({ millisecond: 82 }) |> toFormat("SSS")).toBe("082");
});

test("toFormat('s') returns the second", () => {
  expect(dt |> toFormat("s")).toBe("54");
  expect(dt |> toFormat("s", { locale: "bn" })).toBe("৫৪");
  expect(dt |> setGregorian({ second: 6 }) |> toFormat("s")).toBe("6");
});

test("toFormat('ss') returns the padded second", () => {
  expect(dt |> toFormat("ss")).toBe("54");
  expect(dt |> toFormat("ss", { locale: "bn" })).toBe("৫৪");
  expect(dt |> setGregorian({ second: 6 }) |> toFormat("ss")).toBe("06");
});

test("toFormat('m') returns the minute", () => {
  expect(dt |> toFormat("m")).toBe("23");
  expect(dt |> toFormat("m", { locale: "bn" })).toBe("২৩");
  expect(dt |> setGregorian({ minute: 6 }) |> toFormat("m")).toBe("6");
});

test("toFormat('mm') returns the padded minute", () => {
  expect(dt |> toFormat("mm")).toBe("23");
  expect(dt |> toFormat("mm", { locale: "bn" })).toBe("২৩");
  expect(dt |> setGregorian({ minute: 6 }) |> toFormat("mm")).toBe("06");
});

test("toFormat('h') returns the hours", () => {
  expect(dt |> toFormat("h")).toBe("9");
  expect(dt |> toFormat("h", { locale: "bn" })).toBe("৯");
  expect(dt |> setGregorian({ hour: 0 }) |> toFormat("h")).toBe("12");
  expect(dt |> setGregorian({ hour: 24 }) |> toFormat("h")).toBe("12");
  expect(dt |> setGregorian({ hour: 12 }) |> toFormat("h")).toBe("12");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("h")).toBe("1");
});

test("toFormat('hh') returns the padded hour (12-hour time)", () => {
  expect(dt |> toFormat("hh")).toBe("09");
  expect(dt |> toFormat("hh", { locale: "bn" })).toBe("০৯");
  expect(dt |> setGregorian({ hour: 0 }) |> toFormat("h")).toBe("12");
  expect(dt |> setGregorian({ hour: 24 }) |> toFormat("h")).toBe("12");
  expect(dt |> setGregorian({ hour: 12 }) |> toFormat("hh")).toBe("12");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("hh")).toBe("01");
});

test("toFormat('H') returns the hour (24-hour time)", () => {
  expect(dt |> toFormat("H")).toBe("9");
  expect(dt |> toFormat("H", { locale: "bn" })).toBe("৯");
  expect(dt |> setGregorian({ hour: 12 }) |> toFormat("H")).toBe("12");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("H")).toBe("13");
});
//
test("toFormat('HH') returns the padded hour (24-hour time)", () => {
  expect(dt |> toFormat("HH")).toBe("09");
  expect(dt |> toFormat("HH", { locale: "bn" })).toBe("০৯");
  expect(dt |> setGregorian({ hour: 12 }) |> toFormat("HH")).toBe("12");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("HH")).toBe("13");
});

test("toFormat('Z') returns the narrow offset", () => {
  expect(dt |> toUTC(360) |> toFormat("Z")).toBe("+6");
  expect(dt |> toUTC(390) |> toFormat("Z")).toBe("+6:30");
  expect(dt |> toUTC(-360) |> toFormat("Z")).toBe("-6");
  expect(dt |> toUTC(-390) |> toFormat("Z")).toBe("-6:30");
  expect(dt |> toUTC() |> toFormat("Z")).toBe("+0");
});

test("toFormat('ZZ') returns the padded offset", () => {
  expect(dt |> toUTC(360) |> toFormat("ZZ")).toBe("+06:00");
  expect(dt |> toUTC(390) |> toFormat("ZZ")).toBe("+06:30");
  expect(dt |> toUTC(-360) |> toFormat("ZZ")).toBe("-06:00");
  expect(dt |> toUTC(-390) |> toFormat("ZZ")).toBe("-06:30");
  expect(dt |> toUTC() |> toFormat("ZZ")).toBe("+00:00");
});

test("toFormat('ZZZ') returns a numerical offset", () => {
  expect(dt |> toUTC(360) |> toFormat("ZZZ")).toBe("+0600");
  expect(dt |> toUTC(390) |> toFormat("ZZZ")).toBe("+0630");
  expect(dt |> toUTC(-360) |> toFormat("ZZZ")).toBe("-0600");
  expect(dt |> toUTC(-390) |> toFormat("ZZZ")).toBe("-0630");
  expect(dt |> toUTC() |> toFormat("ZZZ")).toBe("+0000");
});

test("toFormat('ZZZZ') returns the short offset name", () => {
  const zoned = setZone("America/Los_Angeles")(dt);
  expect(zoned |> toFormat("ZZZZ")).toBe("PDT");
  expect(dt |> toUTC() |> toFormat("ZZZZ")).toBe("UTC");
});

test("toFormat('ZZZZZ') returns the full offset name", () => {
  const zoned = dt |> setZone("America/Los_Angeles");
  expect(zoned |> toFormat("ZZZZZ")).toBe("Pacific Daylight Time");
  expect(dt |> toUTC() |> toFormat("ZZZZZ")).toBe("Coordinated Universal Time");
});

test("toFormat('z') returns the zone name", () => {
  const zoned = dt |> setZone("America/Los_Angeles");
  expect(zoned |> toFormat("z")).toBe("America/Los_Angeles");

  const utc = dt |> toUTC();
  expect(utc |> toFormat("z")).toBe("UTC");
});

test("toFormat('a') returns the meridiem", () => {
  expect(dt |> toFormat("a")).toBe("AM");
  expect(dt |> toFormat("a", { locale: "my" })).toBe("နံနက်");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("a")).toBe("PM");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("a", { locale: "my" })).toBe("ညနေ");
});

test("toFormat('d') returns the day", () => {
  expect(dt |> toFormat("d")).toBe("25");
  expect(dt |> setGregorian({ day: 1 }) |> toFormat("d")).toBe("1");
});

test("toFormat('dd') returns the padded day", () => {
  expect(dt |> toFormat("dd")).toBe("25");
  expect(dt |> setGregorian({ day: 1 }) |> toFormat("dd")).toBe("01");
});

test("toFormat('E' || 'c') returns weekday number", () => {
  expect(dt |> toFormat("E")).toBe("2");
  expect(dt |> toFormat("c")).toBe("2");
});

test("toFormat('EEE') returns short format weekday name", () => {
  expect(dt |> toFormat("EEE")).toBe("Tue");
  expect(dt |> toFormat("EEE", { locale: "de" })).toBe("Di.");
});

test("toFormat('ccc') returns short standalone weekday name", () => {
  expect(dt |> toFormat("ccc")).toBe("Tue");
  expect(dt |> toFormat("ccc", { locale: "de" })).toBe("Di");
});

test("toFormat('EEEE') returns the full format weekday name", () => {
  expect(dt |> toFormat("EEEE")).toBe("Tuesday");
});

test("toFormat('cccc') returns the full standalone weekday name", () => {
  expect(dt |> toFormat("cccc")).toBe("Tuesday");
});

test("toFormat('EEEEE' || 'ccccc') returns narrow weekday name", () => {
  expect(dt |> toFormat("EEEEE")).toBe("T");
  expect(dt |> toFormat("ccccc")).toBe("T");
});

test("toFormat('M' || 'L') return the month number", () => {
  expect(dt |> toFormat("M")).toBe("5");
  expect(dt |> toFormat("L")).toBe("5");
});

test("toFormat('MM' || 'LL') return the padded month number", () => {
  expect(dt |> toFormat("MM")).toBe("05");
});

test("toFormat('MMM') returns the short format month name", () => {
  expect(dt |> toFormat("MMM")).toBe("May");
  expect(dt |> toFormat("MMM", { locale: "de"})).toBe("Mai");
  expect(dt |> setGregorian({ month: 8 }) |> toFormat("MMM")).toBe("Aug");
});

test("toFormat('LLL') returns the short standalone month name", () => {
  expect(dt |> toFormat("LLL")).toBe("May");
  expect(dt |> toFormat("LLL", { locale: "de" })).toBe("Mai");
  expect(dt |> setGregorian({ month: 8 }) |> toFormat("LLL")).toBe("Aug");
});

test("toFormat('MMMM') returns the full format month name", () => {
  expect(dt |> toFormat("MMMM")).toBe("May");
  expect(dt |> setGregorian({ month: 8 }) |> toFormat("MMMM")).toBe("August");
  expect(dt |> setGregorian({ month: 8 }) |> toFormat("MMMM", { locale: "ru" })).toBe("августа");
});

test("toFormat('LLLL') returns the full standalone month name", () => {
  expect(dt |> toFormat("LLLL")).toBe("May");
  expect(dt |> setGregorian({ month: 8 }) |> toFormat("LLLL")).toBe("August");
});

test("toFormat('MMMMM' || 'LLLLL') returns the narrow month name", () => {
  expect(dt |> toFormat("MMMMM")).toBe("M");
  expect(dt |> toFormat("LLLLL")).toBe("M");
});

test("toFormat('y') returns the full year", () => {
  expect(dt |> toFormat("y")).toBe("1982");
  expect(dt |> toFormat("y", { locale: "bn" })).toBe("১৯৮২");
  expect(dt |> setGregorian({ year: 3 }) |> toFormat("y")).toBe("3");
});

test("toFormat('yy') returns the two-digit year", () => {
  expect(dt |> toFormat("yy")).toBe("82");
  expect(dt |> toFormat("yy", { locale: "bn" })).toBe("৮২");
  expect(dt |> setGregorian({ year: 3 }) |> toFormat("yy")).toBe("03");
});

test("toFormat('yyyy') returns the padded full year", () => {
  expect(dt |> toFormat("yyyy")).toBe("1982");
  expect(dt |> toFormat("yyyy", { locale: "bn" })).toBe("১৯৮২");
  expect(dt |> setGregorian({ year: 3 }) |> toFormat("yyyy")).toBe("0003");
  expect(dt |> setGregorian({ year: 3 }) |> toFormat("yyyy", { locale: "bn" })).toBe("০০০৩");
});

test("toFormat('yyyy') returns the padded full year", () => {
  const bigDt = fromGregorian({ year: 36000 });
  expect(bigDt |> toFormat("yyyy")).toBe("36000");

  const lilDt = fromGregorian({ year: 17 });
  expect(lilDt |> toFormat("yyyy")).toBe("0017");
});

test("toFormat('yyyyyy') returns the padded extended year", () => {
  const hugeDt = fromGregorian({ year: 136000 });
  expect(hugeDt |> toFormat("yyyyyy")).toBe("136000");

  const bigDt = fromGregorian({ year: 36000 });
  expect(bigDt |> toFormat("yyyyyy")).toBe("036000");

  expect(dt |> toFormat("yyyyyy")).toBe("001982");

  const lilDt = fromGregorian({ year: 17 });
  expect(lilDt |> toFormat("yyyyyy")).toBe("000017");
});

test("toFormat('G') returns the short era", () => {
  expect(dt |> toFormat("G")).toBe("AD");
  expect(dt |> toFormat("G", { locale: "de" })).toBe("n. Chr.");
  expect(dt |> setGregorian({ year: -21 }) |> toFormat("G")).toBe("BC");
  expect(dt |> setGregorian({ year: -21 }) |> toFormat("G", { locale: "de" })).toBe("v. Chr.");
});

test("toFormat('GG') returns the full era", () => {
  expect(dt |> toFormat("GG")).toBe("Anno Domini");
  expect(dt |> setGregorian({ year: -21 }) |> toFormat("GG")).toBe("Before Christ");
});

test("toFormat('GGGGG') returns the narrow era", () => {
  expect(dt |> toFormat("GGGGG")).toBe("A");
  expect(dt |> setGregorian({ year: -21 }) |> toFormat("GGGGG")).toBe("B");
});

test("toFormat('W') returns the week number", () => {
  expect(dt |> toFormat("W")).toBe("21");
  expect(dt |> setISOWeek({ weekNumber: 5 }) |> toFormat("W")).toBe("5");
});

test("toFormat('WW') returns the padded week number", () => {
  expect(dt |> toFormat("WW")).toBe("21");
  expect(dt |> setISOWeek({ weekNumber: 5 }) |> toFormat("WW")).toBe("05");
});

test("toFormat('kk') returns the abbreviated week year", () => {
  expect(dt |> toFormat("kk")).toBe("82");
});

test("toFormat('kkkk') returns the full week year", () => {
  expect(dt |> toFormat("kkkk")).toBe("1982");
});

test("toFormat('o') returns an unpadded ordinal", () => {
  expect(dt |> toFormat("o")).toBe("145");
  expect(dt |> setGregorian({ month: 1, day: 13 }) |> toFormat("o")).toBe("13");
  expect(dt |> setGregorian({ month: 1, day: 8 }) |> toFormat("o")).toBe("8");
});

test("toFormat('ooo') returns an unpadded ordinal", () => {
  expect(dt |> toFormat("ooo")).toBe("145");
  expect(dt |> setGregorian({ month: 1, day: 13 }) |> toFormat("ooo")).toBe("013");
  expect(dt |> setGregorian({ month: 1, day: 8 }) |> toFormat("ooo")).toBe("008");
});

test("toFormat('q') returns an unpadded quarter", () => {
  expect(dt |> toFormat("q")).toBe("2");
  expect(dt |> setGregorian({ month: 2 }) |> toFormat("q")).toBe("1");
});

test("toFormat('qq') returns a padded quarter", () => {
  expect(dt |> toFormat("qq")).toBe("02");
  expect(dt |> setGregorian({ month: 2 }) |> toFormat("qq")).toBe("01");
});

 test("toFormat('D') returns a short date representation", () => {
   expect(dt |> toFormat("D")).toBe("5/25/1982");
   expect(dt |> toFormat("D", { locale: "fr" })).toBe("25/05/1982");
 });

 test("toFormat('DD') returns a medium date representation", () => {
   expect(dt |> toFormat("DD")).toBe("May 25, 1982");
   expect(dt |> setGregorian({ month: 8 }) |> toFormat("DD")).toBe("Aug 25, 1982");
   expect(dt |> toFormat("DD", { locale: "fr" })).toBe("25 mai 1982");
   expect(dt |> setGregorian({ month: 2 }) |> toFormat("DD", { locale: "fr" })).toBe("25 févr. 1982");
 });

 test("toFormat('DDD') returns a long date representation", () => {
   expect(dt |> toFormat("DDD")).toBe("May 25, 1982");
   expect(dt |> setGregorian({ month: 8 }) |> toFormat("DDD")).toBe("August 25, 1982");
   expect(dt |> toFormat("DDD", { locale: "fr" })).toBe("25 mai 1982");
   expect(dt |> setGregorian({ month: 2 }) |> toFormat("DDD", { locale: "fr" })).toBe(
     "25 février 1982"
   );
 });

 test("toFormat('DDDD') returns a long date representation", () => {
   expect(dt |> toFormat("DDDD")).toBe("Tuesday, May 25, 1982");
   expect(dt |> setGregorian({ month: 8 }) |> toFormat("DDDD")).toBe("Wednesday, August 25, 1982");
   expect(dt |> toFormat("DDDD", { locale: "fr" })).toBe("mardi 25 mai 1982");
   expect(dt |> setGregorian({ month: 2 }) |> toFormat("DDDD", { locale: "fr" })).toBe(
     "jeudi 25 février 1982"
   );
 });

 test("toFormat('t') returns a short time representation", () => {
   expect(dt |> toFormat("t")).toBe("9:23 AM");
   expect(dt |> setGregorian({ hour: 13 }) |> toFormat("t")).toBe("1:23 PM");
   expect(dt |> toFormat("t", { locale: "fr" })).toBe("09:23");
   expect(dt |> setGregorian({ hour: 13 }) |> toFormat("t", { locale: "fr" })).toBe("13:23");
 });

 test("toFormat('T') returns a short 24-hour time representation", () => {
   expect(dt |> toFormat("T")).toBe("09:23");
   expect(dt |> setGregorian({ hour: 13 }) |> toFormat("T")).toBe("13:23");
   expect(dt |> toFormat("T", { locale: "fr" })).toBe("09:23");
   expect(dt |> setGregorian({ hour: 13 }) |> toFormat("T", { locale: "fr" })).toBe("13:23");
 });

 test("toFormat('tt') returns a medium time representation", () => {
   expect(dt |> toFormat("tt")).toBe("9:23:54 AM");
   expect(dt |> setGregorian({ hour: 13 }) |> toFormat("tt")).toBe("1:23:54 PM");
   expect(dt |> toFormat("tt", { locale: "fr" })).toBe("09:23:54");
   expect(dt |> setGregorian({ hour: 13 }) |> toFormat("tt", { locale: "fr" })).toBe("13:23:54");
 });

test("toFormat('TT') returns a medium 24-hour time representation", () => {
  expect(dt |> toFormat("TT")).toBe("09:23:54");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("TT")).toBe("13:23:54");
  expect(dt |> toFormat("TT", { locale: "fr" })).toBe("09:23:54");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("TT", { locale: "fr" })).toBe("13:23:54");
});

test("toFormat('ttt') returns a medium time representation", () => {
  // these seem to fail on Travis
  expect(dt |> toFormat('ttt')).toBe('9:23:54 AM UTC');
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat('ttt')).toBe('1:23:54 PM UTC');
  expect(dt |> toFormat('ttt', { locale: 'fr' })).toBe('9:23:54 UTC');
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat('ttt', { locale: 'fr' })).toBe('13:23:54 UTC');
});

test("toFormat('TTT') returns a medium time representation", () => {
  // these seem to fail on Travis
  expect(dt |> toFormat('TTT')).toBe('09:23:54 UTC');
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat('TTT')).toBe('13:23:54 UTC');
  expect(dt |> toFormat('TTT', {locale: 'fr' })).toBe('9:23:54 UTC');
  expect(dt |> setGregorian({hour: 13 }) |> toFormat('TTT', { locale: 'fr' })).toBe('13:23:54 UTC');
});

test("toFormat('f') returns a short date/time representation without seconds", () => {
  expect(dt |> toFormat("f")).toBe("5/25/1982, 9:23 AM");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("f")).toBe("5/25/1982, 1:23 PM");
  expect(dt |> toFormat("f", { locale: "fr" })).toBe("25/05/1982, 09:23");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("f", { locale: "fr" })).toBe(
    "25/05/1982, 13:23"
  );
});

test("toFormat('ff') returns a medium date/time representation without seconds", () => {
  expect(dt |> toFormat("ff")).toBe("May 25, 1982, 9:23 AM");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("ff")).toBe("May 25, 1982, 1:23 PM");
  expect(dt |> setGregorian({ month: 8 }) |> toFormat("ff")).toBe("Aug 25, 1982, 9:23 AM");
  expect(dt |> toFormat("ff", { locale: "fr" })).toBe("25 mai 1982, 09:23");
  expect(dt |> setGregorian({ month: 2 }) |> toFormat("ff", { locale: "fr" })).toBe(
    "25 févr. 1982, 09:23"
  );
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("ff", { locale: "fr" })).toBe(
    "25 mai 1982, 13:23"
  );
});

test("toFormat('fff') returns a medium date/time representation without seconds", () => {
  expect(ny |> toFormat("fff")).toBe("May 25, 1982, 9:23 AM EDT");
  expect(ny |> setGregorian({ hour: 13 }) |> toFormat("fff")).toBe("May 25, 1982, 1:23 PM EDT");
  expect(ny |> setGregorian({ month: 8 }) |> toFormat("fff")).toBe("August 25, 1982, 9:23 AM EDT");
  expect(ny |> toFormat("fff", { locale: "fr" })).toBe("25 mai 1982, 09:23 UTC−4");
  expect(ny |> setGregorian({ month: 2 }) |> toFormat("fff", { locale: "fr" })).toBe(
    "25 février 1982, 09:23 UTC−5"
  );
  expect(ny |>  setGregorian({ hour: 13 }) |> toFormat("fff", { locale: "fr" })).toBe(
    "25 mai 1982, 13:23 UTC−4"
  );
});

test("toFormat('ffff') returns a long date/time representation without seconds", () => {
  expect(ny |> toFormat("ffff")).toBe("Tuesday, May 25, 1982, 9:23 AM Eastern Daylight Time");
  expect(ny |> setGregorian({ hour: 13 }) |> toFormat("ffff")).toBe(
    "Tuesday, May 25, 1982, 1:23 PM Eastern Daylight Time"
  );
  expect(ny |> setGregorian({ month: 2 }) |> toFormat("ffff")).toBe(
    "Thursday, February 25, 1982, 9:23 AM Eastern Standard Time"
  );
  expect(ny |> toFormat("ffff", { locale: "fr" })).toBe(
    "mardi 25 mai 1982, 09:23 heure d’été de l’Est"
  );
  expect(ny |> setGregorian({ month: 2 }) |> toFormat("ffff", { locale: "fr" })).toBe(
    "jeudi 25 février 1982, 09:23 heure normale de l’Est nord-américain"
  );
  expect(ny |> setGregorian({ hour: 13 }) |> toFormat("ffff", { locale: "fr" })).toBe(
    "mardi 25 mai 1982, 13:23 heure d’été de l’Est"
  );
});

test("toFormat('F') returns a short date/time representation with seconds", () => {
  expect(dt |> toFormat("F")).toBe("5/25/1982, 9:23:54 AM");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("F")).toBe("5/25/1982, 1:23:54 PM");
  expect(dt |> toFormat("F", { locale: "fr" })).toBe("25/05/1982, 09:23:54");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("F", { locale: "fr" })).toBe(
    "25/05/1982, 13:23:54"
  );
});

test("toFormat('FF') returns a medium date/time representation with seconds", () => {
  expect(dt |> toFormat("FF")).toBe("May 25, 1982, 9:23:54 AM");
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("FF")).toBe("May 25, 1982, 1:23:54 PM");
  expect(dt |> setGregorian({ month: 8 }) |> toFormat("FF")).toBe("Aug 25, 1982, 9:23:54 AM");
  expect(dt |> toFormat("FF", { locale: "fr" })).toBe("25 mai 1982, 09:23:54");
  expect(dt |> setGregorian({ month: 2 }) |> toFormat("FF", { locale: "fr" })).toBe(
    "25 févr. 1982, 09:23:54"
  );
  expect(dt |> setGregorian({ hour: 13 }) |> toFormat("FF", { locale: "fr" })).toBe(
    "25 mai 1982, 13:23:54"
  );
});

test("toFormat('FFF') returns a medium date/time representation without seconds", () => {
  expect(ny |> toFormat("FFF")).toBe("May 25, 1982, 9:23:54 AM EDT");
  expect(ny |> setGregorian({ hour: 13 }) |> toFormat("FFF")).toBe("May 25, 1982, 1:23:54 PM EDT");
  expect(ny |> setGregorian({ month: 8 }) |> toFormat("FFF")).toBe("August 25, 1982, 9:23:54 AM EDT");
  expect(ny |> toFormat("FFF", { locale: "fr" })).toBe("25 mai 1982, 9:23:54 UTC−4");
  expect(ny |> setGregorian({ month: 2 }) |> toFormat("FFF", { locale: "fr" })).toBe(
    "25 février 1982, 9:23:54 UTC−5"
  );
  expect(ny |> setGregorian({ hour: 13 }) |> toFormat("FFF", { locale: "fr" })).toBe(
    "25 mai 1982, 13:23:54 UTC−4"
  );
});

test("toFormat('FFFF') returns a long date/time representation without seconds", () => {
  expect(ny |> toFormat("FFFF")).toBe("Tuesday, May 25, 1982, 9:23:54 AM Eastern Daylight Time");
  expect(ny |> setGregorian({ hour: 13 }) |> toFormat("FFFF")).toBe(
    "Tuesday, May 25, 1982, 1:23:54 PM Eastern Daylight Time"
  );
  expect(ny |> setGregorian({ month: 2 }) |> toFormat("FFFF")).toBe(
    "Thursday, February 25, 1982, 9:23:54 AM Eastern Standard Time"
  );
  expect(ny |> toFormat("FFFF", { locale: "fr" })).toBe(
    "mardi 25 mai 1982, 9:23:54 heure d’été de l’Est"
  );
  expect(ny |> setGregorian({ month: 2 }) |> toFormat("FFFF", { locale: "fr" })).toBe(
    "jeudi 25 février 1982, 9:23:54 heure normale de l’Est nord-américain"
  );
  expect(ny |> setGregorian({ hour: 13 }) |> toFormat("FFFF", { locale: "fr" })).toBe(
    "mardi 25 mai 1982, 13:23:54 heure d’été de l’Est"
  );
});

test("toFormat returns a full formatted string", () => {
  expect(dt |> toFormat("MM/yyyy GG")).toBe("05/1982 Anno Domini");
});

test("toFormat() accepts literals in brackets", () => {
  expect(dt |> toFormat("dd/MM/yyyy [at] hh:mm")).toBe("25/05/1982 at 09:23");
  expect(dt |> toFormat("MMdd[T]hh")).toBe("0525T09");
});

test("toFormat() uses the numbering system", () => {
  expect(dt |> toFormat("S", { numberingSystem: "beng" })).toBe("১২৩");
  expect(dt |> toFormat("S", { numberingSystem: "beng" })).toBe("১২৩");
});

test("toFormat() uses the output calendar", () => {
  expect(dt |> toFormat("MMMM yyyy", { calendar: "islamic" })).toBe("Shaʻban 1402");
  expect(dt |> toFormat("MMMM yyyy", { calendar: "islamic" })).toBe("Shaʻban 1402");
  expect(dt |> toFormat("MMMM yyyy", "ar-YE", { calendar: "islamic" })).toBe("شعبان ١٤٠٢");
});

test("toFormat('X') returns a Unix timestamp in seconds", () => {
  expect(dt |> toFormat("X")).toBe("391166634");
});

test("toFormat('X') rounds down", () => {
  expect(dt |> plus({ milliseconds: 500 }) |> toFormat("X")).toBe("391166634");
});

test("toFormat('x') returns a Unix timestamp in milliseconds", () => {
  expect(dt |> toFormat("x")).toBe("391166634123");
});
