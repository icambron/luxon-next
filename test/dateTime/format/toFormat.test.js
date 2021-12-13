import {
  fromGregorian,
  setGregorian,
  setZone,
  toFixedOffset,
  toUTC,
  toFormat,
  setISOWeek,
  plus,
} from "../../../src/luxon";

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

const ny = setZone(dt, "America/New_York", { keepLocalTime: true });

test("toFormat accepts the locale options", () => {
  expect(toFormat(dt, "LLLL", "fr")).toBe("mai");
  expect(toFormat(dt, "LLLL", { locale: "fr" })).toBe("mai");
});

test("toFormat('u') returns fractional seconds", () => {
  expect(toFormat(dt, "u")).toBe("123");
  expect(toFormat(setGregorian(dt, { millisecond: 82 }), "u")).toBe("082");
  expect(toFormat(setGregorian(dt, { millisecond: 2 }), "u")).toBe("002");
  expect(toFormat(setGregorian(dt, { millisecond: 80 }), "u")).toBe("080"); // I think this is OK
});

test("toFormat('uu') returns fractional seconds as two digits", () => {
  expect(toFormat(dt, "uu")).toBe("12");
  expect(toFormat(setGregorian(dt, { millisecond: 82 }), "uu")).toBe("08");
  expect(toFormat(setGregorian(dt, { millisecond: 789 }), "uu")).toBe("78");
});

test("toFormat('uuu') returns fractional seconds as one digit", () => {
  expect(toFormat(dt, "uuu")).toBe("1");
  expect(toFormat(setGregorian(dt, { millisecond: 82 }), "uuu")).toBe("0");
  expect(toFormat(setGregorian(dt, { millisecond: 789 }), "uuu")).toBe("7");
});

test("toFormat('S') returns the millisecond", () => {
  expect(toFormat(dt, "S")).toBe("123");
  expect(toFormat(dt, "S", { locale: "bn" })).toBe("১২৩");
  expect(toFormat(dt, "S")).toBe("123");
  expect(toFormat(setGregorian(dt, { millisecond: 82 }), "S")).toBe("82");
});

test("toFormat('SSS') returns padded the millisecond", () => {
  expect(toFormat(dt, "SSS")).toBe("123");
  expect(toFormat(dt, "SSS", { locale: "bn" })).toBe("১২৩");
  expect(toFormat(setGregorian(dt, { millisecond: 82 }), "SSS")).toBe("082");
});

test("toFormat('s') returns the second", () => {
  expect(toFormat(dt, "s")).toBe("54");
  expect(toFormat(dt, "s", { locale: "bn" })).toBe("৫৪");
  expect(toFormat(setGregorian(dt, { second: 6 }), "s")).toBe("6");
});

test("toFormat('ss') returns the padded second", () => {
  expect(toFormat(dt, "ss")).toBe("54");
  expect(toFormat(dt, "ss", { locale: "bn" })).toBe("৫৪");
  expect(toFormat(setGregorian(dt, { second: 6 }), "ss")).toBe("06");
});

test("toFormat('m') returns the minute", () => {
  expect(toFormat(dt, "m")).toBe("23");
  expect(toFormat(dt, "m", { locale: "bn" })).toBe("২৩");
  expect(toFormat(setGregorian(dt, { minute: 6 }), "m")).toBe("6");
});

test("toFormat('mm') returns the padded minute", () => {
  expect(toFormat(dt, "mm")).toBe("23");
  expect(toFormat(dt, "mm", { locale: "bn" })).toBe("২৩");
  expect(toFormat(setGregorian(dt, { minute: 6 }), "mm")).toBe("06");
});

test("toFormat('h') returns the hours", () => {
  expect(toFormat(dt, "h")).toBe("9");
  expect(toFormat(dt, "h", { locale: "bn" })).toBe("৯");
  expect(toFormat(setGregorian(dt, { hour: 0 }), "h")).toBe("12");
  expect(toFormat(setGregorian(dt, { hour: 24 }), "h")).toBe("12");
  expect(toFormat(setGregorian(dt, { hour: 12 }), "h")).toBe("12");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "h")).toBe("1");
});

