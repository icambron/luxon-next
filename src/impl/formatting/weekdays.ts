import { dateTimeFormat, extract, getFormattingOpts} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcZone } from "../zone/fixedOffset";
import { Zone, WeekdayFormatOpts, DateTime, FormatFirstArg, FormatSecondArg } from "../../types";

const weekdayDtf = (formatOpts: Partial<WeekdayFormatOpts>, zone: Zone): Intl.DateTimeFormat => {
  const mode = formatOpts.mode || "standalone";
  const width = formatOpts.width || "long";
  const options: Intl.DateTimeFormatOptions =
    mode === "format" ? { weekday: width, day: "numeric" } : { weekday: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone);
};

export const formatWeekday = (dt: DateTime, locale?: FormatFirstArg<WeekdayFormatOpts>, opts?: FormatSecondArg<WeekdayFormatOpts>): string => {
  const formatOpts = getFormattingOpts(locale, opts);
  const dtf = weekdayDtf(formatOpts, dt.zone);
  return extract(dt.native(), dtf, "weekday");
}

export const listWeekdays = (locale?: FormatFirstArg<WeekdayFormatOpts>, opts?: FormatSecondArg<WeekdayFormatOpts>): string[] => {
  const formatOpts = getFormattingOpts(locale, opts);

  return memo("weekdayList", (formatOpts: Partial<WeekdayFormatOpts>) => {
    const dtf = weekdayDtf(formatOpts, utcZone);

    const d = new Date(Date.UTC(2016, 10, 14, 12));
    return Array.from({ length: 7 }, (_, i) => {
      d.setUTCDate(14 + i);
      return extract(d, dtf, "weekday");
    });
  })(formatOpts);
}
