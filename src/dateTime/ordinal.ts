import { fromCalendar, getCalendarValue } from "../impl/dateTime";
import { ordinalInstance } from "../impl/calendars/ordinal";
import { Zone, DateTime, OrdinalDate, Time } from "../types";

export const fromOrdinal = (obj: Partial<OrdinalDate & Time>, zone?: Zone): DateTime =>
  fromCalendar(ordinalInstance, obj, zone);

export const toOrdinal = (dt: DateTime): Partial<OrdinalDate & Time> => ({
  ...getCalendarValue(dt, ordinalInstance),
  ...dt.time,
});

export const ordinal = (dt: DateTime): number => getCalendarValue(dt, ordinalInstance).ordinal;

// year() from core will work too, because we always create the gregorian year, so this is really just for completeness
export const ordinalYear = (dt: DateTime): number => getCalendarValue(dt, ordinalInstance).year;
