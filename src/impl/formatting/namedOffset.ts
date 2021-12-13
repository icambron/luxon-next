import {
  NamedOffsetFormatOpts,
  NumericOffsetFormatWidth,
  OffsetFormatOpts,
  Zone
} from "../../types";
import { dateTimeFormat, extract } from "../util/formatUtil";
import { formatNumericOffset } from "../zone/zone";
import { makeDtOptReader, toJs } from "./combinators";

const extractNamedOffset =
  (formatOpts: NamedOffsetFormatOpts): ((jsDate: Date, zone: Zone) => string) =>
    (d, zone) => {
      const dtf = offsetDtf(formatOpts, zone);
      return extract(d, dtf, "timezonename");
    };

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

export const formatOffset = makeDtOptReader<OffsetFormatOpts, string>((dt, opts) => {
  const width = opts.width || "short";
  return width === "short" || width === "long"
    ? toJs(dt, extractNamedOffset(opts as NamedOffsetFormatOpts))
    : formatNumericOffset(dt.offset, width as NumericOffsetFormatWidth)
  });

