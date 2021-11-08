import { Zone, Calendar, DateTime, GregorianDate, Time } from "../types";
import { getNowFn, getDefaultZone } from "../settings";
import { fromObject, hasInvalidTimeData } from "./time";
import { InvalidArgumentError, UnitOutOfRangeError } from "../errors";
import { gregorianInstance, gregorianToTS, tsToGregorian } from "./calendars/gregorian";
import { isNumber } from "./util/typeCheck";

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

export const fromMillis = (ts: number, zone?: Zone): DateTime => {
  if (!isNumber(ts)) {
    throw new InvalidArgumentError(`timestamps must be numerical, but received a ${typeof ts} with value ${ts}`);
  }

  const zoneToUse = zone || getDefaultZone();
  const [gregorian, time, offset] = quick(ts, zoneToUse);
  return new DateTimeImpl(ts, zoneToUse, gregorian, time, offset);
};

export const fromCalendar = <TDate extends object>(
  calendar: Calendar<TDate>,
  o: Partial<TDate & Time>,
  zone?: Zone
): DateTime => {
  const zoneToUse = zone || getDefaultZone();
  const tsNow = getNowFn()();
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

  return new DateTimeImpl(ts, zoneToUse, gregorianFinal, timeFinal, finalOffset, calMap);
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
  return new DateTimeImpl(ts, zone, gregorian, time, newOffset, calendarValues);
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

export const MAX_DATE = 8.64e15;
const assertValidTs = (ts: number) => {
  if (isNaN(ts) || ts > MAX_DATE || ts < -MAX_DATE) {
    throw new InvalidArgumentError("Timestamp out of range");
  }
};

class DateTimeImpl implements DateTime {
  readonly zone: Zone;
  readonly ts: number;
  readonly offset: number;
  readonly isLuxonDateTime: boolean = true;

  private readonly _gregorian: GregorianDate;
  private readonly _time: Time;
  private readonly _calendarDates: Map<string, any>;

  get gregorian(): GregorianDate {
    return { ...this._gregorian };
  }

  get time(): Time {
    return { ...this._time };
  }

  get calendarDates(): Map<string, any> {
    return new Map<string, any>(this._calendarDates);
  }

  // these are here so that automagic layers work as expected
  toJSON(): string {
    return this.toString();
  }

  toString(): string {
    return new Date(this.ts).toISOString();
  }

  toBSON(): Date {
    return new Date(this.ts);
  }

  valueOf(): number {
    return this.ts;
  }

  equals(other: any): boolean {
    return (
      !!other &&
      other.isLuxonDateTime !== undefined &&
      this.valueOf() === other.valueOf() &&
      this.zone.equals(other.zone)
    );
  }

  constructor(
    ts: number,
    zone: Zone,
    gregorian: GregorianDate,
    time: Time,
    offset: number,
    otherCalendarDates: Map<string, any> = new Map<string, any>()
  ) {
    assertValidTs(ts);

    this.zone = zone;
    this.ts = ts;
    this._gregorian = gregorian;
    this._time = time;
    this.offset = offset;
    this._calendarDates = otherCalendarDates;
    this._calendarDates.set(gregorianInstance.name, gregorian);
  }
}
