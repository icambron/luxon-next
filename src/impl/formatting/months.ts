import { dateTimeFormat, extract, getFormattingOpts} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, MonthFormatOpts, FormatFirstArg, FormatSecondArg, DateTime } from "../../types";

const monthDtf = (formatOpts: MonthFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const mode = formatOpts.mode || "standalone";
  const width = formatOpts.width || "long";
  const options: Intl.DateTimeFormatOptions = mode === "format" ? { month: width, day: "numeric" } : { month: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone, );
};

export const formatMonth = (dt: DateTime, firstArg?: FormatFirstArg<MonthFormatOpts>, secondArg?: FormatSecondArg<MonthFormatOpts>): string => {
  const opts = getFormattingOpts(firstArg, secondArg);
  const dtf = monthDtf(opts, dt.zone);
  return extract(dt.native(), dtf, "month");
};

export const listMonths = (firstArg?: FormatFirstArg<MonthFormatOpts>, secondArg?: FormatSecondArg<MonthFormatOpts>) => {
  const opts = getFormattingOpts(firstArg, secondArg);

  return memo("monthList", (formatOpts: MonthFormatOpts) => {
    const dtf = monthDtf(formatOpts, utcInstance);

    // @ts-ignore
    const d = new Date([2016, 6, 15]);
    return Array.from({ length: 12 }, (_, i) => {
      d.setMonth(i);
      return extract(d, dtf, "month");
    });
  })(opts);
};
