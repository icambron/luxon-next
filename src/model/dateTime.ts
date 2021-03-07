import Zone, {isZone, Zoneish} from "./zone";
import {Calendar, CalendarDate} from "./calendar";
import {GregorianDate, gregorianInstance, gregorianToTS, tsToGregorian} from "./calendars/gregorian";
import Time, {hasInvalidTimeData} from "./time";
import {formatOffset, isNumber, isString, isUndefined} from "../impl/util";
import {getDefaultNowFn, getDefaultZone} from "./settings";
import {InvalidArgumentError, InvalidZoneError, UnitOutOfRangeError} from "./errors";
import {systemZone} from "./zones/systemZone";
import {fixedOffsetZone, parseFixedOffset, utcInstance} from "./zones/fixedOffsetZone";
import {createIANAZone, isValidIANASpecifier} from "./zones/IANAZone";

const MAX_DATE = 8.64e15;

const quickIso = (dt: DateTime) => {
    // a quick and dirty version of toISO with no options
    const {gregorian, time, offset} = dt;
    const {year, month, day} = gregorian;
    const yearStr: string = year > 9999 ? `+${year}` : year.toString();
    const {hour, minute, second, millisecond} = time;
    const formattedOffset = formatOffset(offset, "techie");
    return `${yearStr}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}${formattedOffset}`;
}

export const defaultTimeObject: Time = { hour: 0, minute: 0, second: 0, millisecond: 0 };

const fillInDefaults = <T extends object>(defaultValues: T, now: T, obj: Partial<T>, foundFirst: boolean = false) : [T, boolean] => {
    const result = {...defaultValues};

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
}

const quick = (ts: number, zone: Zone): [GregorianDate, Time, number] => {
    const offset = zone.offset(ts);
    return [...tsToGregorian(ts, offset), offset];
}

export const fromMillis = (ts: number, zone?: Zone) => {
    if (!isNumber(ts)) {
        throw new InvalidArgumentError(`timestamps must be numerical, but received a ${typeof ts} with value ${ts}`);
    }
    else if (ts < -MAX_DATE || ts > MAX_DATE) {
        // this isn't perfect because because we can still end up out of range because of additional shifting, but it's a start
        throw new InvalidArgumentError("Timestamp out of range");
    }
    const zoneToUse = zone || getDefaultZone();
    const [gregorian, time, offset] = quick(ts, zoneToUse);
    return new DateTime(ts, zoneToUse, gregorian, time, offset);
}

export const fromCalendar = <TDate extends CalendarDate>(calendar: Calendar<TDate>, o: Partial<TDate & Time> , zone?: Zone): DateTime =>{
    const zoneToUse = zone || getDefaultZone();
    const tsNow = getDefaultNowFn()();
    // sub in the defaults
    const [gregorNow, timeNow, offsetProvis] = quick(tsNow, zoneToUse);
    const calendarNow = calendar.fromGregorian(gregorNow);

    const [date, found] = fillInDefaults<TDate>(calendar.defaultValues, calendarNow, o);
    const [time, _] = fillInDefaults<Time>(defaultTimeObject, timeNow, o, found);

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
        calendarValues = dt.calendarDates;
    } else {
        newOffset = offset || zone.offset(ts);
        [gregorian, time] = tsToGregorian(ts, newOffset);
        calendarValues = new Map<string, CalendarDate>();
    }
    return new DateTime(ts, zone, gregorian, time, newOffset, calendarValues);
}

export const getCalendarValue = <TDate extends CalendarDate>(dt: DateTime, calendar: Calendar<TDate>) : TDate => {
    const computed = dt.calendarDates.get(calendar.name);
    if (computed) {
        return computed as TDate;
    } else {
        const val = calendar.fromGregorian(dt.gregorian);
        dt.calendarDates.set(calendar.name, val);
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

export default class DateTime {
    readonly zone: Zone;
    readonly ts: number;
    readonly offset: number;
    private readonly _gregorian: GregorianDate;
    private readonly _time: Time;
    private readonly _calendarDates: Map<string, CalendarDate>;
    isLuxonDateTime : boolean = true;

    get gregorian(): GregorianDate {
        return {...this._gregorian};
    }

    get time(): Time {
        return {...this._time};
    }

    get calendarDates(): Map<string, CalendarDate> {
        return new Map<string, CalendarDate>(this._calendarDates);
    }

    // these are here so that automagic layers work as expected
    toJSON = (): string => quickIso(this);
    toString = (): string => quickIso(this);
    toBSON = (): Date => new Date(this.ts);
    valueOf = (): number => this.ts;

    constructor(
        ts: number,
        zone: Zone,
        gregorian: GregorianDate,
        time: Time,
        offset: number,
        otherCalendarDates: Map<string, CalendarDate> = new Map<string, CalendarDate>()) {
        this.zone = zone;
        this.ts = ts;
        this._gregorian = gregorian;
        this._time = time;
        this.offset = offset;
        this._calendarDates = otherCalendarDates;
        this._calendarDates.set(gregorianInstance.name, gregorian);
    }
}

export const normalizeZone = (zoneish: Zoneish): Zone => {
    if (isUndefined(zoneish) || zoneish === null) return getDefaultZone();
    if (isZone(zoneish)) return zoneish;
    if (isString(zoneish)) {
        const lowered = zoneish.toLowerCase();
        if (lowered === "default") return getDefaultZone();
        if (lowered === "system") return systemZone();
        if (lowered === "utc") return utcInstance();
        if (isValidIANASpecifier(lowered)) return createIANAZone(zoneish);

        const parsed = parseFixedOffset(lowered);

        if (!parsed) {
            throw new InvalidZoneError(zoneish);
        }

        return parsed;
    }
    if (isNumber(zoneish)) return fixedOffsetZone(zoneish);
    throw new InvalidZoneError(zoneish);
}
