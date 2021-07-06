import { getDefaultLocale, getDefaultNumberingSystem, getDefaultOutputCalendar } from "../settings";
import { FormatMode, MonthFormatWidth } from "./formatting";
import { UnknownError } from "./errors";
import Zone from "./zone";
import { utcInstance } from "./zones/fixedOffsetZone";
import IANAZone, { isValidZone } from "./zones/IANAZone";

export type LocaleOpts = Partial<FullLocaleOpts>;

export type FullLocaleOpts = {
  readonly locale: string;
  readonly numberingSystem: string,
  readonly outputCalendar: string;
  readonly hourCycle: string | null;
}

export const defaultLocaleOpts = (): LocaleOpts => {
  return {
    locale: getDefaultLocale(),
    numberingSystem: getDefaultNumberingSystem(),
    outputCalendar: getDefaultOutputCalendar(),
    hourCycle: null
  }
}

const caches: Array<Map<any, any>> = [];

export const clearCaches = () => {
  for(const cache of caches) {
    cache.clear();
  }
}

const memo = <TKey, TValue>(builder: (key: TKey) => TValue): (key: TKey) => TValue => {
  const cache = new Map<TKey, TValue>();
  caches.push(cache);
  return (key: TKey): TValue => {
    const cached = cache.get(key);
    if (cached) return cached;
    const fresh = builder(key);
    cache.set(key, fresh);
    return fresh;
  }
}

const getDtf = memo(([locale, opts]: [string, Intl.DateTimeFormatOptions]) => new Intl.DateTimeFormat(locale, opts));

const zoneOptionForZone = (zone: Zone): string | null => {
  if (zone.isUniversal) {
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
}

export const formattingOptions = (localeOpts: LocaleOpts, zone: Zone, fmt: Intl.DateTimeFormatOptions = {}) : [string, Intl.DateTimeFormatOptions] => {
  const fullOpts: Intl.DateTimeFormatOptions = { numberingSystem: localeOpts.numberingSystem, calendar: localeOpts.outputCalendar };
  if (localeOpts.hourCycle != null) {
    // @ts-ignore
    fullOpts.hourCycle = localeOpts.hourCycle;
  }

  const zOption = zoneOptionForZone(zone);

  if (zOption != null) {
    fullOpts.timeZone = zOption;
  }

  return [localeOpts.locale || "en-US", {...fullOpts, ...fmt}];
}

export const dateTimeFormatter = (localeOpts: LocaleOpts, zone: Zone, fmt: Intl.DateTimeFormatOptions = {}): Intl.DateTimeFormat =>
  getDtf(formattingOptions(localeOpts, zone, fmt));

function extract(jsDate: Date, df: Intl.DateTimeFormat, field: string) : string {
  const results = df.formatToParts();
  const matching = results.find(m => m.type.toLowerCase() === field);

  if (!matching) {
    throw new UnknownError(`Can't find matching field ${field}`)
  }

  return matching.value;
}

const usingEnglishMemo = memo(([localeOpts]: [LocaleOpts]): boolean => {
  const isActuallyEnglish =
    localeOpts.locale == null ||
    localeOpts.locale === "en" ||
    localeOpts.locale.toLowerCase() === "en-us" ||
    getDtf([localeOpts.locale, {}]).resolvedOptions().locale.startsWith("en-us")

  const hasNoWeirdness =
    (localeOpts.numberingSystem === null || localeOpts.numberingSystem === "latn") &&
    (localeOpts.outputCalendar === null || localeOpts.outputCalendar === "gregory");

  return isActuallyEnglish && hasNoWeirdness;
});

export const useEnglishFormatting = (localeOpts: LocaleOpts) => usingEnglishMemo([localeOpts]);

const monthDtf = (localeOpts: LocaleOpts, zone: Zone, mode: FormatMode, width: MonthFormatWidth): Intl.DateTimeFormat => {
  const fmt: Intl.DateTimeFormatOptions = mode === "format" ? { month: width, day: "numeric" } : { month: width };
  return getDtf(formattingOptions(localeOpts, zone, fmt));
};

export const formatMonth = (localeOpts: LocaleOpts, mode: FormatMode, width: MonthFormatWidth): (jsDate: Date, zone: Zone) => string =>
  (d, zone) => {
    const dtf = monthDtf(localeOpts, zone, mode, width);
    return extract(d, dtf, "months");
  };

export const months = memo(([localeOpts, mode, width]: [LocaleOpts, FormatMode, MonthFormatWidth]) : string[] => {
  const dtf = monthDtf(localeOpts, utcInstance, mode, width);

  // @ts-ignore
  const d = new Date([2016, 6, 15]);
  return Array.from({length: 12}, (_, i) => {
      d.setMonth(i);
      return extract(d, dtf, "months");
    });
  });

const meridiemDtf = (localeOpts: LocaleOpts, zone: Zone): Intl.DateTimeFormat => {
  const fmt: Intl.DateTimeFormatOptions = { hour: "numeric", hourCycle: "h12" };
  return getDtf(formattingOptions(localeOpts, zone, fmt));
};

export const formatMeridiem = (localeOpts: LocaleOpts): (jsDate: Date, zone: Zone) => string =>
  (d, zone) => {
    const dtf = meridiemDtf(localeOpts, zone);
    return extract(d, dtf, "dayperiod");
  }

// todo - list meridiems
