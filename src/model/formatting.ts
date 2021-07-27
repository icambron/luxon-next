export type MonthFormatWidth = "narrow" | "short" | "long" | "numeric" | "2-digit";
export type WeekdayFormatLength = "narrow" | "short" | "long" | "numeric";
export type EraFormatLength = "narrow" | "short" | "long";
export type FormatMode = "standalone" | "format";

export type FormatFirstArg = string | Intl.DateTimeFormatOptions | undefined;
export type FormatSecondArg = Intl.DateTimeFormatOptions | undefined;

export type MonthFormatOpts =
  | {
      mode?: FormatMode;
      width?: MonthFormatWidth;
    }
  | undefined;
