import { extract, getDtf, getDtfArgs, getFormattingOpts} from "../util/format";
import { memo } from "../util/caching";
import { utcInstance } from "../zone/fixedOffset";
import { Zone, EraFormatOpts, FormatFirstArg, FormatSecondArg } from "../../types";

export const formatEra = (
  firstArg?: FormatFirstArg<EraFormatOpts>,
  secondArg?: FormatSecondArg<EraFormatOpts>
): ((date: Date, zone: Zone) => string) => {
  const formatOpts = getFormattingOpts<EraFormatOpts>(firstArg, secondArg);
  return (date, zone) => formatEraMemo(formatOpts)(date, zone);
};

export const listEras = (
  firstArg?: FormatFirstArg<EraFormatOpts>,
  secondArg?: FormatSecondArg<EraFormatOpts>
): string[] => {
  const formatOpts = getFormattingOpts<EraFormatOpts>(firstArg, secondArg);
  return listErasMemo(formatOpts);
};

const formatEraMemo =
  (formatOpts: EraFormatOpts): ((jsDate: Date, zone: Zone) => string) =>
  (d, zone) => {
    const dtf = eraDtf(formatOpts, zone);
    return extract(d, dtf, "era");
  };

const listErasMemo = memo("eraList", (formatOpts: EraFormatOpts) => {
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
  return getDtf(getDtfArgs(formatOpts.locale, zone, { ...options, ...formatOpts }));
};
