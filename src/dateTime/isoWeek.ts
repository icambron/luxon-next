import { DateTime} from "../model/DateTime";
import { isoWeekCalendarInstance} from "../model/calendars/IsoWeekCalendar";
import Zone from "../types/zone";
import { ISOWeekDate } from "../types/isoWeek";
import { Time } from "../types/time";
import { fromCalendar, getCalendarValue } from "../impl/dateTime";
import { weeksInWeekYear } from "../utils/dateMath";

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