test("toFormat('hh') returns the padded hour (12-hour time)", () => {
  expect(toFormat(dt, "hh")).toBe("09");
  expect(toFormat(dt, "hh", { locale: "bn" })).toBe("০৯");
  expect(toFormat(setGregorian(dt, { hour: 0 }), "h")).toBe("12");
  expect(toFormat(setGregorian(dt, { hour: 24 }), "h")).toBe("12");
  expect(toFormat(setGregorian(dt, { hour: 12 }), "hh")).toBe("12");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "hh")).toBe("01");
});

test("toFormat('H') returns the hour (24-hour time)", () => {
  expect(toFormat(dt, "H")).toBe("9");
  expect(toFormat(dt, "H", { locale: "bn" })).toBe("৯");
  expect(toFormat(setGregorian(dt, { hour: 12 }), "H")).toBe("12");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "H")).toBe("13");
});
//
test("toFormat('HH') returns the padded hour (24-hour time)", () => {
  expect(toFormat(dt, "HH")).toBe("09");
  expect(toFormat(dt, "HH", { locale: "bn" })).toBe("০৯");
  expect(toFormat(setGregorian(dt, { hour: 12 }), "HH")).toBe("12");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "HH")).toBe("13");
});

test("toFormat('Z') returns the narrow offset", () => {
  expect(toFormat(toFixedOffset(dt, 360), "Z")).toBe("+6");
  expect(toFormat(toFixedOffset(dt, 390), "Z")).toBe("+6:30");
  expect(toFormat(toFixedOffset(dt, -360), "Z")).toBe("-6");
  expect(toFormat(toFixedOffset(dt, -390), "Z")).toBe("-6:30");
  expect(toFormat(toUTC(dt), "Z")).toBe("+0");
});

test("toFormat('ZZ') returns the padded offset", () => {
  expect(toFormat(toFixedOffset(dt, 360), "ZZ")).toBe("+06:00");
  expect(toFormat(toFixedOffset(dt, 390), "ZZ")).toBe("+06:30");
  expect(toFormat(toFixedOffset(dt, -360), "ZZ")).toBe("-06:00");
  expect(toFormat(toFixedOffset(dt, -390), "ZZ")).toBe("-06:30");
  expect(toFormat(toUTC(dt), "ZZ")).toBe("+00:00");
});

test("toFormat('ZZZ') returns a numerical offset", () => {
  expect(toFormat(toFixedOffset(dt, 360), "ZZZ")).toBe("+0600");
  expect(toFormat(toFixedOffset(dt, 390), "ZZZ")).toBe("+0630");
  expect(toFormat(toFixedOffset(dt, -360), "ZZZ")).toBe("-0600");
  expect(toFormat(toFixedOffset(dt, -390), "ZZZ")).toBe("-0630");
  expect(toFormat(toUTC(dt), "ZZZ")).toBe("+0000");
});

test("toFormat('ZZZZ') returns the short offset name", () => {
  expect(toFormat(setZone(dt, "America/Los_Angeles"), "ZZZZ")).toBe("PDT");
  expect(toFormat(toUTC(dt), "ZZZZ")).toBe("UTC");
});

test("toFormat('ZZZZZ') returns the full offset name", () => {
  const zoned = setZone(dt, "America/Los_Angeles");
  expect(toFormat(zoned, "ZZZZZ")).toBe("Pacific Daylight Time");
  expect(toFormat(toUTC(zoned), "ZZZZZ")).toBe("Coordinated Universal Time");
});

test("toFormat('z') returns the zone name", () => {
  const zoned = setZone(dt, "America/Los_Angeles");
  expect(toFormat(zoned, "z")).toBe("America/Los_Angeles");

  const utc = toUTC(dt);
  expect(toFormat(utc, "z")).toBe("UTC");
});

test("toFormat('a') returns the meridiem", () => {
  expect(toFormat(dt, "a")).toBe("AM");
  expect(toFormat(dt, "a", { locale: "my" })).toBe("နံနက်");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "a")).toBe("PM");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "a", { locale: "my" })).toBe("ညနေ");
});

