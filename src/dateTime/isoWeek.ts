import {DateTime, fromCalendar, getCalendarValue } from "../model/dateTime";
import { isoCalendarInstance, ISOWeekDate, weeksInWeekYear } from "../model/calendars/isoWeek";
import Zone from "../model/zone";
import Time from "../model/time";

export const fromISOWeek = (obj: Partial<ISOWeekDate & Time>, zone?: Zone): DateTime =>
  fromCalendar(isoCalendarInstance, obj, zone);

export const toISOWeek = (dt: DateTime): ISOWeekDate & Time => ({
  ...getCalendarValue(dt, isoCalendarInstance),
  ...dt.time,
});

export const weekYear = (dt: DateTime): number => toISOWeek(dt).weekYear;
export const weekNumber = (dt: DateTime): number => toISOWeek(dt).weekNumber;
export const weekday = (dt: DateTime): number => toISOWeek(dt).weekday;

export const weeksInCurrentWeekYear = (dt: DateTime): number => weeksInWeekYear(weekYear(dt));
