import { DateTime, fromCalendar, getCalendarValue } from "../model/dateTime";
import { OrdinalCalendar } from "../model/calendars/ordinal";
import Zone from "../types/zone";
import { OrdinalDate } from "../types/ordinal";
import { Time } from "../types/time";

const ordinalCalendar = new OrdinalCalendar();

export const fromOrdinal = (obj: Partial<OrdinalDate & Time>, zone?: Zone): DateTime =>
  fromCalendar(ordinalCalendar, obj, zone);

export const toOrdinal = (): ((dt: DateTime) => Partial<OrdinalCalendar & Time>) => (dt) => ({
  ...getCalendarValue(dt, ordinalCalendar),
  ...dt.time,
});

export const ordinal = (dt: DateTime): number => getCalendarValue(dt, ordinalCalendar).ordinal;
