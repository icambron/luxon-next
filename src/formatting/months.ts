import Zone from "../model/zone";
import { FormatFirstArg, FormatSecondArg, MonthFormatOpts } from "../scatteredTypes/formattingAndParsing";
import { utcInstance } from "../model/zones/fixedOffsetZone";
import { extract, getDtf, getDtfArgs, getFormattingOpts, hasKeys} from "./formatUtils";
import { memo } from "../caching";

export const formatMonth = (firstArg?: FormatFirstArg<MonthFormatOpts>, secondArg?: FormatSecondArg<MonthFormatOpts>): ((date: Date, zone: Zone) => string) => {
  const formatOpts = getFormattingOpts<MonthFormatOpts>(firstArg, secondArg);
  return (date, zone) => formatMonthMemo(formatOpts)(date, zone);
};

export const listMonths = (firstArg?: FormatFirstArg<MonthFormatOpts>, secondArg?: FormatSecondArg<MonthFormatOpts>): string[] => {
  const formatOpts = getFormattingOpts<MonthFormatOpts>(firstArg, secondArg);
  return listMonthsMemo(formatOpts);
};

const formatMonthMemo = (formatOpts: MonthFormatOpts): ((jsDate: Date, zone: Zone) => string) =>
    (d, zone) => {
      const dtf = monthDtf(formatOpts, zone);
      return extract(d, dtf, "month");
    };

const listMonthsMemo = memo("monthList", (formatOpts: MonthFormatOpts) => {
  const dtf = monthDtf(formatOpts, utcInstance);

  // @ts-ignore
  const d = new Date([2016, 6, 15]);
  return Array.from({ length: 12 }, (_, i) => {
    d.setMonth(i);
    return extract(d, dtf, "month");
  });
});

const monthDtf = (
  formatOpts: MonthFormatOpts,
  zone: Zone,
): Intl.DateTimeFormat => {
  const mode = formatOpts.mode || "standalone";
  const width = formatOpts.width || "long";
  const options: Intl.DateTimeFormatOptions = mode === "format" ? { month: width, day: "numeric" } : { month: width };
  const dtfArgs = getDtfArgs(formatOpts.locale, zone, { ...options, ...formatOpts });
  return getDtf(dtfArgs);
};
