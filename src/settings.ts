import Zone, { isZone } from "./model/zone";
import { systemZone } from "./model/zones/systemZone";
import { InvalidArgumentError } from "./model/errors";

// todo - move this type
import { ConversionAccuracy } from "./model/duration";

type DateTimeFormatOptions = Intl.DateTimeFormatOptions;

let _zone: Zone = systemZone;
let _nowFn: () => number = () => Date.now();
let _defaultConversionAccuracy: ConversionAccuracy = "casual";
let _defaultLocale: string = "en-US";
let _defaultNumberingSystem: string = "latn";
let _defaultOutputCalendar: string = "gregory";
let _defaultFormat: DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "medium",
}

export const getDefaultZone = (): Zone => _zone;
export const setDefaultZone = (zone?: Zone) => {
  if (zone !== undefined && zone != null && !isZone(zone)) {
    throw new InvalidArgumentError("must set the default zone to an instance of Zone");
  }
  _zone = zone || systemZone;
};

export const getDefaultNowFn = (): (() => number) => _nowFn;
export const setDefaultNowFn = (fn: () => number) => _nowFn = fn;

export const getDefaultConversionAccuracy = (): ConversionAccuracy => _defaultConversionAccuracy;
export const setDefaultConversionAccuracy = (accuracy: ConversionAccuracy) => _defaultConversionAccuracy = accuracy;

export const getDefaultLocale = (): string => _defaultLocale;
export const setDefaultLocale = (loc: string)  => _defaultLocale = loc;

export const getDefaultFormat = (): DateTimeFormatOptions => _defaultFormat;
export const setDefaultFormat = (format: DateTimeFormatOptions)  => _defaultFormat = format;

export const getDefaultNumberingSystem = (): string => _defaultNumberingSystem;
export const setDefaultNumberingSystem = (numberingSystem: string)  => _defaultNumberingSystem = numberingSystem;

export const getDefaultOutputCalendar = (): string => _defaultOutputCalendar;
export const setDefaultOutputCalendar = (outputCalendar: string)  => _defaultOutputCalendar = outputCalendar;
