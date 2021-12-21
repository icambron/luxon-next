import { dateTimeFormat, extract, getFormattingOpts} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, MonthFormatOpts, FormatFirstArg, FormatSecondArg, DateTime } from "../../types";

const monthDtf = (formatOpts: Partial<MonthFormatOpts>, zone: Zone): Intl.DateTimeFormat => {
  const mode = formatOpts.mode || "standalone";
  const width = formatOpts.width || "long";
  const options: Intl.DateTimeFormatOptions = mode === "format" ? { month: width, day: "numeric" } : { month: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone, );
};

export const formatMonth = (dt: DateTime, locale?: FormatFirstArg<MonthFormatOpts>, opts?: FormatSecondArg<MonthFormatOpts>): string => {
  const formatOpts = getFormattingOpts(locale, opts);
  const dtf = monthDtf(formatOpts, dt.zone);
  return extract(dt.native(), dtf, "month");
};

export const listMonths = (locale?: FormatFirstArg<MonthFormatOpts>, opts?: FormatSecondArg<MonthFormatOpts>) => {
  const formatOpts = getFormattingOpts(locale, opts);

  return memo("monthList", (formatOpts: Partial<MonthFormatOpts>) => {
    const dtf = monthDtf(formatOpts, utcInstance);

    // @ts-ignore
    const d = new Date([2016, 6, 15]);
    return Array.from({ length: 12 }, (_, i) => {
      d.setMonth(i);
      return extract(d, dtf, "month");
    });
  })(formatOpts);
};
