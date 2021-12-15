import { dateTimeFormat, extract, getFormattingOpts} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, MeridiemFormatOpts, DateTime, FormatFirstArg, FormatSecondArg } from "../../types";

const listMeridiemsInternal = memo("meridiemList", (formatOpts: MeridiemFormatOpts) => {
  const dtf = meridiemDtf(formatOpts, utcInstance);

  // @ts-ignore
  const d = new Date(Date.UTC(2016, 6, 15));

  const iterable = formatOpts.width == "simple" ? [9, 13] : { length: 24 };

  const found = Array.from(iterable, (_, h) => {
    d.setUTCHours(h);
    return extract(d, dtf, "dayperiod");
  });

  return [...new Set(found)];
});

const meridiemDtf = (formatOpts: MeridiemFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const width = formatOpts?.width || "simple";

  const options: Intl.DateTimeFormatOptions =
    width == "simple"
      ? { hourCycle: "h12", timeStyle: "long" }
      : { hour: "numeric", hourCycle: "h12", dayPeriod: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone, );
};

export const formatMeridiem = (dt: DateTime, firstArg?: FormatFirstArg<MeridiemFormatOpts>, secondArg?: FormatSecondArg<MeridiemFormatOpts>): string => {
  const opts = getFormattingOpts(firstArg, secondArg);
  const dtf = meridiemDtf(opts, dt.zone);
  return extract(new Date(+dt), dtf, "dayperiod");
}

export const listMeridiems = (firstArg?: FormatFirstArg<MeridiemFormatOpts>, secondArg?: FormatSecondArg<MeridiemFormatOpts>): string[] => {
  const opts = getFormattingOpts(firstArg, secondArg);
  return listMeridiemsInternal(opts);
}
