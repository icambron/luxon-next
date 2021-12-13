import { DateTime, ISOFormatOpts } from "../../types";
import { toFormat } from "./tokenFormatter";

export const toISO = (dt: DateTime, opts: Partial<ISOFormatOpts> = {}) =>
  `${toISODate(dt, opts)}T${toISOTime(dt, opts)}`;

export const toISODate = (dt: DateTime, opts: Partial<ISOFormatOpts> = {}):string => {
  let realOpts = { format: "extended", ...opts }

  let fmt = realOpts.format === "basic" ? "yyyyMMdd" : "yyyy-MM-dd";

  if (dt.gregorian.year > 9999) {
    fmt = "+" + fmt;
  }
  return toFormat(dt, fmt);
}

export const toISOWeekDate = (dt: DateTime) => toFormat(dt, "kkkk-[W]W-c");

export const toISOTime = (dt: DateTime, opts: Partial<ISOFormatOpts> =  {}) => {
  let realOpts = {seconds: true, milliseconds: true, elideZeroSeconds: false, elideZeroMilliseconds: false, format: "extended", includeOffset: true, ...opts}
  let fmt = realOpts.format === "basic" ? "HHmm" : "HH:mm";

  const shouldElideMilliseconds = !realOpts.milliseconds || (realOpts.elideZeroMilliseconds && dt.time.millisecond === 0);
  const shouldElideSeconds = !realOpts.seconds || (realOpts.elideZeroSeconds && dt.time.second === 0 && dt.time.millisecond == 0);

  if (!shouldElideSeconds) {
    fmt += realOpts.format === "basic" ? "ss" : ":ss";

    if (!shouldElideMilliseconds) {
      fmt += ".SSS";
    }
  }

  if (realOpts.includeOffset) {
    fmt += realOpts.format === "basic" ? "ZZZ" : "ZZ";
  }

  return toFormat(dt, fmt, { allowZ: true });
}

