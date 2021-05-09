import { getDefaultFormat, getDefaultLocale, getDefaultNumberingSystem, getDefaultOutputCalendar } from "../settings";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export type LocaleOpts = {
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

const getDtf = memo(([locale, opts]: [string, DateTimeFormatOptions]) => new Intl.DateTimeFormat(locale, opts));

const supportsFastNumbers = memo((localeOpts: LocaleOpts) => {
  if (localeOpts.numberingSystem && localeOpts.numberingSystem !== "latn") {
    return false;
  } else {
    return (
      localeOpts.numberingSystem === "latn" ||
      !localeOpts.locale ||
      localeOpts.locale.startsWith("en") || dateTimeFormat(localeOpts).resolvedOptions().numberingSystem === "latn");
  }
})

function formattingOptions(localeOpts: LocaleOpts, fmt: DateTimeFormatOptions = {}) : [string, DateTimeFormatOptions] {
  const fullOpts: DateTimeFormatOptions = { numberingSystem: localeOpts.numberingSystem, calendar: localeOpts.outputCalendar };
  if (localeOpts.hourCycle != null) {
    // @ts-ignore
    fullOpts.hourCycle = localeOpts.hourCycle;
  }
  return [localeOpts.locale, {...fullOpts, ...fmt}];
}

function dateTimeFormat(localeOpts: LocaleOpts, fmt: DateTimeFormatOptions = {}): Intl.DateTimeFormat {
  return getDtf(formattingOptions(localeOpts, fmt));
}

function extract(jsDate: Date, df: Intl.DateTimeFormat, field: string) {
  const results = df.formatToParts();
  const matching = results.find(m => m.type.toLowerCase() === field);
  return matching ? matching.value : null;
}

export const toLocaleString = (jsDate: Date, localeOpts: LocaleOpts, fmt: DateTimeFormatOptions = getDefaultFormat()): string => {
  const [locale, opts] = formattingOptions(localeOpts, fmt)
  return jsDate.toLocaleString(locale, opts);
}

export const toLocaleDateString = (jsDate: Date, localeOpts: LocaleOpts, fmt: DateTimeFormatOptions = getDefaultFormat()): string => {
  const [locale, opts] = formattingOptions(localeOpts, fmt)
  return jsDate.toLocaleDateString(locale, opts);
}

export const toLocaleTimeString = (jsDate: Date, localeOpts: LocaleOpts, fmt: DateTimeFormatOptions = getDefaultFormat()): string => {
  const [locale, opts] = formattingOptions(localeOpts, fmt)
  return jsDate.toLocaleTimeString(locale, opts);
}

export const months = memo(([localeOpts, mode, width]: [LocaleOpts, "format" | "standalone", "narrow" | "short" | "long" | "numeric" | "2-digit"]) => {
  const fmt: DateTimeFormatOptions = mode === "format" ? { month: width, day: "numeric" } : { month: width };
  const dtf = getDtf(formattingOptions(localeOpts, fmt));

  // @ts-ignore
  const d = new Date([2016, 6, 15]);
  return Array.from({length: 12}, (_, i) => {
      d.setMonth(i);
      return extract(d, dtf, "months");
    });
  });
