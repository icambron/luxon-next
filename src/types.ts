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
export type NamedOffsetFormatWidth = "short" | "long";
export type NumericOffsetFormatWidth = "narrow" | "standard" | "techie";
export type OffsetFormatWidth = NumericOffsetFormatWidth | NamedOffsetFormatWidth;
export type FormatMode = "standalone" | "format";

export interface SharedFormatOpts {
  locale?: string;
  numberingSystem?: string;
}

export interface FormatOpts extends SharedFormatOpts, Intl.DateTimeFormatOptions {
}

export interface TokenFormatOpts extends SharedFormatOpts {
  forceSimple?: boolean,
  allowZ?: boolean,
  calendar?: string
}

export interface MonthFormatOpts extends FormatOpts {
  mode?: FormatMode;
  width?: MonthFormatWidth;
}

export interface WeekdayFormatOpts extends FormatOpts {
  mode?: FormatMode;
  width?: WeekdayFormatWidth;
}

export interface MeridiemFormatOpts extends FormatOpts {
  width?: MeridiemFormatWidth;
}

export interface EraFormatOpts extends FormatOpts {
  width?: EraFormatWidth;
}

export interface NamedOffsetFormatOpts extends FormatOpts {
  width?: NamedOffsetFormatWidth;
}

export interface OffsetFormatOpts extends FormatOpts {
  width?: OffsetFormatWidth;
}

export interface FormatToken {
  name: string;
  literal?: boolean;
}

export type FormatFirstArg<T extends SharedFormatOpts> = T | string | undefined;
export type FormatSecondArg<T extends SharedFormatOpts> = T | undefined;

export type ISOFormatLength = "basic" | "extended";

export type ISOTimeOptions = {
  seconds: boolean,
  milliseconds: boolean
  elideZeroSeconds: boolean,
  elideZeroMilliseconds: boolean,
  format: ISOFormatLength,
  includeOffset: boolean
};

// PARSING

export interface ParseOpts {
  interpretationZone?: Zoneish;
  targetZone?: Zoneish;
  useTargetZoneFromInput?: boolean;
}

export interface TokenParseOpts extends ParseOpts, SharedFormatOpts {
}

export interface TokenParseValue {
  gregorian: Partial<GregorianDate>;
  week: Partial<ISOWeekDate>;
  time: Partial<Time>;
  ordinal?: number;
  zone?: Zone;
  knownOffset?: number;
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

export type TokenParseFields = Partial<{
  [key in TokenParsedField]: any;
}>;

export interface TokenParseSummary {
  input: string;
  format: string;
  tokens: FormatToken[];
  regex: RegExp;
  matches: RegExpMatchArray | null;
  fields: TokenParseFields | null;
  parsed: TokenParseValue | null;
};

export type StartEndUnit = GregorianUnit | TimeUnit | MiscDurationUnit;
