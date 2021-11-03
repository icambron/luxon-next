import { ExtractedResult, fromStrings, parse } from "./regexParser";

const rfc1123Regex =
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/;
const rfc850Regex =
  /^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/;
const asciiRegex =
  /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

const extractRFC1123Or850 = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const [, , dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match;
  return fromStrings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr, cursor + 7);
};

const extractASCII = (match: RegExpMatchArray, cursor: number): ExtractedResult => {
  const [, , monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match;
  return fromStrings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr, cursor + 7);
};

export function parseHTTPDate(s: string) {
  return parse(
    s,
    {regex: rfc1123Regex, extractor: extractRFC1123Or850},
    { regex: rfc850Regex, extractor: extractRFC1123Or850 },
    { regex: asciiRegex, extractor: extractASCII }
  );
}
