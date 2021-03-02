import {GregorianDate} from "./calendars/gregorian";

export interface CalendarDate { }

export interface Calendar<TDate extends CalendarDate> {
    name: string;
    defaultValues: TDate;
    isInvalid(obj: TDate) : [string, number] | null;
    fromGregorian(obj: GregorianDate) : TDate;
    toGregorian(obj: TDate) : GregorianDate;
}
