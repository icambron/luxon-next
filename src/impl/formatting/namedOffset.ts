import {
    DateTime,
    FormatFirstArg,
  FormatSecondArg,
  NamedOffsetFormatOpts,
  OffsetFormatOpts,
  Zone
} from "../../types";
import { dateTimeFormat, extract, getFullFormattingOpts } from "../util/formatUtil";
import { formatNumericOffset } from "../util/zoneUtils";

const offsetDtf = (formatOpts: NamedOffsetFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const width = formatOpts.width || "short";
  const options: Intl.DateTimeFormatOptions =  {
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: width
  };

  return dateTimeFormat({ ...options, ...formatOpts }, zone);
};

export const formatOffset = (dt: DateTime, locale?: FormatFirstArg<OffsetFormatOpts>, opts?: FormatSecondArg<OffsetFormatOpts>): string => {
  const formatOpts = getFullFormattingOpts(locale, opts, { width: "short" });

  if (["narrow", "standard", "techie"].includes(formatOpts.width)) {
    return formatNumericOffset(dt.offset, formatOpts.width);
  }

  // leaving the set of widths you can provide open-ended in order to support new upcoming ones like
  // "longOffset" and "shortGeneric"
  const dtf = offsetDtf(formatOpts as NamedOffsetFormatOpts, dt.zone);
  return extract(dt.native(), dtf, "timezonename");

};
