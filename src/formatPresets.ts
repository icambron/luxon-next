/**
 * @private
 */
const n = "numeric";
const s = "short";
const l = "long";

export const DATE_SHORT: Intl.DateTimeFormatOptions = {
  year: n,
  month: n,
  day: n,
};

export const DATE_MED: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
};

export const DATE_MED_WITH_WEEKDAY: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
  weekday: s,
};

export const DATE_FULL: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
};

export const DATE_HUGE: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  weekday: l,
};

export const TIME_SIMPLE: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
};

export const TIME_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
};

export const TIME_WITH_SHORT_OFFSET: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s,
};

export const TIME_WITH_LONG_OFFSET: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l,
};

export const TIME_24_SIMPLE: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  hourCycle: "h23",
};

export const TIME_24_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
};

export const TIME_24_WITH_SHORT_OFFSET: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: s,
};

export const TIME_24_WITH_LONG_OFFSET: Intl.DateTimeFormatOptions = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: l,
};

export const DATETIME_SHORT: Intl.DateTimeFormatOptions = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
};

export const DATETIME_SHORT_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
  second: n,
};

export const DATETIME_MED: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
};

export const DATETIME_MED_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
  second: n,
};

export const DATETIME_MED_WITH_WEEKDAY: Intl.DateTimeFormatOptions = {
  year: n,
  month: s,
  day: n,
  weekday: s,
  hour: n,
  minute: n,
};

export const DATETIME_FULL: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  timeZoneName: s,
};

export const DATETIME_FULL_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s,
};

export const DATETIME_HUGE: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  timeZoneName: l,
};

export const DATETIME_HUGE_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l,
};

export type MacroToken = "D" | "DD" | "DDD" | "DDDD" | "t" | "tt" | "ttt" | "tttt" | "T" | "TT" | "TTT" | "TTTT" | "f" | "ff" | "fff" | "ffff" | "F" | "FF" | "FFF" | "FFFF"

export const macroTokens: Partial<Record<MacroToken, Intl.DateTimeFormatOptions>> = {
  D: DATE_SHORT,
  DD: DATE_MED,
  DDD: DATE_FULL,
  DDDD: DATE_HUGE,
  t: TIME_SIMPLE,
  tt: TIME_WITH_SECONDS,
  ttt: TIME_WITH_SHORT_OFFSET,
  tttt: TIME_WITH_LONG_OFFSET,
  T: TIME_24_SIMPLE,
  TT: TIME_24_WITH_SECONDS,
  TTT: TIME_24_WITH_SHORT_OFFSET,
  TTTT: TIME_24_WITH_LONG_OFFSET,
  f: DATETIME_SHORT,
  ff: DATETIME_MED,
  fff: DATETIME_FULL,
  ffff: DATETIME_HUGE,
  F: DATETIME_SHORT_WITH_SECONDS,
  FF: DATETIME_MED_WITH_SECONDS,
  FFF: DATETIME_FULL_WITH_SECONDS,
  FFFF: DATETIME_HUGE_WITH_SECONDS,
};
