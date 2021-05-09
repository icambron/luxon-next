// rule: only depends on model and impl
import Zone, {Zoneish} from "../model/zone";
import {
    adjustCalendarOverflow,
    daysInMonth,
    GregorianDate,
    gregorianInstance,
} from "../model/calendars/gregorian";
import DateTime, {fromCalendar, fromMillis as fromMillisInternal, normalizeZone, set} from "../model/dateTime";
import Time from "../model/time";
import {daysInYear, isLeapYear} from "../impl/dateMath";
import {getDefaultNowFn} from "../model/settings";
import {utcInstance} from "../model/zones/fixedOffsetZone";
import {InvalidArgumentError} from "../model/errors";
import {isDate} from "../impl/util";

// BASICS
// these are strictly unneeded but they make the interface more consistent
export const isDateTime = (obj: any): boolean => obj.isLuxonDateTime
export const zone = (dt: DateTime): Zone => dt.zone;
export const zoneName = (dt: DateTime): string => dt.zone.name;
export const offset = (dt: DateTime): number => dt.offset;

// TO/FROM A TIME
export const fromTime = (obj: Partial<Time>, zone?: Zoneish): DateTime => fromGregorian(obj, normalizeZone(zone));
export const toTime = (dt: DateTime): Time => ({...dt.time});
export const setTime = (dt: DateTime, obj: Partial<Time>): DateTime => setGregorian(dt, obj);

// CONVERSIONS
export const toJSDate = (dt: DateTime) : Date => new Date(dt.ts);
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
}
export const ymd = (year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number) =>
    fromGregorian({year, month, day, hour, minute, second, millisecond})

// TO/FROM GREGORIAN
export const fromGregorian = (obj: Partial<GregorianDate & Time>, zone?: Zoneish): DateTime =>
    fromCalendar(gregorianInstance, obj, normalizeZone(zone));
export const toGregorian = (dt: DateTime): Partial<GregorianDate & Time> => ({...dt.gregorian, ...dt.time});
export const setGregorian = (dt: DateTime, obj: object): DateTime =>
    set(dt, gregorianInstance, obj, (original, unadjusted) =>
        original.day === undefined ? adjustCalendarOverflow(unadjusted) : unadjusted);

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