test("toFormat('d') returns the day", () => {
  expect(toFormat(dt, "d")).toBe("25");
  expect(toFormat(setGregorian(dt, { day: 1 }), "d")).toBe("1");
});

test("toFormat('dd') returns the padded day", () => {
  expect(toFormat(dt, "dd")).toBe("25");
  expect(toFormat(setGregorian(dt, { day: 1 }), "dd")).toBe("01");
});

test("toFormat('E' || 'c') returns weekday number", () => {
  expect(toFormat(dt, "E")).toBe("2");
  expect(toFormat(dt, "c")).toBe("2");
});

test("toFormat('EEE') returns short format weekday name", () => {
  expect(toFormat(dt, "EEE")).toBe("Tue");
  expect(toFormat(dt, "EEE", { locale: "de" })).toBe("Di.");
});

test("toFormat('ccc') returns short standalone weekday name", () => {
  expect(toFormat(dt, "ccc")).toBe("Tue");
  expect(toFormat(dt, "ccc", { locale: "de" })).toBe("Di");
});

test("toFormat('EEEE') returns the full format weekday name", () => {
  expect(toFormat(dt, "EEEE")).toBe("Tuesday");
});

test("toFormat('cccc') returns the full standalone weekday name", () => {
  expect(toFormat(dt, "cccc")).toBe("Tuesday");
});

test("toFormat('EEEEE' || 'ccccc') returns narrow weekday name", () => {
  expect(toFormat(dt, "EEEEE")).toBe("T");
  expect(toFormat(dt, "ccccc")).toBe("T");
});

test("toFormat('M' || 'L') return the month number", () => {
  expect(toFormat(dt, "M")).toBe("5");
  expect(toFormat(dt, "L")).toBe("5");
});

test("toFormat('MM' || 'LL') return the padded month number", () => {
  expect(toFormat(dt, "MM")).toBe("05");
});

test("toFormat('MMM') returns the short format month name", () => {
  expect(toFormat(dt, "MMM")).toBe("May");
  expect(toFormat(dt, "MMM", { locale: "de" })).toBe("Mai");
  expect(toFormat(setGregorian(dt, { month: 8 }), "MMM")).toBe("Aug");
});

test("toFormat('LLL') returns the short standalone month name", () => {
  expect(toFormat(dt, "LLL")).toBe("May");
  expect(toFormat(dt, "LLL", { locale: "de" })).toBe("Mai");
  expect(toFormat(setGregorian(dt, { month: 8 }), "LLL")).toBe("Aug");
});

test("toFormat('MMMM') returns the full format month name", () => {
  expect(toFormat(dt, "MMMM")).toBe("May");
  expect(toFormat(setGregorian(dt, { month: 8 }), "MMMM")).toBe("August");
  expect(toFormat(setGregorian(dt, { month: 8 }), "MMMM", { locale: "ru" })).toBe("августа");
});

test("toFormat('LLLL') returns the full standalone month name", () => {
  expect(toFormat(dt, "LLLL")).toBe("May");
  expect(toFormat(setGregorian(dt, { month: 8 }), "LLLL")).toBe("August");
});

test("toFormat('MMMMM' || 'LLLLL') returns the narrow month name", () => {
  expect(toFormat(dt, "MMMMM")).toBe("M");
  expect(toFormat(dt, "LLLLL")).toBe("M");
});

test("toFormat('y') returns the full year", () => {
  expect(toFormat(dt, "y")).toBe("1982");
  expect(toFormat(dt, "y", { locale: "bn" })).toBe("১৯৮২");
  expect(toFormat(setGregorian(dt, { year: 3 }), "y")).toBe("3");
});

test("toFormat('yy') returns the two-digit year", () => {
  expect(toFormat(dt, "yy")).toBe("82");
  expect(toFormat(dt, "yy", { locale: "bn" })).toBe("৮২");
  expect(toFormat(setGregorian(dt, { year: 3 }), "yy")).toBe("03");
});

