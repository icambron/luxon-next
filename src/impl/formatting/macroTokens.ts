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

export const macroTokens: Record<MacroToken, Intl.DateTimeFormatOptions> = {
  D: { dateStyle: "short" },
  DD: { dateStyle: "medium" },
  DDD: { dateStyle: "long" },
  DDDD: { dateStyle: "full" },
  t: { timeStyle: "short" },
  tt: { timeStyle: "medium" },
  ttt: { timeStyle: "long" },
  tttt: { timeStyle: "full" },
  T: { timeStyle: "short", hourCycle: "h23" },
  TT: { timeStyle: "medium", hourCycle: "h23" },
  TTT: { timeStyle: "long", hourCycle: "h23" },
  TTTT: { timeStyle: "full", hourCycle: "h23" },
  f: { dateStyle: "short", timeStyle: "short" },
  ff: { dateStyle: "medium", timeStyle: "medium" },
  fff: { dateStyle: "long", timeStyle: "long" },
  ffff: { dateStyle: "full", timeStyle: "full" },
  F: { dateStyle: "short", timeStyle: "short", hourCycle: "h23" },
  FF: { dateStyle: "medium", timeStyle: "medium" , hourCycle: "h23"},
  FFF: { dateStyle: "long", timeStyle: "long" , hourCycle: "h23"},
  FFFF: { dateStyle: "full", timeStyle: "full" , hourCycle: "h23"},
};

export const isMacroToken = (token: string): token is MacroToken => token in macroTokens;
