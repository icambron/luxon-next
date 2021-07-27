import { getDefaultLocale, getDefaultNumberingSystem, getDefaultOutputCalendar } from "../settings";
import { FormatMode, MonthFormatOpts, MonthFormatWidth } from "./formatting";
import { UnknownError } from "./errors";
import Zone from "./zone";
import { utcInstance } from "./zones/fixedOffsetZone";
import { isValidZone } from "./zones/IANAZone";

const caches: Array<Map<any, any>> = [];

export const clearCaches = () => {
  for (const cache of caches) {
    cache.clear();
  }
};

const memo = <TKey, TValue>(builder: (key: TKey) => TValue): ((key: TKey) => TValue) => {
  const cache = new Map<TKey, TValue>();
  caches.push(cache);
  return (key: TKey): TValue => {
    const cached = cache.get(key);
    if (cached) return cached;
    const fresh = builder(key);
    cache.set(key, fresh);
    return fresh;
  };
};

const getDtf = memo(([locale, opts]: [string, Intl.DateTimeFormatOptions]) => new Intl.DateTimeFormat(locale, opts));

const zoneOptionForZone = (zone: Zone | undefined): string | null => {
  if (!zone) {
    return null;
  } else if (zone.isUniversal) {
    const gmtOffset = zone.offset(0);
    const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
    const isOffsetZoneSupported = isValidZone(offsetZ);
    if (gmtOffset !== 0 && isOffsetZoneSupported) {
      return offsetZ;
    } else {
      return "UTC";
    }
  } else if (zone.type === "system") {
    return null;
  } else {
    return zone.name;
  }
};

export const getDtfArgs = (
  locale: string | undefined,
  zone: Zone | undefined,
  format: Intl.DateTimeFormatOptions | undefined
): [string, Intl.DateTimeFormatOptions] => {
  const fullOpts: Intl.DateTimeFormatOptions = {
    calendar: getDefaultOutputCalendar(),
    numberingSystem: getDefaultNumberingSystem(),
    ...format,
  };

  const zOption = zoneOptionForZone(zone);

  if (zOption != null) {
    fullOpts.timeZone = zOption;
  }

  return [locale || getDefaultLocale(), fullOpts];
};

export const dateTimeFormatter = (
  locale: string | undefined,
  zone: Zone | undefined,
  format: Intl.DateTimeFormatOptions | undefined
): Intl.DateTimeFormat => getDtf(getDtfArgs(locale, zone, format));

function extract(jsDate: Date, df: Intl.DateTimeFormat, field: string): string {
  const results = df.formatToParts(jsDate);
  const matching = results.find((m) => m.type.toLowerCase() === field);

  if (!matching) {
    throw new UnknownError(`Can't find matching field ${field}`);
  }

  return matching.value;
}

const monthDtf = (
  locale: string | undefined,
  zone: Zone,
  fmt: Intl.DateTimeFormatOptions | undefined,
  monthFormatOpts: MonthFormatOpts
): Intl.DateTimeFormat => {
  const mode = monthFormatOpts?.mode || "standalone";
  const width = monthFormatOpts?.width || "long";
  const options: Intl.DateTimeFormatOptions = mode === "format" ? { month: width, day: "numeric" } : { month: width };
  return getDtf(getDtfArgs(locale, zone, { ...options, ...fmt }));
};

export const formatMonth = (
  locale: string | undefined,
  fmt: Intl.DateTimeFormatOptions | undefined,
  monthFormatOpts: MonthFormatOpts
): ((jsDate: Date, zone: Zone) => string) => (d, zone) => {
  const dtf = monthDtf(locale, zone, fmt, monthFormatOpts);
  return extract(d, dtf, "month");
};

export const listMonths = memo(
  ([locale, fmt, monthFormatOpts]: [
    string | undefined,
    Intl.DateTimeFormatOptions | undefined,
    MonthFormatOpts
  ]): string[] => {
    const dtf = monthDtf(locale, utcInstance, fmt, monthFormatOpts);

    // @ts-ignore
    const d = new Date([2016, 6, 15]);
    return Array.from({ length: 12 }, (_, i) => {
      d.setMonth(i);
      return extract(d, dtf, "month");
    });
  }
);

const meridiemDtf = (locale: string | undefined, zone: Zone): Intl.DateTimeFormat => {
  const fmt: Intl.DateTimeFormatOptions = { hour: "numeric", hourCycle: "h12" };
  return getDtf(getDtfArgs(locale, zone, fmt));
};

export const formatMeridiem = (locale: string | undefined): ((jsDate: Date, zone: Zone) => string) => (d, zone) => {
  const dtf = meridiemDtf(locale, zone);
  return extract(d, dtf, "dayperiod");
};

// todo - list meridiems
