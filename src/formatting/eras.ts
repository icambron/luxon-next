import Zone from "../model/zone";
import { EraFormatOpts, FormatFirstArg } from "../scatteredTypes/formatting";
import { utcInstance } from "../model/zones/fixedOffsetZone";
import { extract, getDtf, getDtfArgs, getFormattingArgs, hasKeys, memo } from "./formatUtils";

export const formatEra = (firstArg?: FormatFirstArg, secondArg?: EraFormatOpts): ((date: Date, zone: Zone) => string) => {
  const [locale, opts, eraFormatOpts] = getFormattingArgs<EraFormatOpts>(
    firstArg,
    undefined,
    secondArg,
    hasKeys("mode", "width")
  );
  return (date, zone) => formatEraMemo(locale, opts, eraFormatOpts)(date, zone);
};

export const listEras = (firstArg?: FormatFirstArg, secondArg?: EraFormatOpts): string[] => {
  const [locale, opts, eraFormatOpts] = getFormattingArgs<EraFormatOpts>(
    firstArg,
    undefined,
    secondArg,
    hasKeys("mode", "width")
  );
  return listErasMemo([locale, opts, eraFormatOpts]);
};

const formatEraMemo =
  (
    locale: string | undefined,
    fmt: Intl.DateTimeFormatOptions | undefined,
    eraFormatOpts: EraFormatOpts
  ): ((jsDate: Date, zone: Zone) => string) =>
    (d, zone) => {
      const dtf = eraDtf(locale, zone, fmt, eraFormatOpts);
      return extract(d, dtf, "era");
    };

const listErasMemo = memo(
  ([locale, fmt, eraFormatOpts]: [
      string | undefined,
      Intl.DateTimeFormatOptions | undefined,
    EraFormatOpts
  ]): string[] => {
    const dtf = eraDtf(locale, utcInstance, fmt, eraFormatOpts);

    // @ts-ignore
    const d = new Date([2016, 6, 15]);
    return [-40, 2017].map(year => {
      d.setFullYear(year);
      return extract(d, dtf, "era");
    });
  }
);

const eraDtf = (
  locale: string | undefined,
  zone: Zone,
  fmt: Intl.DateTimeFormatOptions | undefined,
  eraFormatOpts: EraFormatOpts
): Intl.DateTimeFormat => {
  const width = eraFormatOpts?.width || "short";
  const options: Intl.DateTimeFormatOptions = { year: "numeric", era: width }
  return getDtf(getDtfArgs(locale, zone, { ...options, ...fmt }));
};
