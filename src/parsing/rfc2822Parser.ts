// RFC 2822/5322
import { signedOffset } from "../lib/util";
import { fixedOffsetZone } from "../model/zones/fixedOffsetZone";
import { ExtractedResult, fromStrings, parse } from "./regexParser";

// These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
// and not just that we're in -240 *right now*. But since I don't think these are used that often
// I'm just going to ignore that
const obsOffsets: {[key: string]: number} = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60,
};

const rfc2822 =
  /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;

const computeOffset = (obsOffset: string, milOffset: string, offHourStr: string, offMinuteStr: string): number => {
  if (obsOffset) {
    return obsOffsets[obsOffset];
  } else if (milOffset) {
    return 0;
  } else {
    return signedOffset(offHourStr, offMinuteStr);
  }
}

const extractRFC2822 = (match: RegExpMatchArray, _: number): ExtractedResult => {
  const [
      ,
      ,
      dayStr,
      monthStr,
      yearStr,
      hourStr,
      minuteStr,
      secondStr,
      obsOffset,
      milOffset,
      offHourStr,
      offMinuteStr,
    ] = match;

  const result = fromStrings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr, 0); // ignore cursor
  result.zone = fixedOffsetZone(computeOffset(obsOffset, milOffset, offHourStr, offMinuteStr));
  return result;
};

// Remove comments and folding whitespace and replace multiple-spaces with a single space
const preprocessRFC2822 = (s: string): string =>
  s
    .replace(/\([^)]*\)|[\n\t]/g, " ")
    .replace(/(\s\s+)/g, " ")
    .trim();

export const parseRFC2822 = (s: string) => parse(preprocessRFC2822(s), {regex: rfc2822, extractor: extractRFC2822});
