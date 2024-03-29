import { gregorianInstance } from "../calendars/gregorian";
import { DateTimeExtractedResult, combineRegexes, combineDateTimeExtractors, parse, int, simpleParse } from "./regexParser";
import { isoWeekCalendarInstance } from "../calendars/isoWeek";
import { ordinalInstance } from "../calendars/ordinal";
import { parseMillis } from "../util/numeric";
import { fixedOffsetZone } from "../zone/fixedOffset";
import { signedOffset } from "../util/zoneUtils";

const offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/;
const isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
const isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);

const isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
const isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
const isoOrdinalRegex = /(\d{4})-?(\d{3})/;

const extractISOTime = (match: RegExpMatchArray, cursor: number): DateTimeExtractedResult => {
  const item = {
    hour: int(match, cursor, 0),
    minute: int(match, cursor + 1, 0),
    second: int(match, cursor + 2, 0),
    millisecond: parseMillis(match[cursor + 3]),
  };

  return {
    cal: null,
    date: {},
    time: item,
    zone: null,
    cur: cursor + 4,
  };
};

const extractISOOffset = (match: RegExpMatchArray, cursor: number): DateTimeExtractedResult => {
  const local = !match[cursor] && !match[cursor + 1];
  const fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]);
  const zone = local ? null : fixedOffsetZone(fullOffset);
  return {
    cal: null,
    date: {},
    time: {},
    zone,
    cur: cursor + 3,
  };
};
const extractISOYmd = (match: RegExpMatchArray, cursor: number): DateTimeExtractedResult => {
  const item = {
    year: int(match, cursor, 1),
    month: int(match, cursor + 1, 1),
    day: int(match, cursor + 2, 1),
  };

  return {
    cal: gregorianInstance,
    date: item,
    time: {},
    zone: null,
    cur: cursor + 3,
  };
};

const extractISOWeekData = simpleParse(isoWeekCalendarInstance, "weekYear", "weekNumber", "weekday");
const extractISOOrdinalData = simpleParse(ordinalInstance, "year", "ordinal");

const extractISOTimeAndOffset = combineDateTimeExtractors(extractISOTime, extractISOOffset);
const extractISOYmdTimeAndOffset = combineDateTimeExtractors(extractISOYmd, extractISOTime, extractISOOffset);
const extractISOWeekTimeAndOffset = combineDateTimeExtractors(extractISOWeekData, extractISOTime, extractISOOffset);
const extractISOOrdinalDateAndTime = combineDateTimeExtractors(extractISOOrdinalData, extractISOTime, extractISOOffset);

export const parseISOTime = (s: string): DateTimeExtractedResult =>
  parse(s, { r: isoTimeOnly, ex: extractISOTime });

export const parseISODateTime = (s: string): DateTimeExtractedResult => {
  const isoTimeAndOffsetRegex = RegExp(`${isoTimeBaseRegex.source}${offsetRegex.source}?`)
  const isoTimeExtensionRegex = RegExp(`(?:T${isoTimeAndOffsetRegex.source})?`);
  return parse(
    s,
    { r: combineRegexes(isoYmdRegex, isoTimeExtensionRegex), ex: extractISOYmdTimeAndOffset },
    { r: combineRegexes(isoWeekRegex, isoTimeExtensionRegex), ex: extractISOWeekTimeAndOffset },
    { r: combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex), ex: extractISOOrdinalDateAndTime },
    { r: combineRegexes(isoTimeAndOffsetRegex), ex: extractISOTimeAndOffset }
  );
}