test("toFormat('yyyy') returns the padded full year", () => {
  expect(toFormat(dt, "yyyy")).toBe("1982");
  expect(toFormat(dt, "yyyy", { locale: "bn" })).toBe("১৯৮২");
  expect(toFormat(setGregorian(dt, { year: 3 }), "yyyy")).toBe("0003");
  expect(toFormat(setGregorian(dt, { year: 3 }), "yyyy", { locale: "bn" })).toBe("০০০৩");
});

test("toFormat('yyyy') returns the padded full year", () => {
  const bigDt = fromGregorian({ year: 36000 });
  expect(toFormat(bigDt, "yyyy")).toBe("36000");

  const lilDt = fromGregorian({ year: 17 });
  expect(toFormat(lilDt, "yyyy")).toBe("0017");
});

test("toFormat('yyyyyy') returns the padded extended year", () => {
  const hugeDt = fromGregorian({ year: 136000 });
  expect(toFormat(hugeDt, "yyyyyy")).toBe("136000");

  const bigDt = fromGregorian({ year: 36000 });
  expect(toFormat(bigDt, "yyyyyy")).toBe("036000");

  expect(toFormat(dt, "yyyyyy")).toBe("001982");

  const lilDt = fromGregorian({ year: 17 });
  expect(toFormat(lilDt, "yyyyyy")).toBe("000017");
});

test("toFormat('G') returns the short era", () => {
  expect(toFormat(dt, "G")).toBe("AD");
  expect(toFormat(dt, "G", { locale: "de" })).toBe("n. Chr.");
  expect(toFormat(setGregorian(dt, { year: -21 }), "G")).toBe("BC");
  expect(toFormat(setGregorian(dt, { year: -21 }), "G", { locale: "de" })).toBe("v. Chr.");
});

test("toFormat('GG') returns the full era", () => {
  expect(toFormat(dt, "GG")).toBe("Anno Domini");
  expect(toFormat(setGregorian(dt, { year: -21 }), "GG")).toBe("Before Christ");
});

test("toFormat('GGGGG') returns the narrow era", () => {
  expect(toFormat(dt, "GGGGG")).toBe("A");
  expect(toFormat(setGregorian(dt, { year: -21 }), "GGGGG")).toBe("B");
});

test("toFormat('W') returns the week number", () => {
  expect(toFormat(dt, "W")).toBe("21");
  expect(toFormat(setISOWeek(dt, { weekNumber: 5 }), "W")).toBe("5");
});

test("toFormat('WW') returns the padded week number", () => {
  expect(toFormat(dt, "WW")).toBe("21");
  expect(toFormat(setISOWeek(dt, { weekNumber: 5 }), "WW")).toBe("05");
});

test("toFormat('kk') returns the abbreviated week year", () => {
  expect(toFormat(dt, "kk")).toBe("82");
});

test("toFormat('kkkk') returns the full week year", () => {
  expect(toFormat(dt, "kkkk")).toBe("1982");
});

test("toFormat('o') returns an unpadded ordinal", () => {
  expect(toFormat(dt, "o")).toBe("145");
  expect(toFormat(setGregorian(dt, { month: 1, day: 13 }), "o")).toBe("13");
  expect(toFormat(setGregorian(dt, { month: 1, day: 8 }), "o")).toBe("8");
});

test("toFormat('ooo') returns an unpadded ordinal", () => {
  expect(toFormat(dt, "ooo")).toBe("145");
  expect(toFormat(setGregorian(dt, { month: 1, day: 13 }), "ooo")).toBe("013");
  expect(toFormat(setGregorian(dt, { month: 1, day: 8 }), "ooo")).toBe("008");
});

test("toFormat('q') returns an unpadded quarter", () => {
  expect(toFormat(dt, "q")).toBe("2");
  expect(toFormat(setGregorian(dt, { month: 2 }), "q")).toBe("1");
});

test("toFormat('qq') returns a padded quarter", () => {
  expect(toFormat(dt, "qq")).toBe("02");
  expect(toFormat(setGregorian(dt, { month: 2 }), "qq")).toBe("01");
});

