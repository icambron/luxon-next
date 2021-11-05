import { Zoneish } from "../model/zone";

export type MonthFormatWidth = "narrow" | "short" | "long" | "numeric" | "2-digit";
export type WeekdayFormatWidth = "narrow" | "short" | "long";
export type EraFormatWidth = "narrow" | "short" | "long";
export type MeridiemFormatWidth = "simple" | "narrow" | "short" | "long";
export type FormatMode = "standalone" | "format";

export interface SharedFormattingOpts {
  locale?: string;
  numberingSystem?: string;
}

export interface GeneralFormattingOpts extends SharedFormattingOpts, Intl.DateTimeFormatOptions { }

export interface GeneralParsingOpts{
  interpretationZone?: Zoneish;
  targetZone?: Zoneish;
  useTargetZoneFromInput?: boolean
}

export interface TokenParsingOpts extends GeneralParsingOpts, SharedFormattingOpts { }

export interface MonthFormatOpts extends GeneralFormattingOpts {
  mode?: FormatMode;
  width?: MonthFormatWidth;
}

export interface WeekdayFormatOpts extends GeneralFormattingOpts {
  mode?: FormatMode;
  width?: WeekdayFormatWidth;
}

export interface MeridiemFormatOpts extends GeneralFormattingOpts {
  width?: MeridiemFormatWidth;
}

export interface EraFormatOpts extends GeneralFormattingOpts {
  width?: EraFormatWidth;
}

export interface FormattingToken {
  name: string;
  literal?: boolean;
}

export type FormatFirstArg<T extends SharedFormattingOpts> = T | string | undefined;
export type FormatSecondArg<T extends SharedFormattingOpts> = T | undefined;