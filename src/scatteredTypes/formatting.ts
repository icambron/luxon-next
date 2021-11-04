export type MonthFormatWidth = "narrow" | "short" | "long" | "numeric" | "2-digit";
export type WeekdayFormatWidth = "narrow" | "short" | "long";
export type EraFormatWidth = "narrow" | "short" | "long";
export type MeridiemFormatWidth = "simple" | "narrow" | "short" | "long";
export type FormatMode = "standalone" | "format";

export type FormatFirstArg = string | Intl.DateTimeFormatOptions | undefined;
export type FormatSecondArg = Intl.DateTimeFormatOptions | undefined;

export type MonthFormatOpts = {
  mode?: FormatMode;
  width?: MonthFormatWidth;
} | undefined;

export type WeekdayFormatOpts = {
  mode?: FormatMode;
  width?: WeekdayFormatWidth;
} | undefined;

export type MeridiemFormatOpts = {
  width?: MeridiemFormatWidth;
} | undefined

export type EraFormatOpts = {
  width?: EraFormatWidth;
} | undefined

export interface FormattingToken {
  name: string;
  literal?: boolean;
}