test("toFormat('D') returns a short date representation", () => {
  expect(toFormat(dt, "D")).toBe("5/25/1982");
  expect(toFormat(dt, "D", { locale: "fr" })).toBe("25/05/1982");
});

test("toFormat('DD') returns a medium date representation", () => {
  expect(toFormat(dt, "DD")).toBe("May 25, 1982");
  expect(toFormat(setGregorian(dt, { month: 8 }), "DD")).toBe("Aug 25, 1982");
  expect(toFormat(dt, "DD", { locale: "fr" })).toBe("25 mai 1982");
  expect(toFormat(setGregorian(dt, { month: 2 }), "DD", { locale: "fr" })).toBe("25 févr. 1982");
});

test("toFormat('DDD') returns a long date representation", () => {
  expect(toFormat(dt, "DDD")).toBe("May 25, 1982");
  expect(toFormat(setGregorian(dt, { month: 8 }), "DDD")).toBe("August 25, 1982");
  expect(toFormat(dt, "DDD", { locale: "fr" })).toBe("25 mai 1982");
  expect(toFormat(setGregorian(dt, { month: 2 }), "DDD", { locale: "fr" })).toBe("25 février 1982");
});

test("toFormat('DDDD') returns a long date representation", () => {
  expect(toFormat(dt, "DDDD")).toBe("Tuesday, May 25, 1982");
  expect(toFormat(setGregorian(dt, { month: 8 }), "DDDD")).toBe("Wednesday, August 25, 1982");
  expect(toFormat(dt, "DDDD", { locale: "fr" })).toBe("mardi 25 mai 1982");
  expect(toFormat(setGregorian(dt, { month: 2 }), "DDDD", { locale: "fr" })).toBe("jeudi 25 février 1982");
});

test("toFormat('t') returns a short time representation", () => {
  expect(toFormat(dt, "t")).toBe("9:23 AM");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "t")).toBe("1:23 PM");
  expect(toFormat(dt, "t", { locale: "fr" })).toBe("09:23");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "t", { locale: "fr" })).toBe("13:23");
});

test("toFormat('T') returns a short 24-hour time representation", () => {
  expect(toFormat(dt, "T")).toBe("09:23");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "T")).toBe("13:23");
  expect(toFormat(dt, "T", { locale: "fr" })).toBe("09:23");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "T", { locale: "fr" })).toBe("13:23");
});

test("toFormat('tt') returns a medium time representation", () => {
  expect(toFormat(dt, "tt")).toBe("9:23:54 AM");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "tt")).toBe("1:23:54 PM");
  expect(toFormat(dt, "tt", { locale: "fr" })).toBe("09:23:54");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "tt", { locale: "fr" })).toBe("13:23:54");
});

test("toFormat('TT') returns a medium 24-hour time representation", () => {
  expect(toFormat(dt, "TT")).toBe("09:23:54");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "TT")).toBe("13:23:54");
  expect(toFormat(dt, "TT", { locale: "fr" })).toBe("09:23:54");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "TT", { locale: "fr" })).toBe("13:23:54");
});

test("toFormat('ttt') returns a medium time representation", () => {
  // these seem to fail on Travis
  expect(toFormat(dt, "ttt")).toBe("9:23:54 AM UTC");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "ttt")).toBe("1:23:54 PM UTC");
  expect(toFormat(dt, "ttt", { locale: "fr" })).toBe("9:23:54 UTC");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "ttt", { locale: "fr" })).toBe("13:23:54 UTC");
});

test("toFormat('TTT') returns a medium time representation", () => {
  // these seem to fail on Travis
  expect(toFormat(dt, "TTT")).toBe("09:23:54 UTC");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "TTT")).toBe("13:23:54 UTC");
  expect(toFormat(dt, "TTT", { locale: "fr" })).toBe("9:23:54 UTC");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "TTT", { locale: "fr" })).toBe("13:23:54 UTC");
});

