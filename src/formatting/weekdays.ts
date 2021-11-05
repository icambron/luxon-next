import { FormatFirstArg, FormatSecondArg, WeekdayFormatOpts } from "../scatteredTypes/formatting";
import { utcInstance } from "../model/zones/fixedOffsetZone";
import { extract, getDtf, getDtfArgs, getFormattingArgs, hasKeys} from "./formatUtils";
import Zone from "../model/zone";
import { memo } from "../caching";

export const formatWeekday = (firstArg?: FormatFirstArg, secondArg?: FormatSecondArg | WeekdayFormatOpts, thirdArg?: WeekdayFormatOpts): ((date: Date, zone: Zone) => string) => {
  const [locale, opts, weekdayFormatOpts] = getFormattingArgs<WeekdayFormatOpts>(
    firstArg,
    secondArg,
    thirdArg,
    hasKeys("mode", "width")
  );
  return (date, zone) => formatWeekdayMemo(locale, opts, weekdayFormatOpts)(date, zone);
};

export const listWeekdays = (firstArg?: FormatFirstArg, secondArg?: FormatSecondArg | WeekdayFormatOpts, thirdArg?: WeekdayFormatOpts): string[] => {
  const [locale, opts, monthFormatOpts] = getFormattingArgs<WeekdayFormatOpts>(
    firstArg,
    secondArg,
    thirdArg,
    hasKeys("mode", "width")
  );
  return listWeekdaysMemo([locale, opts, monthFormatOpts]);
};

const weekdayDtf = (
  locale: string | undefined,
  zone: Zone,
  fmt: Intl.DateTimeFormatOptions | undefined,
  weekdayFormatOpts: WeekdayFormatOpts
): Intl.DateTimeFormat => {
  const mode = weekdayFormatOpts?.mode || "standalone";
  const width = weekdayFormatOpts?.width || "long";
  const options: Intl.DateTimeFormatOptions = mode === "format" ? { weekday: width, day: "numeric" } : { weekday: width };
  return getDtf(getDtfArgs(locale, zone, { ...options, ...fmt }));
};

const formatWeekdayMemo =
  (
    locale: string | undefined,
    fmt: Intl.DateTimeFormatOptions | undefined,
    weekdayFormatOpts: WeekdayFormatOpts
  ): ((jsDate: Date, zone: Zone) => string) =>
    (d, zone) => {
      const dtf = weekdayDtf(locale, zone, fmt, weekdayFormatOpts);
      return extract(d, dtf, "weekday");
    };


const listWeekdaysMemo = memo("weekdayList", ([locale, fmt, weekdayFormatOpts]: [
    string | undefined,
    Intl.DateTimeFormatOptions | undefined,
  WeekdayFormatOpts
]): string[] => {
  const dtf = weekdayDtf(locale, utcInstance, fmt, weekdayFormatOpts);

  const d = new Date(Date.UTC(2016, 10, 14, 12));
  return Array.from({ length: 7 }, (_, i) => {
    d.setUTCDate(14 + i);
    return extract(d, dtf, "weekday");
  });
});

