import { parseISODateTime } from "./impl/isoParser";
import { DateTime, fromCalendar, normalizeZone } from "../model/dateTime";
import { gregorianInstance } from "../model/calendars/gregorian";
import { setZone } from "../dateTime/zone";
import { ExtractedResult } from "./impl/regexParser";
import { parseRFC2822 } from "./impl/rfc2822Parser";
import { parseHTTPDate } from "./impl/httpParser";
import { getDefaultZone } from "../settings";
import { parseFromFormat } from "./impl/tokenParser";
import { Calendar } from "../types/calendar";
import { ordinalInstance } from "../model/calendars/ordinal";
import { isoWeekCalendarInstance } from "../model/calendars/isoWeek";
import { NoMatchingParserPattern } from "../errors";
import { getFormattingOpts } from "../utils/format";
import { FormatFirstArg, FormatSecondArg } from "../types/formatting";
import Zone, { Zoneish } from "../types/zone";
import { isUndefined } from "../utils/typeCheck";
import {
  GeneralParsingOpts,
  ParsingOptions,
  TokenParsedValue,
  TokenParsingOpts,
  TokenParsingSummary,
} from "../types/parsing";

export const simpleParsingOptions = (zone: Zoneish = getDefaultZone()): ParsingOptions => ({
  interpretationZone: zone,
  targetZone: zone,
  useTargetZoneFromInput: false,
});

const pickZone = (
  parsedZone: Zone | null | undefined,
  opts: ParsingOptions = {}
): { targetZone: Zone; interpretationZone: Zone } => {
  const interpretationZone: Zone = parsedZone || normalizeZone(opts.interpretationZone) || getDefaultZone();
  const targetZone =
    opts.useTargetZoneFromInput && parsedZone ? parsedZone : normalizeZone(opts.targetZone) || getDefaultZone();
  return { interpretationZone, targetZone };
};

const fromRegexParse = (extracted: ExtractedResult, opts: ParsingOptions): DateTime => {
  const { interpretationZone, targetZone } = pickZone(extracted.zone, opts);
  const calendar = extracted.calendar || gregorianInstance;
  const dt = fromCalendar(calendar, { ...extracted.calendarUnits, ...extracted.timeUnits }, interpretationZone);
  return setZone(targetZone)(dt);
};

const wrapError =
  (fn: (input: string, opts?: ParsingOptions) => DateTime): ((i: string, opts?: ParsingOptions) => DateTime | null) =>
  (i, opts) => {
    try {
      return fn(i, opts);
    } catch (e) {
      return null;
    }
  };

const choose = (parsed: TokenParsedValue, opts: ParsingOptions): DateTime => {
  let calendar: Calendar<any>;
  let obj: object;

  const { interpretationZone, targetZone } = pickZone(parsed.zone, opts);

  // ordinal first
  if (!isUndefined(parsed.ordinal)) {
    const year = parsed.gregorian.year;
    calendar = ordinalInstance;
    obj = { year, ordinal: parsed.ordinal };
  } else if (
    !isUndefined(parsed.week.weekYear) ||
    !isUndefined(parsed.week.weekNumber) ||
    !isUndefined(parsed.week.weekday)
  ) {
    calendar = isoWeekCalendarInstance;
    obj = parsed.week;
  } else {
    calendar = gregorianInstance;
    obj = parsed.gregorian;
  }

  const dt = fromCalendar(calendar, { ...obj, ...parsed.time }, interpretationZone);
  return setZone(targetZone)(dt);
};

export const fromISO = (input: string, opts: GeneralParsingOpts = {}): DateTime =>
  fromRegexParse(parseISODateTime(input), opts);
export const tryFromISO = wrapError(fromISO);

export const fromRFC2822 = (input: string, opts: GeneralParsingOpts = {}): DateTime =>
  fromRegexParse(parseRFC2822(input), opts);
export const tryFromRFC2822 = wrapError(fromRFC2822);

export const fromHTTP = (input: string, opts: GeneralParsingOpts = {}): DateTime =>
  fromRegexParse(parseHTTPDate(input), opts);
export const tryFromHTTP = wrapError(fromHTTP);

export const fromFormatExplain = (
  input: string,
  format: string,
  firstArg?: FormatFirstArg<TokenParsingOpts>,
  secondArg?: FormatSecondArg<TokenParsingOpts>
): TokenParsingSummary => {
  const parsingOpts = getFormattingOpts(firstArg, secondArg);
  return parseFromFormat(input, format, parsingOpts);
};

export const fromFormat = (
  input: string,
  format: string,
  firstArg?: FormatFirstArg<TokenParsingOpts>,
  secondArg?: FormatSecondArg<TokenParsingOpts>
): DateTime => {
  const parsingOpts = getFormattingOpts(firstArg, secondArg);
  const summary = fromFormatExplain(input, format, parsingOpts);
  if (summary.parsed) {
    return choose(summary.parsed, parsingOpts);
  } else {
    throw new NoMatchingParserPattern(input);
  }
};