test("toFormat('f') returns a short date/time representation without seconds", () => {
  expect(toFormat(dt, "f")).toBe("5/25/1982, 9:23 AM");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "f")).toBe("5/25/1982, 1:23 PM");
  expect(toFormat(dt, "f", { locale: "fr" })).toBe("25/05/1982, 09:23");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "f", { locale: "fr" })).toBe("25/05/1982, 13:23");
});

test("toFormat('ff') returns a medium date/time representation without seconds", () => {
  expect(toFormat(dt, "ff")).toBe("May 25, 1982, 9:23 AM");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "ff")).toBe("May 25, 1982, 1:23 PM");
  expect(toFormat(setGregorian(dt, { month: 8 }), "ff")).toBe("Aug 25, 1982, 9:23 AM");
  expect(toFormat(dt, "ff", { locale: "fr" })).toBe("25 mai 1982, 09:23");
  expect(toFormat(setGregorian(dt, { month: 2 }), "ff", { locale: "fr" })).toBe("25 févr. 1982, 09:23");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "ff", { locale: "fr" })).toBe("25 mai 1982, 13:23");
});

test("toFormat('fff') returns a medium date/time representation without seconds", () => {
  expect(toFormat(ny, "fff")).toBe("May 25, 1982, 9:23 AM EDT");
  expect(toFormat(setGregorian(ny, { hour: 13 }), "fff")).toBe("May 25, 1982, 1:23 PM EDT");
  expect(toFormat(setGregorian(ny, { month: 8 }), "fff")).toBe("August 25, 1982, 9:23 AM EDT");
  expect(toFormat(ny, "fff", { locale: "fr" })).toBe("25 mai 1982, 09:23 UTC−4");
  expect(toFormat(setGregorian(ny, { month: 2 }), "fff", { locale: "fr" })).toBe("25 février 1982, 09:23 UTC−5");
  expect(toFormat(setGregorian(ny, { hour: 13 }), "fff", { locale: "fr" })).toBe("25 mai 1982, 13:23 UTC−4");
});

test("toFormat('ffff') returns a long date/time representation without seconds", () => {
  expect(toFormat(ny, "ffff")).toBe("Tuesday, May 25, 1982, 9:23 AM Eastern Daylight Time");
  expect(toFormat(setGregorian(ny, { hour: 13 }), "ffff")).toBe("Tuesday, May 25, 1982, 1:23 PM Eastern Daylight Time");
  expect(toFormat(setGregorian(ny, { month: 2 }), "ffff")).toBe(
    "Thursday, February 25, 1982, 9:23 AM Eastern Standard Time"
  );
  expect(toFormat(ny, "ffff", { locale: "fr" })).toBe("mardi 25 mai 1982, 09:23 heure d’été de l’Est");
  expect(toFormat(setGregorian(ny, { month: 2 }), "ffff", { locale: "fr" })).toBe(
    "jeudi 25 février 1982, 09:23 heure normale de l’Est nord-américain"
  );
  expect(toFormat(setGregorian(ny, { hour: 13 }), "ffff", { locale: "fr" })).toBe(
    "mardi 25 mai 1982, 13:23 heure d’été de l’Est"
  );
});

test("toFormat('F') returns a short date/time representation with seconds", () => {
  expect(toFormat(dt, "F")).toBe("5/25/1982, 9:23:54 AM");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "F")).toBe("5/25/1982, 1:23:54 PM");
  expect(toFormat(dt, "F", { locale: "fr" })).toBe("25/05/1982, 09:23:54");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "F", { locale: "fr" })).toBe("25/05/1982, 13:23:54");
});

test("toFormat('FF') returns a medium date/time representation with seconds", () => {
  expect(toFormat(dt, "FF")).toBe("May 25, 1982, 9:23:54 AM");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "FF")).toBe("May 25, 1982, 1:23:54 PM");
  expect(toFormat(setGregorian(dt, { month: 8 }), "FF")).toBe("Aug 25, 1982, 9:23:54 AM");
  expect(toFormat(dt, "FF", { locale: "fr" })).toBe("25 mai 1982, 09:23:54");
  expect(toFormat(setGregorian(dt, { month: 2 }), "FF", { locale: "fr" })).toBe("25 févr. 1982, 09:23:54");
  expect(toFormat(setGregorian(dt, { hour: 13 }), "FF", { locale: "fr" })).toBe("25 mai 1982, 13:23:54");
});

