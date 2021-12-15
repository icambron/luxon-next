import { getDefaultFormat, getDefaultLocale, getDefaultNumberingSystem, getDefaultOutputCalendar } from "../../settings";
import { FormatStringError, UnknownError } from "../../errors";
import { memo } from "./caching";
import {
  Zone,
  FormatFirstArg,
  FormatSecondArg,
  FormatToken,
  SharedFormatOpts,
  FormatOpts
} from "../../types";
import { isValidIANAZone } from "../util/zoneUtils";

const getDtf = memo(
  "dateTimeFormat",
  ([locale, opts]: [string, Intl.DateTimeFormatOptions]) => new Intl.DateTimeFormat(locale, opts)
);

export const dateTimeFormat = (opts: FormatOpts = {}, zone?: Zone ): Intl.DateTimeFormat => {
  const { locale, ...rest } = opts;

  const fullOpts: Intl.DateTimeFormatOptions = {
    calendar: getDefaultOutputCalendar(),
    numberingSystem: getDefaultNumberingSystem(),
    ...rest,
  };

  const zOption = zoneOptionForZone(zone);

  if (zOption != null) {
    fullOpts.timeZone = zOption;
  }

  return getDtf([locale || getDefaultLocale(), fullOpts]);
}

export interface NumberFormatOpts extends SharedFormatOpts, Intl.NumberFormatOptions {
}

const getNf = memo("numberFormat", ([locale, opts]: [string, Intl.NumberFormatOptions]) => new Intl.NumberFormat(locale, opts));

export const numberFormat = (opts: NumberFormatOpts = {}) => {
  const { locale, ...rest } = opts;

  const fullOpts: Intl.NumberFormatOptions = {
    numberingSystem: getDefaultNumberingSystem(),
    ...rest,
  };

  return getNf([locale || getDefaultLocale(), fullOpts]);
};

export const extract = (jsDate: Date, df: Intl.DateTimeFormat, field: string): string => {
  const results = df.formatToParts(jsDate);
  const matching = results.find((m) => m.type.toLowerCase() === field);

  if (!matching) {
    throw new UnknownError(`Can't find matching field ${field}`);
  }

  return matching.value;
};

// () -> ?
// ("fr") -> { locale: "fr" }
// ("fr", { width: "short" }) => { locale: "fr", width: "short" }
// ({ width: short } => { width: "short" }
export const getFormattingOpts = <T extends SharedFormatOpts>(
  firstArg: FormatFirstArg<T>,
  secondArg: FormatSecondArg<T>
): Partial<T> => {
  let locale: string | undefined = undefined;
  let t: Partial<T> | undefined = undefined;
  if (typeof firstArg === "string") {
    locale = firstArg;
  } else if (typeof firstArg === "object") {
    t = firstArg as Partial<T>; // we hope!
  }

  if (!t && typeof secondArg === "object") {
    t = secondArg as Partial<T>;
  }

  if (t && !t.locale) {
    t.locale = locale;
  } else if (!t) {
    t = (locale ? { locale } : {}) as Partial<T>;
  }

  return t;
};

export const getDefaultedFormattingOpts = (firstArg: FormatFirstArg<FormatOpts>, secondArg: FormatSecondArg<FormatOpts>): FormatOpts => {
  const formatOpts = getFormattingOpts(firstArg, secondArg);
  const { locale, calendar, numberingSystem, ...rest } = formatOpts;
  return Object.keys(rest).length === 0 ? { ...formatOpts, ...getDefaultFormat() } : formatOpts;
}

export const hasKeys =
  <T>(...keys: string[]): ((o: any) => o is T) =>
  (o: any): o is T =>
    typeof o === "object" && keys.some((k) => o[k]);

export const parseFormat = (fmt: string): FormatToken[] => {
  let currentChar: string | null = null;
  let currentToken: string | null = null;
  let bracketed = false;
  let escaped = false;
  const tokens: FormatToken[] = [];

  const addToken = (literal: boolean, name: string | null) => {
    if (name) {
      tokens.push({ literal, name });
    }
    currentChar = null;
    currentToken = null;
  };

  for (let i = 0; i < fmt.length; i++) {
    const c = fmt.charAt(i);

    // we aren't escaped and we see an escape character. We ignore the char but are now in escape mode
    if (c === "\\" && !escaped) {
      escaped = true;
    }

    // we found an unescaped [, so start a bracketed section
    else if (c === "[" && !escaped) {
      if (bracketed) {
        throw new FormatStringError(fmt, "can't nest [");
      }
      bracketed = true;
      addToken(false, currentToken);
    }

    // we found an unescaped ] so end a bracketed section
    else if (c === "]" && !escaped) {
      if (!bracketed) {
        throw new FormatStringError(fmt, "] can't appear before its matching [");
      }
      addToken(true, currentToken);
      bracketed = false;
    }

    // if we're in a bracket or the current char is the same as the last, append to the current token
    // note this could be an escaped bracket inside the bracketed section, or even a second bracket in a row
    else if (bracketed || c === currentChar) {
      escaped = false;
      if (!currentToken) currentToken = "";
      currentToken += c;
    }

    // we aren't bracketed and we have a token that's different than the previous. Create a new token
    // note this could be an escaped bracket
    else {
      escaped = false;
      // this token is over and we have a new one, so push the old one and create a new one
      addToken(false, currentToken);
      currentToken = c;
      currentChar = c;
    }
  }

  // anything still going is its own token
  addToken(bracketed, currentToken);

  return tokens;
};

const zoneOptionForZone = (zone: Zone | undefined): string | null => {
  if (!zone) {
    return null;
  } else if (zone.isUniversal) {
    const gmtOffset = zone.offset(0);
    const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
    const isOffsetZoneSupported = isValidIANAZone(offsetZ);
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
