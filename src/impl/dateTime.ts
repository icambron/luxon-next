import { Calendar } from "../types/calendar";
import { Time } from "../types/time";
import Zone from "../types/zone";
import { getDefaultNowFn, getDefaultZone } from "../settings";
import { fromObject, hasInvalidTimeData } from "./time";
import { InvalidArgumentError, UnitOutOfRangeError } from "../errors";
import { gregorianInstance, gregorianToTS, tsToGregorian } from "../model/calendars/GregorianCalendar";
import { isNumber } from "../utils/typeCheck";
import { GregorianDate } from "../types/gregorian";
import { DateTime } from "../model/DateTime";

export const defaultTimeObject: Time = { hour: 0, minute: 0, second: 0, millisecond: 0 };

const fillInDefaults = <T extends object>(
  defaultValues: T,
  now: T,
  obj: Partial<T>,
  foundFirst: boolean = false
): [T, boolean] => {
  const result = { ...defaultValues };

  const keysOfDefault = Object.keys(defaultValues) as Array<keyof T>;

  for (const u of keysOfDefault) {
    const v = obj[u];
    if (v !== undefined) {
      foundFirst = true;
      result[u] = v as T[keyof T];
    } else if (!foundFirst) {
      result[u] = now[u];
    }
  }
  return [result, foundFirst];
};

const quick = (ts: number, zone: Zone): [GregorianDate, Time, number] => {
  const offset = zone.offset(ts);
  return [...tsToGregorian(ts, offset), offset];
};

export const fromMillis = (ts: number, zone?: Zone) => {
  if (!isNumber(ts)) {
    throw new InvalidArgumentError(`timestamps must be numerical, but received a ${typeof ts} with value ${ts}`);
  }

  const zoneToUse = zone || getDefaultZone();
  const [gregorian, time, offset] = quick(ts, zoneToUse);
  return new DateTime(ts, zoneToUse, gregorian, time, offset);
};

export const fromCalendar = <TDate extends object>(
  calendar: Calendar<TDate>,
  o: Partial<TDate & Time>,
  zone?: Zone
): DateTime => {
  const zoneToUse = zone || getDefaultZone();
  const tsNow = getDefaultNowFn()();
  // sub in the defaults
  const [gregorNow, timeNow, offsetProvis] = quick(tsNow, zoneToUse);
  const calendarNow = calendar.fromGregorian(gregorNow);

  let [date, found] = fillInDefaults<TDate>(calendar.defaultValues, calendarNow, calendar.fromObject(o));

  const [time, _] = fillInDefaults<Time>(defaultTimeObject, timeNow, fromObject(o), found);

  const error = calendar.isDateInvalid(date) || hasInvalidTimeData(time);
  if (error != null) {
    throw new UnitOutOfRangeError(error[0], error[1]);
  }

  const gregorian = calendar.toGregorian(date);

  const [ts, finalOffset, isHoleTime] = gregorianToTS(gregorian, time, offsetProvis, zoneToUse);

  // if it's a hole time, we'll adjust the calendar & time to the "real" one
  const [gregorianFinal, timeFinal] =
    isHoleTime || time.hour === 24 ? tsToGregorian(ts, finalOffset) : [gregorian, time];

  const calMap = new Map<string, any>();

  // initialize with this calendar
  if (calendar.name !== "gregorian") {
    // if the gregorian date changed, the originating date probably did too
    if (!gregorianInstance.areEqual(gregorian, gregorianFinal)) {
      date = calendar.fromGregorian(gregorian);
    }

    calMap.set(calendar.name, date);
  }

  return new DateTime(ts, zoneToUse, gregorianFinal, timeFinal, finalOffset, calMap);
};

export const alter = (dt: DateTime, ts: number, zone: Zone, offset?: number): DateTime => {
  let calendarValues: Map<string, any>, gregorian: GregorianDate, time: Time, newOffset: number;
  if (ts === dt.ts && zone.equals(dt.zone)) {
    newOffset = dt.offset;
    gregorian = dt.gregorian;
    time = dt.time;
    calendarValues = dt.calendarDates;
  } else {
    newOffset = offset || zone.offset(ts);
    [gregorian, time] = tsToGregorian(ts, newOffset);
    calendarValues = new Map<string, any>();
  }
  return new DateTime(ts, zone, gregorian, time, newOffset, calendarValues);
};

export const getCalendarValue = <TDate extends object>(dt: DateTime, calendar: Calendar<TDate>): TDate => {
  const computed = dt.calendarDates.get(calendar.name);
  if (computed) {
    return computed as TDate;
  } else {
    const val = calendar.fromGregorian(dt.gregorian);
    dt.calendarDates.set(calendar.name, val);
    return val;
  }
};

export const set = <TDate extends object>(
  dt: DateTime,
  calendar: Calendar<TDate>,
  obj: Partial<TDate & Time>,
  adjust?: (original: Partial<TDate & Time>, unadjusted: TDate & Time) => TDate & Time
): DateTime => {
  const current = getCalendarValue(dt, calendar);
  let mixed = { ...current, ...dt.time, ...obj } as TDate & Time;

  if (adjust) {
    mixed = adjust(obj, mixed);
  }

  const gregorian = calendar.toGregorian(mixed);

  const [ts, o] = gregorianToTS(gregorian, mixed, dt.offset, dt.zone);
  return alter(dt, ts, dt.zone, o);
};

