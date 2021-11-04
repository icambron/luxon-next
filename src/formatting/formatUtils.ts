import Zone from "../model/zone";
import { isValidZone } from "../model/zones/IANAZone";
import { getDefaultLocale, getDefaultNumberingSystem, getDefaultOutputCalendar } from "../settings";
import { UnknownError } from "../model/errors";
import { FormatFirstArg, FormatSecondArg } from "../scatteredTypes/formatting";

export const caches: Array<Map<any, any>> = [];

const clearCaches = () => {
  for (const cache of caches) {
    cache.clear();
  }
};

export const memo = <TKey, TValue>(builder: (key: TKey) => TValue): ((key: TKey) => TValue) => {
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

export const getDtf = memo(([locale, opts]: [string, Intl.DateTimeFormatOptions]) => new Intl.DateTimeFormat(locale, opts));

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

export const extract = (jsDate: Date, df: Intl.DateTimeFormat, field: string): string => {
  const results = df.formatToParts(jsDate);
  const matching = results.find((m) => m.type.toLowerCase() === field);

  if (!matching) {
    throw new UnknownError(`Can't find matching field ${field}`);
  }

  return matching.value;
};

// allow (), ("de"), ("de" { calendar: "" }), ({ calendar: "" }) with the right defaults
export const getFormattingArgs = <T>(
  firstArg: FormatFirstArg | T,
  secondArg: FormatSecondArg | T,
  thirdArg?: T,
  f?: (a: any) => a is T
): [string | undefined, Intl.DateTimeFormatOptions | undefined, T | undefined] => {
  let locale: string | undefined = undefined;
  let intlOpts: Intl.DateTimeFormatOptions | undefined = undefined;
  let t: T | undefined = undefined;

  if (typeof firstArg == "string") {
    locale = firstArg;
  } else if (f && f(firstArg)) {
    t = firstArg;
  } else {
    intlOpts = firstArg;
  }

  if (!t && f && f(secondArg)) {
    t = secondArg;
  } else if (!t && !intlOpts) {
    intlOpts = secondArg;
  }

  if (!t && !intlOpts && f && f(thirdArg)) {
    t = thirdArg;
  }

  return [locale, intlOpts, t];
};

export const hasKeys =
  <T>(...keys: string[]): ((o: any) => o is T) =>
    (o: any): o is T =>
      typeof o === "object" && keys.some((k) => o[k]);


