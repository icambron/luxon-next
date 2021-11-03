import Zone, { Zoneish } from "./model/zone";
import { parseISODateTime } from "./parsing/isoParser";
import { DateTime, fromCalendar, normalizeZone } from "./model/dateTime";
import { gregorianInstance } from "./model/calendars/gregorian";
import { setZone } from "./dateTime/zone";
import { ExtractedResult } from "./parsing/regexParser";

const fromRegexParse = (extracted: ExtractedResult, zone?: Zoneish): DateTime => {
  const calendar = extracted.calendar || gregorianInstance;
  const conversionZone = zone ? normalizeZone(zone) : null;
  const interpretationZone: Zone = extracted.zone || conversionZone || normalizeZone(zone);
  const provisional = fromCalendar(calendar, {...extracted.calendarUnits, ...extracted.timeUnits}, interpretationZone);
  return interpretationZone == conversionZone ? provisional : setZone(conversionZone)(provisional);
}

export const fromISO = (iso: string, zone?: Zoneish): DateTime => fromRegexParse(parseISODateTime(iso), zone)
