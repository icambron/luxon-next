import * as presets from "./presets";

export type MacroToken =
  | "D"
  | "DD"
  | "DDD"
  | "DDDD"
  | "t"
  | "tt"
  | "ttt"
  | "tttt"
  | "T"
  | "TT"
  | "TTT"
  | "TTTT"
  | "f"
  | "ff"
  | "fff"
  | "ffff"
  | "F"
  | "FF"
  | "FFF"
  | "FFFF";

export const macroTokens: Partial<Record<MacroToken, Intl.DateTimeFormatOptions>> = {
  D: presets.DATE_SHORT,
  DD: presets.DATE_MED,
  DDD: presets.DATE_FULL,
  DDDD: presets.DATE_HUGE,
  t: presets.TIME_SIMPLE,
  tt: presets.TIME_WITH_SECONDS,
  ttt: presets.TIME_WITH_SHORT_OFFSET,
  tttt: presets.TIME_WITH_LONG_OFFSET,
  T: presets.TIME_24_SIMPLE,
  TT: presets.TIME_24_WITH_SECONDS,
  TTT: presets.TIME_24_WITH_SHORT_OFFSET,
  TTTT: presets.TIME_24_WITH_LONG_OFFSET,
  f: presets.DATETIME_SHORT,
  ff: presets.DATETIME_MED,
  fff: presets.DATETIME_FULL,
  ffff: presets.DATETIME_HUGE,
  F: presets.DATETIME_SHORT_WITH_SECONDS,
  FF: presets.DATETIME_MED_WITH_SECONDS,
  FFF: presets.DATETIME_FULL_WITH_SECONDS,
  FFFF: presets.DATETIME_HUGE_WITH_SECONDS,
};
