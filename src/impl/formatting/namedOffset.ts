import {
    DateTime,
    FormatFirstArg,
  FormatSecondArg,
  NamedOffsetFormatOpts,
  NumericOffsetFormatWidth,
  OffsetFormatOpts,
  Zone
} from "../../types";
import { dateTimeFormat, extract, getFormattingOpts } from "../util/formatUtil";
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
  const formatOpts = getFormattingOpts(locale, opts);
  
  const width = formatOpts.width || "short";

  if (width === "short" || width === "long") {
    const dtf = offsetDtf(formatOpts as NamedOffsetFormatOpts, dt.zone);
    return extract(dt.native(), dtf, "timezonename");
  }

  return formatNumericOffset(dt.offset, width as NumericOffsetFormatWidth);
};
