import { durGet } from "../duration/core";
import { diff } from "../duration/diff";
import { durShiftTo } from "../duration/convert";
import { normalizeDurationUnit } from "../impl/duration";
import { getFullFormattingOpts, relativeFormatter } from "../impl/util/formatUtil";
import { roundTo } from "../impl/util/numeric";
import { DateTime, Duration, FormatFirstArg, FormatSecondArg, RelativeFormatOpts, RelativeUnit } from "../types";
import { startOf } from "./math";


const allUnits: RelativeUnit[] = ["years", "months", "days", "hours", "minutes", "seconds"];
const higherUnits: RelativeUnit[] = ["years", "quarters", "months", "days"];

const value = (dur: Duration, unit: RelativeUnit, precision: number): number => {
  const val = durGet(dur, unit);
  return roundTo(val, precision, true);
}

const getOpts = (locale: FormatFirstArg<RelativeFormatOpts>, format: FormatSecondArg<RelativeFormatOpts>): RelativeFormatOpts => {
  const baseOpts = getFullFormattingOpts(locale, format, { roundTo: 0, units: allUnits });
  if (baseOpts.units) {
  // Duration units can be milliseconds, but I know normalizeDurationUnit won't add it, so we just cast here
    baseOpts.units = baseOpts.units.map(u => normalizeDurationUnit(u) as RelativeUnit);
  }

  return baseOpts;
}

const biggestQualified = (dur: Duration, threshold: number, precision: number): RelativeUnit | undefined =>
  allUnits.find(unit => Math.abs(value(dur, unit, precision)) > threshold);

const findBiggestUnit = (start: DateTime, end: DateTime, threshold: number, precision: number, units: RelativeUnit[]): [Duration, RelativeUnit] => {
  const dur = diff(end, start, units);
  const biggestUnit = biggestQualified(dur, threshold, precision) || units[units.length - 1];
  return [dur, biggestUnit];
}

const diffDays = (start: DateTime, end: DateTime) => {
  const shiftedStart = startOf(start, "day");
  const shiftedEnd = startOf(end, "day");
  return diff(shiftedEnd, shiftedStart, "days");
}

export const toRelative = (start: DateTime, end: DateTime, locale?: FormatFirstArg<RelativeFormatOpts>, format?: FormatSecondArg<RelativeFormatOpts>): string => {
  const opts = getOpts(locale, format);
  
  const [dur, biggestUnit] = findBiggestUnit(start, end, 0, opts.roundTo, opts.units);
  const retaken = durShiftTo(dur, [biggestUnit]);
  const val = value(retaken, biggestUnit, opts.roundTo);

  return relativeFormatter(opts).format(val, biggestUnit);
}

export const toRelativeHuman = (start: DateTime, end: DateTime, locale?: FormatFirstArg<RelativeFormatOpts>, format?: FormatSecondArg<RelativeFormatOpts>): string => {
  let opts = getOpts(locale, format);
  const higherOrderOnly = opts.units.filter(u => higherUnits.includes(u));

  // find a high-order unit with at least one
  let [highOrderDur, highOrderUnit] = findBiggestUnit(start, end, 0.999, opts.roundTo, higherOrderOnly);

  // days have slightly different logic:
  // 1. We won't call something tomorrow unless it's at least a few hours away. I went with 12
  // 2. But it doesn't have to be a full day away before we say tomorrow.
  // ...at least in en-US. Let's hope this generalizes!
  if (highOrderUnit === "days") {
    if (Math.abs(durGet(highOrderDur, "days")) < 0.5) { // a magic number. Switch to hours below this
      return toRelative(start, end, opts);
    }

    // otherwise find out if the calendar day changed
    highOrderDur = diffDays(start, end);
    opts = {...opts, numeric: "auto" };
  }

  const shifted = durShiftTo(highOrderDur, [highOrderUnit]);
  const val = value(shifted, highOrderUnit, opts.roundTo);
  return relativeFormatter(opts).format(val, highOrderUnit);
}
