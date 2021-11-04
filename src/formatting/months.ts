import Zone from "../model/zone";
import { FormatFirstArg, MonthFormatOpts } from "../scatteredTypes/formatting";
import { utcInstance } from "../model/zones/fixedOffsetZone";
import { extract, getDtf, getDtfArgs, getFormattingArgs, hasKeys, memo } from "./formatUtils";

export const formatMonth = (firstArg?: FormatFirstArg, secondArg?: MonthFormatOpts): ((date: Date, zone: Zone) => string) => {
  const [locale, opts, monthFormatOpts] = getFormattingArgs<MonthFormatOpts>(
    firstArg,
    undefined,
    secondArg,
    hasKeys("mode", "width")
  );
  return (date, zone) => formatMonthMemo(locale, opts, monthFormatOpts)(date, zone);
};

export const listMonths = (firstArg?: FormatFirstArg, secondArg?: MonthFormatOpts): string[] => {
  const [locale, opts, monthFormatOpts] = getFormattingArgs<MonthFormatOpts>(
    firstArg,
    undefined,
    secondArg,
    hasKeys("mode", "width")
  );
  return listMonthsMemo([locale, opts, monthFormatOpts]);
};

const formatMonthMemo =
  (
    locale: string | undefined,
    fmt: Intl.DateTimeFormatOptions | undefined,
    monthFormatOpts: MonthFormatOpts
  ): ((jsDate: Date, zone: Zone) => string) =>
    (d, zone) => {
      const dtf = monthDtf(locale, zone, fmt, monthFormatOpts);
      return extract(d, dtf, "month");
    };

const listMonthsMemo = memo(
  ([locale, fmt, monthFormatOpts]: [
      string | undefined,
      Intl.DateTimeFormatOptions | undefined,
    MonthFormatOpts
  ]): string[] => {
    const dtf = monthDtf(locale, utcInstance, fmt, monthFormatOpts);

    // @ts-ignore
    const d = new Date([2016, 6, 15]);
    return Array.from({ length: 12 }, (_, i) => {
      d.setMonth(i);
      return extract(d, dtf, "month");
    });
  }
);

const monthDtf = (
  locale: string | undefined,
  zone: Zone,
  fmt: Intl.DateTimeFormatOptions | undefined,
  monthFormatOpts: MonthFormatOpts
): Intl.DateTimeFormat => {
  const mode = monthFormatOpts?.mode || "standalone";
  const width = monthFormatOpts?.width || "long";
  const options: Intl.DateTimeFormatOptions = mode === "format" ? { month: width, day: "numeric" } : { month: width };
  return getDtf(getDtfArgs(locale, zone, { ...options, ...fmt }));
};
