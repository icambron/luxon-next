import Zone, { Zoneish } from "./model/zone";
import { parseISODateTime } from "./parsing/isoParser";
import { DateTime, fromCalendar, normalizeZone } from "./model/dateTime";
import { gregorianInstance } from "./model/calendars/gregorian";
import { setZone } from "./dateTime/zone";
import { ExtractedResult } from "./parsing/regexParser";
import { parseRFC2822 } from "./parsing/rfc2822Parser";
import { parseHTTPDate } from "./parsing/httpParser";
import { getDefaultZone } from "./settings";

interface ParsingOptions {
  interpretationZone?: Zoneish;
  targetZone?: Zoneish;
  useTargetZoneFromInput?: boolean
}

export const simpleParsingOptions = (zone: Zoneish = getDefaultZone()): ParsingOptions =>
  ({ interpretationZone: zone, targetZone: zone, useTargetZoneFromInput: false });

export const defaultParsingOptions = simpleParsingOptions();

const fromRegexParse = (extracted: ExtractedResult, opts: ParsingOptions): DateTime => {
  const interpretationZone: Zone = extracted.zone || normalizeZone(opts.interpretationZone) || getDefaultZone();
  const targetZone = opts.useTargetZoneFromInput && extracted.zone ? extracted.zone : normalizeZone(opts.targetZone) || getDefaultZone();

  const calendar = extracted.calendar || gregorianInstance;
  const provisional = fromCalendar(calendar, {...extracted.calendarUnits, ...extracted.timeUnits}, interpretationZone);
  return interpretationZone.equals(targetZone) ? provisional : setZone(targetZone)(provisional);
}

const wrapError = (fn: (input: string, opts?: ParsingOptions) => DateTime ): (i: string, opts?: ParsingOptions) => DateTime | null =>
  (i, opts) => {
    try {
      return fn(i, opts);
    } catch (e) {
      return null;
    }
  };

export const fromISO = (iso: string, opts: ParsingOptions = defaultParsingOptions): DateTime => fromRegexParse(parseISODateTime(iso), opts);
export const tryFromISO = wrapError(fromISO);

export const fromRFC2822 = (input: string, opts: ParsingOptions = defaultParsingOptions): DateTime => fromRegexParse(parseRFC2822(input), opts);
export const tryFromRFC2822 = wrapError(fromRFC2822);

export const fromHTTP = (input: string, opts: ParsingOptions = defaultParsingOptions): DateTime => fromRegexParse(parseHTTPDate(input), opts);
export const tryFromHTTP = wrapError(fromHTTP);