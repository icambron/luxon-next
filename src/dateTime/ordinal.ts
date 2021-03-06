import DateTime, {fromCalendar, getCalendarValue} from "../model/dateTime";
import Zone from "../model/zone";
import {OrdinalCalendar, OrdinalDate} from "../model/calendars/ordinal";
import Time from "../model/time";

const ordinalCalendar = new OrdinalCalendar();

export const fromOrdinalCalendar = (obj: Partial<OrdinalDate & Time>, zone?: Zone): DateTime =>
    fromCalendar(ordinalCalendar, obj, zone);

export const toOrdinalCalendar = (dt: DateTime): Partial<OrdinalCalendar & Time> =>
    ({...getCalendarValue(dt, ordinalCalendar), ...dt.time});

export const ordinal = (dt: DateTime): number => getCalendarValue(dt, ordinalCalendar).ordinal;
