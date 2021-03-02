// rule: only depends on model and other impl

import Time, {hasInvalidTimeData} from "../model/time";
import {keys} from "ts-transformer-keys";
import Zone from "../model/zone";
import {GregorianDate, gregorianToTS, tsToGregorian} from "../model/calendars/gregorian";
import {getDefaultNowFn, getDefaultZone} from "../model/settings";
import {Calendar, CalendarDate} from "../model/calendar";
import {UnitOutOfRangeError} from "../model/errors";
import DateTime from "../model/dateTime";

export const defaultTimeObject: Time = { hour: 0, minute: 0, second: 0, millisecond: 0 };

const fillInDefaults = <T extends object>(defaultValues: T, now: T, obj: Partial<T>) : T => {
    let foundFirst = false;
    const result = {...defaultValues};

    const keysOfDefault = keys<T>();

    for (const u of keysOfDefault) {
        const v = obj[u];
        if (v != undefined) {
            foundFirst = true;
            result[u] = v as T[keyof T];
        } else if (!foundFirst) {
            result[u] = now[u];
        }
    }
    return result;
}

const quick = (ts: number, zone: Zone): [GregorianDate, Time, number] => {
    const offset = zone.offset(ts);
    return [...tsToGregorian(ts, offset), offset];
}

export const fromMillis = (ts: number, zone?: Zone) => {
    const zoneToUse = zone || getDefaultZone();
    const [gregorian, time, offset] = quick(ts, zoneToUse);
    return new DateTime(ts, zoneToUse, gregorian, time, offset);
}

export const fromCalendar = <TDate extends CalendarDate>(calendar: Calendar<TDate>, o: Partial<TDate & Time> , zone?: Zone): DateTime => {
    const zoneToUse = zone || getDefaultZone();
    const tsNow = getDefaultNowFn()();
    // sub in the defaults
    const [gregorNow, timeNow, offsetProvis] = quick(tsNow, zoneToUse);
    const calendarNow = calendar.fromGregorian(gregorNow);

    const date = fillInDefaults<TDate>(calendar.defaultValues, calendarNow, o);
    const time = fillInDefaults<Time>(defaultTimeObject, timeNow, o);

    const error = calendar.isInvalid(date) || hasInvalidTimeData(time);
    if (error != null) {
        throw new UnitOutOfRangeError(error[0], error[1]);
    }

    const calMap = new Map<string, CalendarDate>();

    // initialize with this calendar
    if (calendar.name !== "gregorian") {
        calMap.set(calendar.name, date);
    }

    const backToGregor = calendar.toGregorian(date);
    const [ts, finalOffset] = gregorianToTS(backToGregor, time, offsetProvis, zoneToUse);

    return new DateTime(ts, zoneToUse, backToGregor, time, finalOffset, calMap);
};

export const alter = (dt: DateTime, ts: number, zone: Zone, offset?: number) : DateTime => {
    let calendarValues: Map<string, CalendarDate>,
        gregorian: GregorianDate,
        time: Time,
        newOffset: number;
    if (ts === dt.ts && zone.equals(dt.zone)) {
        newOffset = dt.offset;
        gregorian = dt.gregorian;
        time = dt.time;
        calendarValues = dt.otherCalendarValues;
    } else {
        newOffset = offset || zone.offset(ts);
        [gregorian, time] = tsToGregorian(ts, newOffset);
        calendarValues = new Map<string, CalendarDate>();
    }
    return new DateTime(ts, zone, gregorian, time, newOffset, calendarValues);
}

export const getCalendarValue = <TDate extends CalendarDate>(dt: DateTime, calendar: Calendar<TDate>) : TDate => {
    // someone who knows TS better than me, please clean this up
    if (calendar.name === "gregorian") {
        return dt.gregorian as unknown as TDate;
    }

    const computed = dt.otherCalendarValues.get(calendar.name);
    if (computed) {
        return computed as TDate;
    } else {
        const val = calendar.fromGregorian(dt.gregorian);
        dt.otherCalendarValues.set(calendar.name, val);
        return val;
    }
}

export const set = <TDate extends CalendarDate>(dt: DateTime, calendar: Calendar<TDate>, obj: Partial<TDate & Time>): DateTime => {
    const current = getCalendarValue(dt, calendar);
    const mixed = {...current, ...dt.time, ...obj} as TDate & Time;
    const gregorian = calendar.toGregorian(mixed);
    const [ts, o] = gregorianToTS(gregorian, mixed, dt.offset, dt.zone);
    return alter(dt, ts, dt.zone, o);
}
