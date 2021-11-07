import { DateTime} from "../model/DateTime";
import { OrdinalCalendar } from "../model/calendars/OrdinalCalendar";
import Zone from "../types/zone";
import { OrdinalDate } from "../types/ordinal";
import { Time } from "../types/time";
import { fromCalendar, getCalendarValue } from "../impl/dateTime";

const ordinalCalendar = new OrdinalCalendar();

export const fromOrdinal = (obj: Partial<OrdinalDate & Time>, zone?: Zone): DateTime =>
  fromCalendar(ordinalCalendar, obj, zone);

export const toOrdinal = (): ((dt: DateTime) => Partial<OrdinalCalendar & Time>) => (dt) => ({
  ...getCalendarValue(dt, ordinalCalendar),
  ...dt.time,
});

export const ordinal = (dt: DateTime): number => getCalendarValue(dt, ordinalCalendar).ordinal;
