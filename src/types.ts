// CALENDAR

export interface Calendar<TDate> {
  name: string;
  defaultValues: TDate;
  fromObject(obj: object): TDate;
  isDateInvalid(obj: TDate): [string, number] | null;
  fromGregorian(obj: GregorianDate): TDate;
  toGregorian(obj: TDate): GregorianDate;
  areEqual(obj1: TDate, obj2: TDate): boolean;
}

// GREGORIAN

export type GregorianUnit = "year" | "month" | "day";
export type GregorianUnitPlural = "years" | "months" | "days";
export type GregorianDate = {
  [key in GregorianUnit]: number;
};

export interface GregorianCalendar extends Calendar<GregorianDate> {
}

// TIME

export type TimeUnit = "hour" | "minute" | "second" | "millisecond";
export type TimeUnitPlural = "hours" | "minutes" | "seconds" | "milliseconds";
export type Time = {
  [key in TimeUnit]: number;
};

// ISO WEEK
export type IsoWeekUnit = "weekYear" | "weekNumber" | "weekday";

export interface ISOWeekDate {
  weekYear: number;
  weekNumber: number;
  weekday: number;
}

export interface IsoWeekCalendar extends Calendar<ISOWeekDate> {
}

export interface OrdinalDate {
  year: number;
  ordinal: number;
}

// ORDINAL

export type OrdinalUnit = "year" | "ordinal";

export interface OrdinalCalendar extends Calendar<OrdinalDate> {
}

// ZONE

/**
 * An interface for defining time zones
 */
export interface Zone {

  isLuxonZone: boolean;

  /**
   * The type of zone
   */
  type: string;

  /**
   * The name of this zone.
   */
  name: string;

  /**
   * Returns whether the offset is known to be fixed for the whole year.
   */
  isUniversal: boolean;

  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   */
  offset(ts: number): number;

  /**
   * Return whether this Zone is equal to another zone
   * @param {Zone} other - the zone to compare
   */
  equals(other: Zone): boolean;
}

export type Zoneish = Zone | number | string | null | undefined;

// DATETIME

export interface DateTime {
  zone: Zone;
  ts: number;
  offset: number;
  isLuxonDateTime: boolean;
  readonly gregorian: GregorianDate;
  readonly time: Time;
  readonly calendarDates: Map<string, any>;

  toJSON(): string;

  toString(): string;

  toBSON(): Date;

  valueOf(): number;

  equals(other: any): boolean;
}

// UNITS

// DURATION
export type MiscDurationUnit = "week" | "quarter";
export type MiscDurationUnitPlural = "weeks" | "quarters";
export type DurationUnit = GregorianUnitPlural | TimeUnitPlural | MiscDurationUnitPlural;
export type DurationValues = {
  [unit in DurationUnit]: number;
};

export interface Duration {
  _values: Partial<DurationValues>;
  isLuxonDuration: boolean;
  readonly values: Partial<DurationValues>;
  toJson: () => string;
  toString: () => string;
  valueOf: () => number;
}
export type ConversionAccuracy = "casual" | "longterm";

// FORMATTING

export type MonthFormatWidth = "narrow" | "short" | "long" | "numeric" | "2-digit";
export type WeekdayFormatWidth = "narrow" | "short" | "long";
export type EraFormatWidth = "narrow" | "short" | "long";
export type MeridiemFormatWidth = "simple" | "narrow" | "short" | "long";
export type FormatMode = "standalone" | "format";

export interface SharedFormattingOpts {
  locale?: string;
  numberingSystem?: string;
}

export interface GeneralFormattingOpts extends SharedFormattingOpts, Intl.DateTimeFormatOptions {
}

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

// PARSING

export interface GeneralParsingOpts {
  interpretationZone?: Zoneish;
  targetZone?: Zoneish;
  useTargetZoneFromInput?: boolean;
}

export interface TokenParsingOpts extends GeneralParsingOpts, SharedFormattingOpts {
}

export interface ParsingOptions {
  interpretationZone?: Zoneish;
  targetZone?: Zoneish;
  useTargetZoneFromInput?: boolean;
}

export interface TokenParsedValue {
  gregorian: Partial<GregorianDate>;
  week: Partial<ISOWeekDate>;
  time: Partial<Time>;
  ordinal?: number;
  zone?: Zone;
}

export type TokenParsedField =
  | "G"
  | "y"
  | "M"
  | "L"
  | "d"
  | "o"
  | "H"
  | "h"
  | "m"
  | "q"
  | "s"
  | "S"
  | "u"
  | "a"
  | "k"
  | "W"
  | "E"
  | "c"
  | "Z"
  | "z";

export type TokenParsedFields = Partial<{
  [key in TokenParsedField]: any;
}>;

export interface TokenParsingSummary {
  input: string;
  format: string;
  tokens: FormattingToken[];
  regex: RegExp;
  matches: RegExpMatchArray | null;
  fields: TokenParsedFields | null;
  parsed: TokenParsedValue | null;
}