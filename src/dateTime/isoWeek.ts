import { isoWeekCalendarInstance } from "../impl/calendars/isoWeek";
import { fromCalendar, getCalendarValue, set } from "../impl/dateTime";
import { weeksInWeekYear } from "../impl/util/dateMath";
import { Zone, DateTime, ISOWeekDate, Time} from "../types";
import { adjustCalendarOverflow} from "../impl/calendars/gregorian";

export const fromISOWeek = (obj: Partial<ISOWeekDate & Time>, zone?: Zone): DateTime =>
  fromCalendar(isoWeekCalendarInstance, obj, zone);

const getIsoWeekData = (dt: DateTime): ISOWeekDate => getCalendarValue(dt, isoWeekCalendarInstance);

export const toISOWeek = (): ((dt: DateTime) => ISOWeekDate & Time) => (dt) => ({
  ...getIsoWeekData(dt),
  ...dt.time,
});

export const setISOWeek =
  (obj: Partial<ISOWeekDate & Time>): ((dt: DateTime) => DateTime) => set<ISOWeekDate>(isoWeekCalendarInstance, obj);

export const weekYear = (dt: DateTime): number => getIsoWeekData(dt).weekYear;
export const weekNumber = (dt: DateTime): number => getIsoWeekData(dt).weekNumber;
export const weekday = (dt: DateTime): number => getIsoWeekData(dt).weekday;

export const weeksInCurrentWekYear = (dt: DateTime): number => weeksInWeekYear(weekYear(dt));