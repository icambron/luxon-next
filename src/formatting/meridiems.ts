import Zone from "../model/zone";
import { extract, getDtf, getDtfArgs, getFormattingArgs, hasKeys} from "./formatUtils";
import { FormatFirstArg, FormatSecondArg, MeridiemFormatOpts } from "../scatteredTypes/formatting";
import { utcInstance } from "../model/zones/fixedOffsetZone";
import { memo } from "../caching";

export const formatMeridiem = (firstArg?: FormatFirstArg, secondArg?: FormatSecondArg | MeridiemFormatOpts, thirdArg?: MeridiemFormatOpts): ((date: Date, zone: Zone) => string) => {
  const [locale, opts, meridiemFormatOpts] = getFormattingArgs<MeridiemFormatOpts>(
    firstArg,
    secondArg,
    thirdArg,
    hasKeys("mode", "width")
  );
  return (date, zone) => formatMeridiemsMemo(locale, opts, meridiemFormatOpts)(date, zone);
};

export const listMeridiems = (firstArg?: FormatFirstArg, secondArg?: FormatSecondArg | MeridiemFormatOpts, thirdArg?: MeridiemFormatOpts): string[] => {
  const [locale, opts, meridiemsFormatOpts] = getFormattingArgs<MeridiemFormatOpts>(
    firstArg,
    secondArg,
    thirdArg,
    hasKeys("mode", "width")
  );
  return listMeridiemsMemo([locale, opts, meridiemsFormatOpts]);
};

export const formatMeridiemsMemo = (locale: string | undefined,
                                    fmt: Intl.DateTimeFormatOptions | undefined,
                                    meridiemFormatOpts: MeridiemFormatOpts): ((jsDate: Date, zone: Zone) => string) =>
  (d, zone) => {
    const dtf = meridiemDtf(locale, zone, fmt, meridiemFormatOpts);
    return extract(d, dtf, "dayperiod");
  };

const listMeridiemsMemo = memo("meridiemList", ([locale, fmt, meridiemsFormatOpts]: [
    string | undefined,
    Intl.DateTimeFormatOptions | undefined,
  MeridiemFormatOpts
]): string[] => {
  const dtf = meridiemDtf(locale, utcInstance, fmt, meridiemsFormatOpts);

  // @ts-ignore
  const d = new Date(Date.UTC(2016, 6, 15));

  const iterable = (!meridiemsFormatOpts || meridiemsFormatOpts.width) == "simple" ? [9, 13] : { length: 24 };

  const found = Array.from(iterable, (_, h) => {
    d.setUTCHours(h);
    return extract(d, dtf, "dayperiod");
  });

  return [...new Set(found)];
});

const meridiemDtf = (
  locale: string | undefined,
  zone: Zone,
  fmt: Intl.DateTimeFormatOptions | undefined,
  meridiemFormatOpts: MeridiemFormatOpts
): Intl.DateTimeFormat => {
  const width = meridiemFormatOpts?.width || "simple";

  const options: Intl.DateTimeFormatOptions = width == "simple" ?
    { hourCycle: "h12", timeStyle: "long"}
    : { hour: "numeric", hourCycle: "h12", dayPeriod: width }
  return getDtf(getDtfArgs(locale, zone, { ...options, ...fmt }));
};
