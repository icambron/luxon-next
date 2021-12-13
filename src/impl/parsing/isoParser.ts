import { gregorianInstance } from "../calendars/gregorian";
import { ExtractedResult, combineRegexes, combineExtractors, parse, int, simpleParse } from "./regexParser";
import { isoWeekCalendarInstance } from "../calendars/isoWeek";
import { ordinalInstance } from "../calendars/ordinal";
import { parseMillis } from "../util/numeric";
import { fixedOffsetZone } from "../zone/fixedOffset";
import { signedOffset } from "../util/zoneUtils";

const offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/;
const isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
const isoTimeAndOffsetRegex = RegExp(`${isoTimeBaseRegex.source}${offsetRegex.source}?`);
const isoTimeExtensionRegex = RegExp(`(?:T${isoTimeAndOffsetRegex.source})?`);
const isoTimeCombinedRegex = combineRegexes(isoTimeAndOffsetRegex);

const isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
const isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
const isoOrdinalRegex = /(\d{4})-?(\d{3})/;

const isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
const isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
const isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);

const extractISOTime = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const item = {
    hour: int(match, cursor, 0),
    minute: int(match, cursor + 1, 0),
    second: int(match, cursor + 2, 0),
    millisecond: parseMillis(match[cursor + 3]),
  };

  return {
    calendar: null,
    calendarUnits: {},
    timeUnits: item,
    zone: null,
    cursor: cursor + 4,
  };
};

const extractISOOffset = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const local = !match[cursor] && !match[cursor + 1];
  const fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]);
  const zone = local ? null : fixedOffsetZone(fullOffset);
  return {
    calendar: null,
    calendarUnits: {},
    timeUnits: {},
    zone,
    cursor: cursor + 3,
  };
};
const extractISOYmd = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const item = {
    year: int(match, cursor, 1),
    month: int(match, cursor + 1, 1),
    day: int(match, cursor + 2, 1),
  };

  return {
    calendar: gregorianInstance,
    calendarUnits: item,
    timeUnits: {},
    zone: null,
    cursor: cursor + 3,
  };
};

const extractISOWeekData = simpleParse(isoWeekCalendarInstance, "weekYear", "weekNumber", "weekday");
const extractISOOrdinalData = simpleParse(ordinalInstance, "year", "ordinal");

const extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset);
const extractISOYmdTimeAndOffset = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset);
const extractISOWeekTimeAndOffset = combineExtractors(extractISOWeekData, extractISOTime, extractISOOffset);
const extractISOOrdinalDateAndTime = combineExtractors(extractISOOrdinalData, extractISOTime, extractISOOffset);

export const parseISODateTime = (s: string): ExtractedResult =>
  parse(
    s,
    { regex: isoYmdWithTimeExtensionRegex, extractor: extractISOYmdTimeAndOffset },
    { regex: isoWeekWithTimeExtensionRegex, extractor: extractISOWeekTimeAndOffset },
    { regex: isoOrdinalWithTimeExtensionRegex, extractor: extractISOOrdinalDateAndTime },
    { regex: isoTimeCombinedRegex, extractor: extractISOTimeAndOffset }
  );
