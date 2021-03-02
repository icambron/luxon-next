import DateTime from "../model/dateTime";
import {fromCalendar, getCalendarValue} from "../impl/dateTimeImpl";
import {isoCalendarInstance, IsoWeekDate, weeksInWeekYear} from "../model/calendars/isoWeek";
import Zone from "../model/zone";
import Time from "../model/time";

export const fromIsoWeekCalendar = (obj: Partial<IsoWeekDate & Time>, zone?: Zone): DateTime =>
    fromCalendar(isoCalendarInstance, obj, zone);

export const toIsoWeekCalendar = (dt: DateTime): IsoWeekDate & Time =>
    ({...getCalendarValue(dt, isoCalendarInstance), ...dt.time});

export const weekYear = (dt: DateTime): number => toIsoWeekCalendar(dt).weekYear;
export const weekNumber = (dt: DateTime): number => toIsoWeekCalendar(dt).weekNumber;
export const weekday = (dt: DateTime): number => toIsoWeekCalendar(dt).weekday;

export const weeksInCurrentWeekYear = (dt: DateTime): number => weeksInWeekYear(weekYear(dt));
