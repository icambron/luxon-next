import Zone, { Zoneish } from "./zone";
import { GregorianDate } from "./gregorian";
import { ISOWeekDate } from "./isoWeek";
import { Time } from "./time";
import { FormattingToken, SharedFormattingOpts } from "./formatting";

export interface GeneralParsingOpts {
  interpretationZone?: Zoneish;
  targetZone?: Zoneish;
  useTargetZoneFromInput?: boolean;
}

export interface TokenParsingOpts extends GeneralParsingOpts, SharedFormattingOpts {}

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

export type TokenParsedFieldsFull = {
  [key in TokenParsedField]: any;
};
export type TokenParsedFields = Partial<TokenParsedFieldsFull>;

export interface TokenParsingSummary {
  input: string;
  format: string;
  tokens: FormattingToken[];
  regex: RegExp;
  matches: RegExpMatchArray | null;
  fields: TokenParsedFields | null;
  parsed: TokenParsedValue | null;
}
