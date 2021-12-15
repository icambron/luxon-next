import { dateTimeFormat, extract, getFormattingOpts} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, WeekdayFormatOpts, DateTime, FormatFirstArg, FormatSecondArg } from "../../types";

const weekdayDtf = (formatOpts: WeekdayFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const mode = formatOpts.mode || "standalone";
  const width = formatOpts.width || "long";
  const options: Intl.DateTimeFormatOptions =
    mode === "format" ? { weekday: width, day: "numeric" } : { weekday: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone);
};

const listWeekdaysInternal = memo("weekdayList", (formatOpts: WeekdayFormatOpts) => {
  const dtf = weekdayDtf(formatOpts, utcInstance);

  const d = new Date(Date.UTC(2016, 10, 14, 12));
  return Array.from({ length: 7 }, (_, i) => {
    d.setUTCDate(14 + i);
    return extract(d, dtf, "weekday");
  });
});

export const formatWeekday = (dt: DateTime, firstArg?: FormatFirstArg<WeekdayFormatOpts>, secondArg?: FormatSecondArg<WeekdayFormatOpts>): string => {
  const opts = getFormattingOpts(firstArg, secondArg);
  const dtf = weekdayDtf(opts, dt.zone);
  return extract(new Date(+dt), dtf, "weekday");
}

export const listWeekdays = (firstArg?: FormatFirstArg<WeekdayFormatOpts>, secondArg?: FormatSecondArg<WeekdayFormatOpts>): string[] => {
  const opts = getFormattingOpts(firstArg, secondArg);
  return listWeekdaysInternal(opts);
}
