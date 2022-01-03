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

export type GregorianCalendar = Calendar<GregorianDate>;

// TIME

export type TimeUnit = "hour" | "minute" | "second" | "millisecond";
export type TimeUnitPlural = "hours" | "minutes" | "seconds" | "milliseconds";
export type Time = {
  [key in TimeUnit]: number;
};

// ISO WEEK
export type IsoWeekUnit = "weekYear" | "weekNumber" | "weekday";

export type ISOWeekDate = {
  weekYear: number;
  weekNumber: number;
  weekday: number;
};

export type IsoWeekCalendar = Calendar<ISOWeekDate>;

export type OrdinalDate = {
  year: number;
  ordinal: number;
};

// ORDINAL

export type OrdinalUnit = "year" | "ordinal";
export type OrdinalCalendar = Calendar<OrdinalDate>;

// MATH

export type ComparableUnit = GregorianUnit | TimeUnit | MiscDurationUnit;
export type ComparableUnitPlural = GregorianUnitPlural | TimeUnitPlural | MiscDurationUnitPlural;
export type RelativeUnit = Exclude<DurationUnit, "milliseconds">;

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
  readonly zone: Zone;
  readonly ts: number;
  readonly offset: number;
  readonly isLuxonDateTime: boolean;
  readonly gregorian: GregorianDate;
  readonly time: Time;
  readonly calendarDates: Map<string, any>;

  native(): Date;

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

export type SharedFormatOpts = {
  locale?: string;
  numberingSystem?: string;
}

export type DateTimeFormatOpts = SharedFormatOpts & Intl.DateTimeFormatOptions;

export type DateTimeTokenFormatOpts = SharedFormatOpts & {
  forceSimple: boolean,
  allowZ: boolean,
  calendar?: string
};

export type MonthFormatOpts = DateTimeFormatOpts & {
  mode: FormatMode;
  width: MonthFormatWidth;
};

export type WeekdayFormatOpts = DateTimeFormatOpts & {
  mode: FormatMode;
  width: WeekdayFormatWidth;
};

export type MeridiemFormatOpts = DateTimeFormatOpts & {
  width: MeridiemFormatWidth;
};

export type EraFormatOpts = DateTimeFormatOpts & {
  /*
   * The length of the era string to format.
   * * "narrow" for English is like "A" or "B"
   * * "short" for English is like "AD" or "BC"
   * * "long" for English is like "Anno Domini" or "Before Christ"
   * @defaultValue "short"
  */
  width: EraFormatWidth;
};

export type NamedOffsetFormatOpts = DateTimeFormatOpts & {
  width: NamedOffsetFormatWidth;
};

export type OffsetFormatOpts = DateTimeFormatOpts & {
  width: OffsetFormatWidth;
};

export type FormatToken = {
  name: string;
  literal: boolean;
}

export type FormatFirstArg<T extends SharedFormatOpts> = Partial<T> | string | undefined;
export type FormatSecondArg<T extends SharedFormatOpts> = Partial<T> | undefined;

export type ISOFormatLength = "basic" | "extended";

/**
  * Options for ISO-8601 string formatting.
  * @see {@link toISOAdvanced}
*/
export type ISOFormatOpts = {
  /**
    * Whether to include display seconds.
    * @defaultValue true
  */
  seconds: boolean,

  /**
    * Whether to include display milliseconds. Ignored if `seconds` is set to false.
    * @defaultValue true
  */
  milliseconds: boolean

  /*
   * Whether to include seconds in the output if they're zero. Ignored if `seconds` is set to false`.
   * @remarks This is a subtle flag:
   *  * If `seconds` is set to false, seconds aren't displayed, so this flag is ignored.
   *  * If `milliseconds` is set to true (the default) and there the time contains non-zero milliseconds, the seconds and milliseconds will be displayed
   *  * This flag implies `elideZeroMilliseconds`
  */
  elideZeroSeconds: boolean,

  /*
   * Whether to include milliseconds in the output if they're zero. Ignored if `milliseconds` or `seconds` is set to false`.
  */
  elideZeroMilliseconds: boolean,

  /*
   * The ISO-8601 format type
   * @defaultValue "extended"
  */
  format: ISOFormatLength,

  /*
   * Whether to include the offset in the output.
   * @defaultValue true
  */
  includeOffset: boolean
};

export type RelativeFormatOpts = SharedFormatOpts & Intl.RelativeTimeFormatOptions & {
  /**
   * Whether to round the values
   * @defaultValue 0
  */
  roundTo: number,

  /**
   * Units to consider
  */
  units: RelativeUnit[],
}

export type DurationTokenFormatOpts = SharedFormatOpts & Intl.NumberFormatOptions & {
  floor: boolean,
  conversionAccuracy: ConversionAccuracy
}

export type DurationHumanizeFormatOpts = SharedFormatOpts & Intl.NumberFormatOptions & {
  /**
   * How to display the list
   * @defaultValue "narrow"
  */
  listStyle: "long" | "short" | "narrow"
}

// PARSING
export type ParseOpts = {
  zone?: Zoneish,
  useZoneFromInput?: boolean;
}

export type ParseOptsOrZone = ParseOpts | string;

export type TokenParseOpts = ParseOpts & SharedFormatOpts;

export type TokenParseValue = {
  gregorian: Partial<GregorianDate>;
  week: Partial<ISOWeekDate>;
  time: Partial<Time>;
  ordinal?: number;
  zone?: Zone;
  knownOffset?: number;
};

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

export type TokenParseSummary = {
  input: string;
  format: string;
  tokens: FormatToken[];
  regex: RegExp;
  matches: RegExpMatchArray | null;
  fields: TokenParseFields | null;
  parsed: TokenParseValue | null;
};
