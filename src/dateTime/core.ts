// rule: only depends on model and lib
import { adjustCalendarOverflow, daysInMonth, gregorianInstance } from "../model/calendars/gregorian";
import { DateTime, fromCalendar, fromMillis as fromMillisInternal, normalizeZone, set } from "../model/dateTime";
import { daysInYear, isLeapYear } from "../utils/dateMath";
import { getDefaultNowFn } from "../settings";
import { utcInstance } from "../model/zones/fixedOffsetZone";
import { InvalidArgumentError } from "../errors";
import Zone, { Zoneish } from "../types/zone";
import { GregorianDate } from "../types/gregorian";
import { Time } from "../types/time";
import { isDate } from "../utils/typeCheck";

// BASICS
// these are strictly unneeded but they make the interface more consistent
export const isDateTime = (obj: any): boolean => obj.isLuxonDateTime;
export const zone = (dt: DateTime): Zone => dt.zone;
export const zoneName = (dt: DateTime): string => dt.zone.name;
export const offset = (dt: DateTime): number => dt.offset;

// TO/FROM A TIME
export const fromTime = (obj: Partial<Time>, zone?: Zoneish): DateTime => fromGregorian(obj, normalizeZone(zone));
export const toTime = (dt: DateTime): Time => ({ ...dt.time });
export const setTime = (obj: Partial<Time>): ((dt: DateTime) => DateTime) => setGregorian(obj);

// CONVERSIONS
export const toJSDate = (dt: DateTime): Date => new Date(dt.ts);
export const toMillis = (dt: DateTime): number => dt.ts;
export const toSeconds = (dt: DateTime): number => dt.ts / 1000;

// FROM ESSENTIALS
export const now = (zone?: Zoneish) => fromMillisInternal(getDefaultNowFn()(), normalizeZone(zone));
export const utcNow = () => now(utcInstance);
export const fromMillis = (ms: number, zone?: Zoneish) => fromMillisInternal(ms, normalizeZone(zone));

export const fromJSDate = (jsDate: Date, zone?: Zoneish): DateTime => {
  if (!isDate(jsDate) || Number.isNaN(+jsDate)) {
    throw new InvalidArgumentError("date argument must be a valid Date");
  }
  return fromMillis(+jsDate, zone);
};

export const ymd = (
  year: number,
  month: number,
  day: number,
  hour?: number,
  minute?: number,
  second?: number,
  millisecond?: number
) => fromGregorian({ year, month, day, hour, minute, second, millisecond });

// TO/FROM GREGORIAN
export const fromGregorian = (obj: Partial<GregorianDate & Time>, zone?: Zoneish): DateTime =>
  fromCalendar(gregorianInstance, obj, normalizeZone(zone));

export const toGregorian = (): ((dt: DateTime) => Partial<GregorianDate & Time>) => (dt) => ({
  ...dt.gregorian,
  ...dt.time,
});

// friendly alias for Luxon users
export const toObject = toGregorian;

export const setGregorian =
  (obj: Partial<GregorianDate & Time>): ((dt: DateTime) => DateTime) =>
  (dt) =>
    set<GregorianDate>(dt, gregorianInstance, obj, (original, unadjusted) =>
      original.day === undefined ? adjustCalendarOverflow(unadjusted) : unadjusted
    );

// GREGORIAN GETTERS
export const year = (dt: DateTime): number => dt.gregorian.year;
export const month = (dt: DateTime): number => dt.gregorian.month;
export const day = (dt: DateTime): number => dt.gregorian.day;
export const hour = (dt: DateTime): number => dt.time.hour;
export const minute = (dt: DateTime): number => dt.time.minute;
export const second = (dt: DateTime): number => dt.time.second;
export const millisecond = (dt: DateTime): number => dt.time.millisecond;
export const quarter = (dt: DateTime): number => Math.ceil(month(dt) / 3);

// MISC INFO
export const isInLeapYear = (dt: DateTime): boolean => isLeapYear(year(dt));
export const daysInCurrentMonth = (dt: DateTime): number => daysInMonth(year(dt), month(dt));
export const daysInCurrentYear = (dt: DateTime): number => daysInYear(year(dt));
export const isOffsetFixed = (dt: DateTime): boolean => zone(dt).isUniversal;
