import { adjustCalendarOverflow, gregorianInstance } from "../impl/calendars/gregorian";
import { daysInMonth, daysInYear, isLeapYear } from "../impl/util/dateMath";
import { isDate, isDateTime as isDateTimeInternal } from "../impl/util/typeCheck";
import { fromCalendar, fromMillis as fromMillisInternal, set } from "../impl/dateTime";
import { utcZone } from "../impl/zone/fixedOffset";
import { normalizeZone } from "../impl/zone/normalizeZone";
import { getNowFn } from "../settings";
import { InvalidArgumentError } from "../errors";
import { Zone, DateTime, GregorianDate, Time, Zoneish } from "../types";

// BASICS
// these are strictly unneeded but they make the interface more consistent
export const isDateTime = isDateTimeInternal;
export const zone = (dt: DateTime): Zone => dt.zone;
export const zoneName = (dt: DateTime): string => dt.zone.name;
export const offset = (dt: DateTime): number => dt.offset;

// TO/FROM A TIME
export const fromTime = (obj: Partial<Time>, zone?: Zoneish): DateTime => fromGregorian(obj, normalizeZone(zone));
export const toTime = (dt: DateTime): Time => ({ ...dt.time });
export const setTime = (dt: DateTime, obj: Partial<Time>): DateTime => setGregorian(dt, obj);

// CONVERSIONS
export const toJSDate = (dt: DateTime): Date => dt.native();
export const toMillis = (dt: DateTime): number => dt.ts;
export const toSeconds = (dt: DateTime): number => dt.ts / 1000;

// FROM ESSENTIALS
export const now = (zone?: Zoneish) => fromMillisInternal(getNowFn()(), normalizeZone(zone));
export const utcNow = () => now(utcZone);
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

export const ymdUTC = (
  year: number,
  month: number,
  day: number,
  hour?: number,
  minute?: number,
  second?: number,
  millisecond?: number
) => fromGregorian({ year, month, day, hour, minute, second, millisecond }, utcZone);

// TO/FROM GREGORIAN
export const fromGregorian = (obj: Partial<GregorianDate & Time>, zone?: Zoneish): DateTime =>
  fromCalendar(gregorianInstance, obj, normalizeZone(zone));

export const toGregorian = (dt: DateTime): Partial<GregorianDate & Time> => ({
  ...dt.gregorian,
  ...dt.time,
});

export const setGregorian = (dt: DateTime, obj: Partial<GregorianDate & Time>): DateTime =>
  set<GregorianDate>(dt, gregorianInstance, obj, (original, unadjusted) =>
    original.day === undefined ? adjustCalendarOverflow(unadjusted) : unadjusted
  );

// ALIASES
// friendly aliases for Luxon users, though they won't accept week and ordinal data
export const fromObject = fromGregorian;
export const toObject = toGregorian;

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

export const isInDST = (dt: DateTime): boolean => {
  if (dt.zone.isUniversal) {
    return false;
  }
  return dt.offset > setGregorian(dt, { month: 1 }).offset || dt.offset > setGregorian(dt, { month: 5 }).offset;
};
