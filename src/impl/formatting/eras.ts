import { dateTimeFormat, extract, getFormattingOpts} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, EraFormatOpts, FormatFirstArg, DateTime, FormatSecondArg} from "../../types";

const eraDtf = (formatOpts: EraFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const width = formatOpts.width || "short";
  const options: Intl.DateTimeFormatOptions = { year: "numeric", era: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone);
};

export const formatEra = (dt: DateTime, firstArg?: FormatFirstArg<EraFormatOpts>, secondArg?: FormatSecondArg<EraFormatOpts>): string => {
  const opts = getFormattingOpts(firstArg, secondArg);
  const dtf = eraDtf(opts, dt.zone);
  return extract(new Date(+dt), dtf, "era");
}

// note this doesn't support Japanese eras
export const listEras = (firstArg?: FormatFirstArg<EraFormatOpts>, secondArg?: FormatSecondArg<EraFormatOpts>): string[] => {

  const opts = getFormattingOpts(firstArg, secondArg);
  return memo("eraList", (formatOpts: EraFormatOpts) => {
    const dtf = eraDtf(formatOpts, utcInstance);

    // @ts-ignore
    const d = new Date([2016, 6, 15]);
    const foundEras = [-5000, -40, 2017].map((year) => {
      d.setFullYear(year);
      return extract(d, dtf, "era");
    });
    return [...new Set(foundEras)];
  })(opts);
}
