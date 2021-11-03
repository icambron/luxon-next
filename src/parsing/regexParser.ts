import { Calendar } from "../model/calendar";
import Zone from "../model/zone";
import { isNumber, isUndefined, parseInteger } from "../impl/util";
import { createIANAZone } from "../model/zones/IANAZone";
import { InvalidArgumentError, NoMatchingParserPattern } from "../model/errors";

export type Cursor = number;

export interface ExtractedResult {
  calendar: Calendar<any> | null;
  calendarUnits: object;
  timeUnits: object;
  zone: Zone | null
  cursor: Cursor;
}

export type Extractor = (match: RegExpMatchArray, cursor: Cursor) => ExtractedResult;

interface ParsingBlock {
  regex: RegExp,
  extractor: Extractor
}

export const combineRegexes = (...regexes: RegExp[]): RegExp => {
  const full = regexes.reduce((f, r) => f + r.source, "");
  return RegExp(`^${full}$`);
};

export const combineExtractors = (...extractors: Extractor[]) : Extractor => {
  return (m, cursor) =>
    extractors.reduce<ExtractedResult>((merged, ex) => {
      const next = ex(m, merged.cursor);
      return {
        calendar: next.calendar || merged.calendar,
        calendarUnits: { ...merged.calendarUnits, ...next.calendarUnits},
        timeUnits: {...merged.timeUnits, ...next.timeUnits},
        zone: next.zone || merged.zone,
        cursor: next.cursor
      };
    }, {
      calendar: null,
      calendarUnits: {},
      timeUnits: {},
      zone: null,
      cursor
    });
};

export const parse = (s: string, ...patterns: ParsingBlock[]): ExtractedResult => {
  if (isUndefined(s) || s == null) throw new InvalidArgumentError("No parse input provided");

  for (const { regex, extractor } of patterns) {
    const m = regex.exec(s);

    if (m) {
      return extractor(m, 1);
    }
  }

  throw new NoMatchingParserPattern(s);
}

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
      zone: null
    };
  };
}

export const extractIANAZone = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const zone = match[cursor] ? createIANAZone(match[cursor]) : null;
  return {
    calendar: null,
    calendarUnits: {},
    timeUnits: {},
    zone,
    cursor: cursor + 1
  }
};
