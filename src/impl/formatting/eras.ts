import { dateTimeFormat, extract, getFormattingOpts} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, EraFormatOpts, FormatFirstArg, DateTime, FormatSecondArg} from "../../types";

const eraDtf = (formatOpts: Partial<EraFormatOpts>, zone: Zone): Intl.DateTimeFormat => {
  const width = formatOpts.width || "short";
  const options: Intl.DateTimeFormatOptions = { year: "numeric", era: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone);
};

export const formatEra = (dt: DateTime, locale?: FormatFirstArg<EraFormatOpts>, opts?: FormatSecondArg<EraFormatOpts>): string => {
  const formatOpts = getFormattingOpts(locale, opts);
  const dtf = eraDtf(formatOpts, dt.zone);
  return extract(dt.native(), dtf, "era");
}

// note this doesn't support Japanese eras
export const listEras = (locale?: FormatFirstArg<EraFormatOpts>, opts?: FormatSecondArg<EraFormatOpts>): string[] => {

  const formatOpts = getFormattingOpts(locale, opts);
  return memo("eraList", (formatOpts: Partial<EraFormatOpts>) => {
    const dtf = eraDtf(formatOpts, utcInstance);

    // @ts-ignore
    const d = new Date([2016, 6, 15]);
    const foundEras = [-5000, -40, 2017].map((year) => {
      d.setFullYear(year);
      return extract(d, dtf, "era");
    });
    return [...new Set(foundEras)];
  })(formatOpts);
}
