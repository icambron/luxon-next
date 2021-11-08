import { isoWeekCalendarInstance } from "../impl/calendars/isoWeek";
import { fromCalendar, getCalendarValue } from "../impl/dateTime";
import { weeksInWeekYear } from "../impl/util/dateMath";
import { Zone, DateTime, ISOWeekDate, Time } from "../types";

export const fromISOWeek = (obj: Partial<ISOWeekDate & Time>, zone?: Zone): DateTime =>
  fromCalendar(isoWeekCalendarInstance, obj, zone);

export const toISOWeek = (): ((dt: DateTime) => ISOWeekDate & Time) => (dt) => ({
  ...getCalendarValue(dt, isoWeekCalendarInstance),
  ...dt.time,
});

export const weekYear = (dt: DateTime): number => toISOWeek()(dt).weekYear;
export const weekNumber = (dt: DateTime): number => toISOWeek()(dt).weekNumber;
export const weekday = (dt: DateTime): number => toISOWeek()(dt).weekday;

export const weeksInCurrentWeekYear = (dt: DateTime): number => weeksInWeekYear(weekYear(dt));
