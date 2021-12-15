import { Zone, Calendar, Time } from "../../types";
import { InvalidArgumentError, NoMatchingParserPattern } from "../../errors";
import { gregorianInstance } from "../calendars/gregorian";
import { parseInteger } from "../util/numeric";
import { untruncateYear } from "../util/dateMath";
import { utcInstance } from "../zone/fixedOffset";
import { ianaZone } from "../zone/iana";

// internal-only types
export type Cursor = number;

export interface ExtractedResult {
  cal: Calendar<any> | null;
  date: object;
  time: Partial<Time>;
  zone: Zone | null;
  cur: Cursor;
}

export type Extractor = (match: RegExpMatchArray, cur: Cursor) => ExtractedResult;

interface ParsingBlock {
  r: RegExp;
  ex: Extractor;
}

export const combineRegexes = (...regexes: RegExp[]): RegExp => {
  const full = regexes.reduce((f, r) => f + r.source, "");
  return RegExp(`^${full}$`);
};

export const combineExtractors = (...extractors: Extractor[]): Extractor =>
  (m, cur) =>
    extractors.reduce<ExtractedResult>(
      (merged, ex) => {
        const next = ex(m, merged.cur);
        return {
          cal: next.cal || merged.cal,
          date: { ...merged.date, ...next.date },
          time: { ...merged.time, ...next.time },
          zone: next.zone || merged.zone,
          cur: next.cur,
        };
      },
      {
        cal: null,
        date: {},
        time: {},
        zone: null,
        cur,
      }
    );

export const parse = (s: string, ...patterns: ParsingBlock[]): ExtractedResult => {
  if (typeof s == "undefined" || s == null) throw new InvalidArgumentError("No util input provided");

  for (const { r, ex } of patterns) {
    const m = r.exec(s);

    if (m) {
      return ex(m, 1);
    }
  }

  throw new NoMatchingParserPattern(s);
};

export const int = (match: RegExpMatchArray, pos: number, fallback: number): number => {
  const m = match[pos];
  if (typeof m == "undefined") return fallback;
  const parsed = parseInteger(m);
  return typeof parsed == "number" ? parsed : fallback;
};

export const simpleParse = (cal: Calendar<any>, ...keys: Array<string>): Extractor => {
  return (match, cursor) => {
    const ret: any = {};
    let i;

    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = int(match, cursor + i, 1);
    }

    return {
      cal: cal,
      date: ret,
      time: {},
      cur: cursor + i,
      zone: null,
    };
  };
};

export const fromStrings = (
  year: string,
  month: string,
  day: string,
  hour: string,
  minute: string,
  second: string,
  cur: number
): ExtractedResult => {
  const date = {
    day: parseInteger(day),
    year: year.length === 2 ? untruncateYear(parseInteger(year)) : parseInteger(year),
    month: englishMonthsShort.indexOf(month) + 1,
  };

  const time: Partial<Time> = {
    hour: parseInteger(hour),
    minute: parseInteger(minute),
  };

  if (second) time.second = parseInteger(second);

  return {
    cal: gregorianInstance,
    date,
    time,
    zone: utcInstance,
    cur: cur,
  };
};

export const extractIANAZone = (match: RegExpMatchArray, cur: number): ExtractedResult => {
  const zone = match[cur] ? ianaZone(match[cur]) : null;
  return {
    cal: null,
    date: {},
    time: {},
    zone,
    cur: cur + 1,
  };
};

const englishMonthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

