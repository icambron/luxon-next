import { DateTimeExtractedResult } from "../impl/parsing/regexParser";
import { parseISODateTime } from "../impl/parsing/isoParser";
import { parseFromFormat } from "../impl/parsing/tokenParser";
import { ordinalInstance } from "../impl/calendars/ordinal";
import { isoWeekCalendarInstance } from "../impl/calendars/isoWeek";
import { gregorianInstance } from "../impl/calendars/gregorian";
import { parseRFC2822 } from "../impl/parsing/rfc2822Parser";
import { parseHTTPDate } from "../impl/parsing/httpParser";
import { getFormattingOpts } from "../impl/util/formatUtil";
import { fromCalendar } from "../impl/dateTime";
import { getDefaultZone } from "../settings";
import { NoMatchingParserPattern } from "../errors";
import {
  Zone,
  Calendar,
  DateTime,
  FormatFirstArg,
  FormatSecondArg,
  ParseOpts,
  TokenParseValue,
  TokenParseOpts,
  TokenParseSummary,
  ParseOptsOrZone,
} from "../types";

import { normalizeZone } from "../impl/zone/normalizeZone";
import { setZone } from "./zone";

const pickZone = (
  parsedZone: Zone | null | undefined,
  opts: ParseOptsOrZone = {}
): { targetZone: Zone; interpretationZone: Zone } => {

  if (typeof opts === "string") {
    opts = { zone: opts }
  }

  const interpretationZone: Zone = parsedZone || normalizeZone(opts.zone) || getDefaultZone();
  const targetZone = opts.useZoneFromInput && parsedZone ? parsedZone : normalizeZone(opts.zone) || getDefaultZone();
  return { interpretationZone, targetZone };
};

const fromRegexParse = (extracted: DateTimeExtractedResult, opts: ParseOptsOrZone): DateTime => {
  const { interpretationZone, targetZone } = pickZone(extracted.zone, opts);
  const calendar = extracted.cal || gregorianInstance;
  const dt = fromCalendar(calendar, { ...extracted.date, ...extracted.time }, interpretationZone);
  return setZone(dt, targetZone);
};

const wrapError =
  (fn: (input: string, opts?: ParseOpts) => DateTime): ((i: string, opts?: ParseOpts) => DateTime | null) =>
  (i, opts) => {
    try {
      return fn(i, opts);
    } catch (e) {
      return null;
    }
  };

const dateTimeFromParsedValues = (parsed: TokenParseValue, opts: ParseOpts): DateTime => {
  let calendar: Calendar<any>;
  let obj: object;

  const { interpretationZone, targetZone } = pickZone(parsed.zone, opts);

  const isUndefined = (o: unknown): o is undefined => typeof o === "undefined";

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

  const dt = fromCalendar(calendar, { ...obj, ...parsed.time }, interpretationZone, parsed.knownOffset);
  return setZone(dt, targetZone);
};

export const fromISO = (input: string, opts: ParseOptsOrZone = {}): DateTime => fromRegexParse(parseISODateTime(input), opts);

export const tryFromISO = wrapError(fromISO);

export const fromRFC2822 = (input: string, opts: ParseOptsOrZone = {}): DateTime => fromRegexParse(parseRFC2822(input), opts);

export const tryFromRFC2822 = wrapError(fromRFC2822);

export const fromHTTP = (input: string, opts: ParseOptsOrZone = {}): DateTime => fromRegexParse(parseHTTPDate(input), opts);

export const tryFromHTTP = wrapError(fromHTTP);

export const fromFormatExplain = (
  input: string,
  format: string,
  locale?: FormatFirstArg<TokenParseOpts>,
  opts?: FormatSecondArg<TokenParseOpts>
): TokenParseSummary => {
  const parsingOpts = getFormattingOpts(locale, opts);
  return parseFromFormat(input, format, parsingOpts);
};

export const fromFormat = (
  input: string,
  format: string,
  locale?: FormatFirstArg<TokenParseOpts>,
  opts?: FormatSecondArg<TokenParseOpts>
): DateTime => {
  const parsingOpts = getFormattingOpts(locale, opts);
  const summary = fromFormatExplain(input, format, parsingOpts);
  if (summary.parsed) {
    return dateTimeFromParsedValues(summary.parsed, parsingOpts);
  } else {
    throw new NoMatchingParserPattern(input);
  }
};

export const tryFromFormat = (
  input: string,
  format: string,
  locale?: FormatFirstArg<TokenParseOpts>,
  opts?: FormatSecondArg<TokenParseOpts>
): DateTime | null => {
  try {
    return fromFormat(input, format, locale, opts);
  } catch {
    return null;
  }
};
