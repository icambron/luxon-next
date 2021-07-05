import { getDefaultFormat, getDefaultLocale, getDefaultNumberingSystem, getDefaultOutputCalendar } from "../settings";
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { FormatMode, MonthFormatWidth } from "./formatting";

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

function extract(jsDate: Date, df: Intl.DateTimeFormat, field: string) : string | null {
  const results = df.formatToParts();
  const matching = results.find(m => m.type.toLowerCase() === field);
  return matching ? matching.value : null;
}

export const toLocaleString = (localeOpts: LocaleOpts, fmt: DateTimeFormatOptions = getDefaultFormat()): (jsDate: Date) => string => {
  const [locale, opts] = formattingOptions(localeOpts, fmt)
  return jsDate => jsDate.toLocaleString(locale, opts);
}

export const toLocaleDateString = (localeOpts: LocaleOpts, fmt: DateTimeFormatOptions = getDefaultFormat()): (jsDate: Date) => string => {
  const [locale, opts] = formattingOptions(localeOpts, fmt)
  return jsDate => jsDate.toLocaleDateString(locale, opts);
}

export const toLocaleTimeString = (localeOpts: LocaleOpts, fmt: DateTimeFormatOptions = getDefaultFormat()): (jsDate: Date) => string => {
  const [locale, opts] = formattingOptions(localeOpts, fmt)
  return jsDate => jsDate.toLocaleTimeString(locale, opts);
}

const usingEnglishMemo = memo(([localeOpts]: [LocaleOpts]): boolean => {
  const isActuallyEnglish =
    localeOpts.locale === "en" ||
    localeOpts.locale.toLowerCase() === "en-us" ||
    getDtf([localeOpts.locale, {}]).resolvedOptions().locale.startsWith("en-us")

  const hasNoWeirdness =
    (localeOpts.numberingSystem === null || localeOpts.numberingSystem === "latn") &&
    (localeOpts.outputCalendar === null || localeOpts.outputCalendar === "gregory");

  return isActuallyEnglish && hasNoWeirdness;
});

export const useEnglishFormatting = (localeOpts: LocaleOpts) => usingEnglishMemo([localeOpts]);

const monthDtf = (localeOpts: LocaleOpts, mode: FormatMode, width: MonthFormatWidth): Intl.DateTimeFormat => {
  const fmt: DateTimeFormatOptions = mode === "format" ? { month: width, day: "numeric" } : { month: width };
  return getDtf(formattingOptions(localeOpts, fmt));
};

export const formatMonth = (localeOpts: LocaleOpts, mode: FormatMode, width: MonthFormatWidth): (jsDate: Date) => string | null => {
  const dtf = monthDtf(localeOpts, mode, width);
  return d => extract(d, dtf, "months");
}

export const months = memo(([localeOpts, mode, width]: [LocaleOpts, FormatMode, MonthFormatWidth]) : (string | null)[] => {
  const dtf = monthDtf(localeOpts, mode, width);

  // @ts-ignore
  const d = new Date([2016, 6, 15]);
  return Array.from({length: 12}, (_, i) => {
      d.setMonth(i);
      return extract(d, dtf, "months");
    });
  });

const meridiemDtf = (localeOpts: LocaleOpts): Intl.DateTimeFormat => {
  const fmt: DateTimeFormatOptions = { hour: "numeric", hourCycle: "h12" };
  return getDtf(formattingOptions(localeOpts, fmt));
};

export const formatMeridiem = (localeOpts: LocaleOpts): (jsDate: Date) => string | null => {
  const dtf = meridiemDtf(localeOpts);
  return d => extract(d, dtf, "dayperiod");
}

// todo - list meridiems
