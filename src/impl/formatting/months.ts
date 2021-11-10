import { dateTimeFormat, extract} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, MonthFormatOpts } from "../../types";

export const extractMonth =
  (formatOpts: MonthFormatOpts): ((jsDate: Date, zone: Zone) => string) =>
  (d, zone) => {
    const dtf = monthDtf(formatOpts, zone);
    return extract(d, dtf, "month");
  };

export const listMonths = memo("monthList", (formatOpts: MonthFormatOpts) => {
  const dtf = monthDtf(formatOpts, utcInstance);

  // @ts-ignore
  const d = new Date([2016, 6, 15]);
  return Array.from({ length: 12 }, (_, i) => {
    d.setMonth(i);
    return extract(d, dtf, "month");
  });
});

const monthDtf = (formatOpts: MonthFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const mode = formatOpts.mode || "standalone";
  const width = formatOpts.width || "long";
  const options: Intl.DateTimeFormatOptions = mode === "format" ? { month: width, day: "numeric" } : { month: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone, );
};
