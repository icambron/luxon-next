import { ExtractedResult, fromStrings, parse } from "./regexParser";

const rfc1123Regex =
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/;
const rfc850Regex =
  /^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/;
const asciiRegex =
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

const extractRFC1123Or850 = (match: RegExpMatchArray, cur: number): ExtractedResult => {
  const [, , dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match;
  return fromStrings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr, cur + 7);
};

const extractASCII = (match: RegExpMatchArray, cur: number): ExtractedResult => {
  const [, , monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match;
  return fromStrings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr, cur + 7);
};

export const parseHTTPDate = (s: string) => parse(
  s,
  { r: rfc1123Regex, ex: extractRFC1123Or850 },
  { r: rfc850Regex, ex: extractRFC1123Or850 },
  { r: asciiRegex, ex: extractASCII }
);
