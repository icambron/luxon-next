import { extract, getDtf, getDtfArgs, getFormattingOpts, hasKeys } from "../util/format";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, FormatFirstArg, FormatSecondArg, WeekdayFormatOpts } from "../../types";

export const formatWeekday = (
  firstArg?: FormatFirstArg<WeekdayFormatOpts>,
  secondArg?: FormatSecondArg<WeekdayFormatOpts>
): ((date: Date, zone: Zone) => string) => {
  const formatOpts = getFormattingOpts<WeekdayFormatOpts>(firstArg, secondArg);
  return (date, zone) => formatWeekdayMemo(formatOpts)(date, zone);
};

export const listWeekdays = (
  firstArg?: FormatFirstArg<WeekdayFormatOpts>,
  secondArg?: FormatSecondArg<WeekdayFormatOpts>
): string[] => {
  const formatOpts = getFormattingOpts<WeekdayFormatOpts>(firstArg, secondArg);
  return listWeekdaysMemo(formatOpts);
};

const weekdayDtf = (formatOpts: WeekdayFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const mode = formatOpts.mode || "standalone";
  const width = formatOpts.width || "long";
  const options: Intl.DateTimeFormatOptions =
    mode === "format" ? { weekday: width, day: "numeric" } : { weekday: width };
  return getDtf(getDtfArgs(formatOpts.locale, zone, { ...options, ...formatOpts }));
};

const formatWeekdayMemo =
  (formatOpts: WeekdayFormatOpts): ((jsDate: Date, zone: Zone) => string) =>
  (d, zone) => {
    const dtf = weekdayDtf(formatOpts, zone);
    return extract(d, dtf, "weekday");
  };

const listWeekdaysMemo = memo("weekdayList", (formatOpts: WeekdayFormatOpts) => {
  const dtf = weekdayDtf(formatOpts, utcInstance);

  const d = new Date(Date.UTC(2016, 10, 14, 12));
  return Array.from({ length: 7 }, (_, i) => {
    d.setUTCDate(14 + i);
    return extract(d, dtf, "weekday");
  });
});