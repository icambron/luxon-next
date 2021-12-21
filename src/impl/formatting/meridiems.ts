import { dateTimeFormat, extract, getFormattingOpts} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, MeridiemFormatOpts, DateTime, FormatFirstArg, FormatSecondArg } from "../../types";

const meridiemDtf = (formatOpts: MeridiemFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const width = formatOpts?.width || "simple";

  const options: Intl.DateTimeFormatOptions =
    width == "simple"
      ? { hourCycle: "h12", timeStyle: "long" }
      : { hour: "numeric", hourCycle: "h12", dayPeriod: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone, );
};

export const formatMeridiem = (dt: DateTime, locale?: FormatFirstArg<MeridiemFormatOpts>, opts?: FormatSecondArg<MeridiemFormatOpts>): string => {
  const formatOpts = getFormattingOpts(locale, opts);
  const dtf = meridiemDtf(formatOpts, dt.zone);
  return extract(dt.native(), dtf, "dayperiod");
}

export const listMeridiems = (locale?: FormatFirstArg<MeridiemFormatOpts>, opts?: FormatSecondArg<MeridiemFormatOpts>): string[] => {
  const formatOpts = getFormattingOpts(locale, opts);

  return memo("meridiemList", (formatOpts: MeridiemFormatOpts) => {
    const dtf = meridiemDtf(formatOpts, utcInstance);

    // @ts-ignore
    const d = new Date(Date.UTC(2016, 6, 15));

    const iterable = formatOpts.width == "simple" ? [9, 13] : { length: 24 };

    const found = Array.from(iterable, (_, h) => {
      d.setUTCHours(h);
      return extract(d, dtf, "dayperiod");
    });

    return [...new Set(found)];
  })(formatOpts);
}
