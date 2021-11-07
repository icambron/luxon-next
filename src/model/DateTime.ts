import { gregorianInstance } from "./calendars/GregorianCalendar";
import { InvalidArgumentError } from "../errors";
import Zone from "../types/zone";
import { GregorianDate } from "../types/gregorian";
import { Time } from "../types/time";

export const MAX_DATE = 8.64e15;

const assertValidTs = (ts: number) => {
  if (isNaN(ts) || ts > MAX_DATE || ts < -MAX_DATE) {
    throw new InvalidArgumentError("Timestamp out of range");
  }
};

export class DateTime {
  readonly zone: Zone;
  readonly ts: number;
  readonly offset: number;
  private readonly _gregorian: GregorianDate;
  private readonly _time: Time;
  private readonly _calendarDates: Map<string, any>;
  isLuxonDateTime: boolean = true;

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

