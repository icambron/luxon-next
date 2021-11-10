import { dateTimeFormat, extract} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, WeekdayFormatOpts } from "../../types";

const weekdayDtf = (formatOpts: WeekdayFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const mode = formatOpts.mode || "standalone";
  const width = formatOpts.width || "long";
  const options: Intl.DateTimeFormatOptions =
    mode === "format" ? { weekday: width, day: "numeric" } : { weekday: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone);
};

export const extractWeekday =
  (formatOpts: WeekdayFormatOpts): ((jsDate: Date, zone: Zone) => string) =>
  (d, zone) => {
    const dtf = weekdayDtf(formatOpts, zone);
    return extract(d, dtf, "weekday");
  };

export const listWeekdays = memo("weekdayList", (formatOpts: WeekdayFormatOpts) => {
  const dtf = weekdayDtf(formatOpts, utcInstance);

  const d = new Date(Date.UTC(2016, 10, 14, 12));
  return Array.from({ length: 7 }, (_, i) => {
    d.setUTCDate(14 + i);
    return extract(d, dtf, "weekday");
  });
});
