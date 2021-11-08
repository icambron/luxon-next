import { extract, getDtf, getDtfArgs, getFormattingOpts} from "../util/format";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, FormatFirstArg, FormatSecondArg, MeridiemFormatOpts } from "../../types";

export const formatMeridiem = (
  firstArg?: FormatFirstArg<MeridiemFormatOpts>,
  secondArg?: FormatSecondArg<MeridiemFormatOpts>
): ((date: Date, zone: Zone) => string) => {
  const formatOpts = getFormattingOpts<MeridiemFormatOpts>(firstArg, secondArg);
  return (date, zone) => formatMeridiemsMemo(formatOpts)(date, zone);
};

export const listMeridiems = (
  firstArg?: FormatFirstArg<MeridiemFormatOpts>,
  secondArg?: FormatSecondArg<MeridiemFormatOpts>
): string[] => {
  const formatOpts = getFormattingOpts<MeridiemFormatOpts>(firstArg, secondArg);
  return listMeridiemsMemo(formatOpts);
};

export const formatMeridiemsMemo =
  (formatOpts: MeridiemFormatOpts): ((jsDate: Date, zone: Zone) => string) =>
  (d, zone) => {
    const dtf = meridiemDtf(formatOpts, zone);
    return extract(d, dtf, "dayperiod");
  };

const listMeridiemsMemo = memo("meridiemList", (formatOpts: MeridiemFormatOpts) => {
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
  return getDtf(getDtfArgs(formatOpts.locale, zone, { ...options, ...formatOpts }));
};
