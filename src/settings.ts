import { InvalidArgumentError } from "./errors";
import {clearCaches as clearCachesInternal} from "./impl/util/caching";
import { systemZone } from "./impl/zone/system";
import { Zone, ConversionAccuracy } from "./types";
import { isZone } from "./impl/util/typeCheck";

let defaultZone: Zone = systemZone;
let nowFn: () => number = () => Date.now();
let defaultConversionAccuracy: ConversionAccuracy = "casual";
let defaultLocale: string = "en-US";
let defaultNumberingSystem: string | undefined = undefined;
let defaultOutputCalendar: string | undefined = undefined;
let defaultDateTimeFormat: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "medium",
}

let defaultDateFormat: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
}

let defaultTimeFormat: Intl.DateTimeFormatOptions = {
  timeStyle: "medium",
}

export const getDefaultZone = (): Zone => defaultZone;
export const setDefaultZone = (zone?: Zone) => {
  if (zone !== undefined && zone != null && !isZone(zone)) {
    throw new InvalidArgumentError("must set the default zone to an instance of Zone");
  }
  defaultZone = zone || systemZone;
};

export const getNowFn = (): (() => number) => nowFn;
export const setNowFn = (fn: () => number) => nowFn = fn;

export const getDefaultConversionAccuracy = (): ConversionAccuracy => defaultConversionAccuracy;
export const setDefaultConversionAccuracy = (accuracy: ConversionAccuracy) => defaultConversionAccuracy = accuracy;

export const getDefaultLocale = (): string => defaultLocale;
export const setDefaultLocale = (loc: string)  => defaultLocale = loc;

export const getDefaultDateTimeFormat = (): Intl.DateTimeFormatOptions => defaultDateTimeFormat;
export const setDefaultDateTimeFormat = (format: Intl.DateTimeFormatOptions)  => defaultDateTimeFormat = format;

export const getDefaultDateFormat = (): Intl.DateTimeFormatOptions => defaultDateFormat;
export const setDefaultDateFormat = (format: Intl.DateTimeFormatOptions)  => defaultDateFormat = format;

export const getDefaultTimeFormat = (): Intl.DateTimeFormatOptions => defaultTimeFormat;
export const setDefaultTimeFormat = (format: Intl.DateTimeFormatOptions)  => defaultTimeFormat = format;

export const getDefaultNumberingSystem = (): string | undefined => defaultNumberingSystem;
export const setDefaultNumberingSystem = (numberingSystem: string)  => defaultNumberingSystem = numberingSystem;

export const getDefaultOutputCalendar = (): string  | undefined => defaultOutputCalendar;
export const setDefaultOutputCalendar = (outputCalendar: string)  => defaultOutputCalendar = outputCalendar;

export const clearCaches = clearCachesInternal;