test("toFormat('FFF') returns a medium date/time representation without seconds", () => {
  expect(toFormat(ny, "FFF")).toBe("May 25, 1982, 9:23:54 AM EDT");
  expect(toFormat(setGregorian(ny, { hour: 13 }), "FFF")).toBe("May 25, 1982, 1:23:54 PM EDT");
  expect(toFormat(setGregorian(ny, { month: 8 }), "FFF")).toBe("August 25, 1982, 9:23:54 AM EDT");
  expect(toFormat(ny, "FFF", { locale: "fr" })).toBe("25 mai 1982, 9:23:54 UTC−4");
  expect(toFormat(setGregorian(ny, { month: 2 }), "FFF", { locale: "fr" })).toBe("25 février 1982, 9:23:54 UTC−5");
  expect(toFormat(setGregorian(ny, { hour: 13 }), "FFF", { locale: "fr" })).toBe("25 mai 1982, 13:23:54 UTC−4");
});

test("toFormat('FFFF') returns a long date/time representation without seconds", () => {
  expect(toFormat(ny, "FFFF")).toBe("Tuesday, May 25, 1982, 9:23:54 AM Eastern Daylight Time");
  expect(toFormat(setGregorian(ny, { hour: 13 }), "FFFF")).toBe(
    "Tuesday, May 25, 1982, 1:23:54 PM Eastern Daylight Time"
  );
  expect(toFormat(setGregorian(ny, { month: 2 }), "FFFF")).toBe(
    "Thursday, February 25, 1982, 9:23:54 AM Eastern Standard Time"
  );
  expect(toFormat(ny, "FFFF", { locale: "fr" })).toBe("mardi 25 mai 1982, 9:23:54 heure d’été de l’Est");
  expect(toFormat(setGregorian(ny, { month: 2 }), "FFFF", { locale: "fr" })).toBe(
    "jeudi 25 février 1982, 9:23:54 heure normale de l’Est nord-américain"
  );
  expect(toFormat(setGregorian(ny, { hour: 13 }), "FFFF", { locale: "fr" })).toBe(
    "mardi 25 mai 1982, 13:23:54 heure d’été de l’Est"
  );
});

test("toFormat returns a full formatted string", () => {
  expect(toFormat(dt, "MM/yyyy GG")).toBe("05/1982 Anno Domini");
});

test("toFormat() accepts literals in brackets", () => {
  expect(toFormat(dt, "dd/MM/yyyy [at] hh:mm")).toBe("25/05/1982 at 09:23");
  expect(toFormat(dt, "MMdd[T]hh")).toBe("0525T09");
});

test("toFormat() uses the numbering system", () => {
  expect(toFormat(dt, "S", { numberingSystem: "beng" })).toBe("১২৩");
  expect(toFormat(dt, "S", { numberingSystem: "beng" })).toBe("১২৩");
});

test("toFormat() uses the output calendar", () => {
  expect(toFormat(dt, "MMMM yyyy", { calendar: "islamic" })).toBe("Shaʻban 1402");
  expect(toFormat(dt, "MMMM yyyy", { calendar: "islamic" })).toBe("Shaʻban 1402");
  expect(toFormat(dt, "MMMM yyyy", "ar-YE", { calendar: "islamic" })).toBe("شعبان ١٤٠٢");
});

test("toFormat('X') returns a Unix timestamp in seconds", () => {
  expect(toFormat(dt, "X")).toBe("391166634");
});

test("toFormat('X') rounds down", () => {
  expect(toFormat(plus(dt, { milliseconds: 500 }), "X")).toBe("391166634");
});

test("toFormat('x') returns a Unix timestamp in milliseconds", () => {
  expect(toFormat(dt, "x")).toBe("391166634123");
});
