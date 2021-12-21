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
let defaultFormat: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
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

export const getDefaultDateTimeFormat = (): Intl.DateTimeFormatOptions => defaultFormat;
export const setDefaultDateTimeFormat = (format: Intl.DateTimeFormatOptions)  => defaultFormat = format;

export const getDefaultNumberingSystem = (): string | undefined => defaultNumberingSystem;
export const setDefaultNumberingSystem = (numberingSystem: string)  => defaultNumberingSystem = numberingSystem;

export const getDefaultOutputCalendar = (): string  | undefined => defaultOutputCalendar;
export const setDefaultOutputCalendar = (outputCalendar: string)  => defaultOutputCalendar = outputCalendar;

export const clearCaches = clearCachesInternal;
