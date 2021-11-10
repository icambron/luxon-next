import { dateTimeFormat, extract} from "../util/formatUtil";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, EraFormatOpts} from "../../types";

export const extractEra =
  (formatOpts: EraFormatOpts): ((jsDate: Date, zone: Zone) => string) =>
  (d, zone) => {
    const dtf = eraDtf(formatOpts, zone);
    return extract(d, dtf, "era");
  };

export const listEras = memo("eraList", (formatOpts: EraFormatOpts) => {
  const dtf = eraDtf(formatOpts, utcInstance);

  // @ts-ignore
  const d = new Date([2016, 6, 15]);
  const foundEras = [-5000, -40, 2017].map((year) => {
    d.setFullYear(year);
    return extract(d, dtf, "era");
  });
  return [...new Set(foundEras)];
});

const eraDtf = (formatOpts: EraFormatOpts, zone: Zone): Intl.DateTimeFormat => {
  const width = formatOpts.width || "short";
  const options: Intl.DateTimeFormatOptions = { year: "numeric", era: width };
  return dateTimeFormat({ ...options, ...formatOpts }, zone);
};
