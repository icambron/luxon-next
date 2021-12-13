import { isoWeekCalendarInstance } from "../impl/calendars/isoWeek";
import { fromCalendar, getCalendarValue, set } from "../impl/dateTime";
import { weeksInWeekYear } from "../impl/util/dateMath";
import { Zone, DateTime, ISOWeekDate, Time} from "../types";

export const fromISOWeek = (obj: Partial<ISOWeekDate & Time>, zone?: Zone): DateTime =>
  fromCalendar(isoWeekCalendarInstance, obj, zone);

const getIsoWeekData = (dt: DateTime): ISOWeekDate => getCalendarValue(dt, isoWeekCalendarInstance);

export const toISOWeek = (dt: DateTime): ISOWeekDate & Time => ({
  ...getIsoWeekData(dt),
  ...dt.time,
});

export const setISOWeek =
  (dt: DateTime, obj: Partial<ISOWeekDate & Time>): DateTime => set<ISOWeekDate>(dt, isoWeekCalendarInstance, obj);

export const weekYear = (dt: DateTime): number => getIsoWeekData(dt).weekYear;
export const weekNumber = (dt: DateTime): number => getIsoWeekData(dt).weekNumber;
export const weekday = (dt: DateTime): number => getIsoWeekData(dt).weekday;

export const weeksInCurrentWeekYear = (dt: DateTime): number => weeksInWeekYear(weekYear(dt));
