// rule: only depends on model and impl
import Zone from "../model/zone";
import {daysInMonth, GregorianDate, gregorianInstance} from "../model/calendars/gregorian";
import DateTime from "../model/dateTime";
import {fromCalendar, fromMillis as fromMillisInternal, set} from "../impl/dateTimeImpl"
import Time from "../model/time";
import {daysInYear, isLeapYear} from "../impl/dateMath";
import {getDefaultNowFn} from "../model/settings";

// BASICS
// these are strictly unneeded but they make the interface more consistent
export const isDateTime = (obj: any): boolean => obj.isLuxonDateTime
export const zone = (dt: DateTime): Zone => dt.zone;
export const zoneName = (dt: DateTime): string => dt.zone.name;
export const offset = (dt: DateTime): number => dt.offset;

// TO/FROM A TIME
export const fromTime = (obj: Partial<Time>, zone?: Zone): DateTime => fromGregorianCalendar(obj, zone);
export const toTime = (dt: DateTime): Time => ({...dt.time});
export const setTime = (dt: DateTime, obj: Partial<Time>): DateTime => setGregorian(dt, obj);

// CONVERSIONS
export const toJSDate = (dt: DateTime) : Date => new Date(dt.ts);
export const toMillis = (dt: DateTime): number => dt.ts;
export const toSeconds = (dt: DateTime): number => dt.ts / 1000;

// FROM ESSENTIALS
export const now = (zone?: Zone) => fromMillis(getDefaultNowFn()(), zone);
export const fromMillis = fromMillisInternal;

// TO/FROM GREGORIAN
export const fromGregorianCalendar = (obj: Partial<GregorianDate & Time>, zone?: Zone): DateTime =>
    fromCalendar(gregorianInstance, obj, zone);
export const toGregorianCalendar = (dt: DateTime): Partial<GregorianDate & Time> => ({...dt.gregorian, ...dt.time});
export const setGregorian = (dt: DateTime, obj: object): DateTime => set(dt, gregorianInstance, obj);

// GREGORIAN GETTERS
export const year = (dt: DateTime): number => dt.gregorian.year;
export const month = (dt: DateTime): number => dt.gregorian.month;
export const day = (dt: DateTime): number => dt.gregorian.day;
export const hour = (dt: DateTime): number => dt.time.hour;
export const minute = (dt: DateTime): number => dt.time.minute;
export const second = (dt: DateTime): number => dt.time.second;
export const millisecond = (dt: DateTime): number => dt.time.millisecond;

// todo - move to a quarter-based calendar?
export const quarter = (dt: DateTime): number => Math.ceil(month(dt) / 3);

// MISC INFO
export const isInLeapYear = (dt: DateTime): boolean => isLeapYear(year(dt));
export const daysInCurrentMonth = (dt: DateTime): number => daysInMonth(year(dt), month(dt));
export const daysInCurrentYear = (dt: DateTime): number => daysInYear(year(dt));
export const isOffsetFixed = (dt: DateTime): boolean => zone(dt).isUniversal;
