import { Calendar } from "../../types/calendar";
import { createIANAZone } from "../../model/zones/IANAZone";
import { InvalidArgumentError, NoMatchingParserPattern } from "../../errors";
import { englishMonthsShort } from "../../utils/english";
import { gregorianInstance } from "../../model/calendars/gregorian";
import { utcInstance } from "../../model/zones/fixedOffsetZone";
import Zone from "../../types/zone";
import { Time } from "../../types/time";
import { parseInteger } from "../../utils/numeric";
import { untruncateYear } from "../../utils/dateMath";
import { isNumber, isUndefined } from "../../utils/typeCheck";

// internal-only types
export type Cursor = number;

export interface ExtractedResult {
  calendar: Calendar<any> | null;
  calendarUnits: object;
  timeUnits: Partial<Time>;
  zone: Zone | null;
  cursor: Cursor;
}

export type Extractor = (match: RegExpMatchArray, cursor: Cursor) => ExtractedResult;

interface ParsingBlock {
  regex: RegExp;
  extractor: Extractor;
}

export const combineRegexes = (...regexes: RegExp[]): RegExp => {
  const full = regexes.reduce((f, r) => f + r.source, "");
  return RegExp(`^${full}$`);
};

export const combineExtractors = (...extractors: Extractor[]): Extractor => {
  return (m, cursor) =>
    extractors.reduce<ExtractedResult>(
      (merged, ex) => {
        const next = ex(m, merged.cursor);
        return {
          calendar: next.calendar || merged.calendar,
          calendarUnits: { ...merged.calendarUnits, ...next.calendarUnits },
          timeUnits: { ...merged.timeUnits, ...next.timeUnits },
          zone: next.zone || merged.zone,
          cursor: next.cursor,
        };
      },
      {
        calendar: null,
        calendarUnits: {},
        timeUnits: {},
        zone: null,
        cursor,
      }
    );
};

export const parse = (s: string, ...patterns: ParsingBlock[]): ExtractedResult => {
  if (isUndefined(s) || s == null) throw new InvalidArgumentError("No utils input provided");

  for (const { regex, extractor } of patterns) {
    const m = regex.exec(s);

    if (m) {
      return extractor(m, 1);
    }
  }

  throw new NoMatchingParserPattern(s);
};

export const int = (match: RegExpMatchArray, pos: number, fallback: number): number => {
  const m = match[pos];
  if (isUndefined(m)) return fallback;
  const parsed = parseInteger(m);
  return isNumber(parsed) ? parsed : fallback;
};

export const simpleParse = (cal: Calendar<any>, ...keys: Array<string>): Extractor => {
  return (match, cursor) => {
    const ret: any = {};
    let i;

    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = int(match, cursor + i, 1);
    }

    return {
      calendar: cal,
      calendarUnits: ret,
      timeUnits: {},
      cursor: cursor + i,
      zone: null,
    };
  };
};

export const fromStrings = (
  yearStr: string,
  monthStr: string,
  dayStr: string,
  hourStr: string,
  minuteStr: string,
  secondStr: string,
  cursor: number
): ExtractedResult => {
  const calendarUnits = {
    day: parseInteger(dayStr),
    year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
    month: englishMonthsShort.indexOf(monthStr) + 1,
  };

  const timeUnits: Partial<Time> = {
    hour: parseInteger(hourStr),
    minute: parseInteger(minuteStr),
  };

  if (secondStr) timeUnits.second = parseInteger(secondStr);

  return {
    calendar: gregorianInstance,
    calendarUnits,
    timeUnits,
    zone: utcInstance,
    cursor: cursor,
  };
};

export const extractIANAZone = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const zone = match[cursor] ? createIANAZone(match[cursor]) : null;
  return {
    calendar: null,
    calendarUnits: {},
    timeUnits: {},
    zone,
    cursor: cursor + 1,
  };
};
