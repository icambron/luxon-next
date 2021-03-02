import Zone from "./zone";
import {CalendarDate} from "./calendar";
import {GregorianDate} from "./calendars/gregorian";
import Time from "./time";


export default class DateTime {
    readonly zone: Zone;
    readonly ts: number;
    readonly offset: number;
    private readonly _gregorian: GregorianDate;
    private readonly _time: Time;
    private readonly _otherCalendarValues: Map<string, CalendarDate>;
    isLuxonDateTime : boolean = true;

    get gregorian(): GregorianDate {
        return {...this._gregorian};
    }

    get time(): Time {
        return {...this.time};
    }

    get otherCalendarValues(): Map<string, CalendarDate> {
        return new Map<string, CalendarDate>(this._otherCalendarValues);
    }

    // these are here to allow for automatic processing  of the object
    toJSON = (): string => "todo";
    toString = (): string => this.toJSON();
    toBSON = (): Date => new Date(this.ts);
    valueOf = (): number => this.ts;

    constructor(
        ts: number,
        zone: Zone,
        gregorian: GregorianDate,
        time: Time,
        offset: number,
        otherCalendarValues: Map<string, CalendarDate> = new Map<string, CalendarDate>()) {
        this.zone = zone;
        this.ts = ts;
        this._gregorian = gregorian;
        this._time = time;
        this.offset = offset;
        this._otherCalendarValues = otherCalendarValues;
    }
}
