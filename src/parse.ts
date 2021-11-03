import Zone, { Zoneish } from "./model/zone";
import { parseISODateTime } from "./parsing/isoParser";
import { DateTime, fromCalendar, normalizeZone } from "./model/dateTime";
import { gregorianInstance } from "./model/calendars/gregorian";
import { setZone } from "./dateTime/zone";
import { ExtractedResult } from "./parsing/regexParser";
import { parseRFC2822 } from "./parsing/rfc2822Parser";
import { parseHTTPDate } from "./parsing/httpParser";

const fromRegexParse = (extracted: ExtractedResult, zone?: Zoneish): DateTime => {
  const calendar = extracted.calendar || gregorianInstance;
  const conversionZone = zone ? normalizeZone(zone) : null;
  const interpretationZone: Zone = extracted.zone || conversionZone || normalizeZone(zone);
  const provisional = fromCalendar(calendar, {...extracted.calendarUnits, ...extracted.timeUnits}, interpretationZone);
  return interpretationZone == conversionZone ? provisional : setZone(conversionZone)(provisional);
}

const wrapError = (fn: (input: string, zone?: Zoneish) => DateTime ): (i: string, z?: Zoneish) => DateTime | null =>
  (i, z) => {
    try {
      return fn(i, z);
    } catch (e) {
      return null;
    }
  };

export const fromISO = (iso: string, zone?: Zoneish): DateTime => fromRegexParse(parseISODateTime(iso), zone);
export const tryFromISO = wrapError(fromISO);

export const fromRFC2822 = (input: string, zone?: Zoneish): DateTime => fromRegexParse(parseRFC2822(input), zone);
export const tryFromRFC2822 = wrapError(fromRFC2822);

export const fromHTTP = (input: string, zone?: Zoneish): DateTime => fromRegexParse(parseHTTPDate(input), zone);
export const tryFromHTTP = wrapError(fromHTTP);