import Zone, { Zoneish } from "./model/zone";
import { parseISODateTime } from "./parsing/isoParser";
import { DateTime, fromCalendar, normalizeZone } from "./model/dateTime";
import { gregorianInstance } from "./model/calendars/gregorian";
import { setZone } from "./dateTime/zone";
import { ExtractedResult } from "./parsing/regexParser";
import { parseRFC2822 } from "./parsing/rfc2822Parser";
import { parseHTTPDate } from "./parsing/httpParser";
import { getDefaultLocale, getDefaultNumberingSystem, getDefaultZone } from "./settings";
import { parseFromFormat, TokenParsedValue, TokenParsingSummary } from "./parsing/tokenParser";
import { isUndefined } from "./lib/util";
import { Calendar } from "./model/calendar";
import { ordinalInstance } from "./model/calendars/ordinal";
import { isoCalendarInstance } from "./model/calendars/isoWeek";
import { NoMatchingParserPattern } from "./model/errors";

interface ParsingOptions {
  interpretationZone?: Zoneish;
  targetZone?: Zoneish;
  useTargetZoneFromInput?: boolean
}

interface TokenParsingOptions extends ParsingOptions {
  locale?: string,
  numberingSystem?: string
}

export const simpleParsingOptions = (zone: Zoneish = getDefaultZone()): ParsingOptions =>
  ({ interpretationZone: zone, targetZone: zone, useTargetZoneFromInput: false });

const pickZone = (parsedZone: Zone | null | undefined, opts: ParsingOptions = {}): { targetZone: Zone, interpretationZone: Zone } => {
  const interpretationZone: Zone = parsedZone || normalizeZone(opts.interpretationZone) || getDefaultZone();
  const targetZone = opts.useTargetZoneFromInput && parsedZone ? parsedZone : normalizeZone(opts.targetZone) || getDefaultZone();
  return { interpretationZone, targetZone };
}

const fromRegexParse = (extracted: ExtractedResult, opts: ParsingOptions): DateTime => {
  const { interpretationZone, targetZone } = pickZone(extracted.zone, opts);
  const calendar = extracted.calendar || gregorianInstance;
  const dt = fromCalendar(calendar, {...extracted.calendarUnits, ...extracted.timeUnits}, interpretationZone);
  return setZone(targetZone)(dt);
}

const wrapError = (fn: (input: string, opts?: ParsingOptions) => DateTime ): (i: string, opts?: ParsingOptions) => DateTime | null =>
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
    obj = { year, ordinal: parsed.ordinal  };
  } else if (!isUndefined(parsed.week.weekYear || !isUndefined(parsed.week.weekNumber) || !isUndefined(parsed.week.weekYear))) {
    calendar = isoCalendarInstance;
    obj = parsed.week;
  } else {
    calendar = gregorianInstance;
    obj = parsed.gregorian;
  }

  const dt = fromCalendar(calendar, obj, interpretationZone);
  return setZone(targetZone)(dt);
}

export const fromISO = (input: string, opts: ParsingOptions = {}): DateTime => fromRegexParse(parseISODateTime(input), opts);
export const tryFromISO = wrapError(fromISO);

export const fromRFC2822 = (input: string, opts: ParsingOptions = {}): DateTime => fromRegexParse(parseRFC2822(input), opts);
export const tryFromRFC2822 = wrapError(fromRFC2822);

export const fromHTTP = (input: string, opts: ParsingOptions = {}): DateTime => fromRegexParse(parseHTTPDate(input), opts);
export const tryFromHTTP = wrapError(fromHTTP);

export const fromFormatExplain = (input: string, format: string, opts: TokenParsingOptions = {}): TokenParsingSummary => {
  const locale = opts.locale || getDefaultLocale();
  // todo - is this right? Can't the locale choose the numbering system?
  const numberingSystem = opts.numberingSystem || getDefaultNumberingSystem();

  return parseFromFormat(locale, numberingSystem, input, format);
}

export const fromFormat = (input: string, format: string, opts: TokenParsingOptions = {}): DateTime => {
  const summary = fromFormatExplain(input, format, opts);
  if (summary.parsed) {
    return choose(summary.parsed, opts);
  } else {
    throw new NoMatchingParserPattern(input);
  }
}
