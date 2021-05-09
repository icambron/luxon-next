import {GregorianDate} from "./calendars/gregorian";

export interface Calendar<TDate> {
    name: string;
    defaultValues: TDate;
    fromObject(obj: object): TDate;
    isInvalid(obj: TDate) : [string, number] | null;
    fromGregorian(obj: GregorianDate) : TDate;
    toGregorian(obj: TDate) : GregorianDate;
    areEqual(obj1: TDate, obj2: TDate): boolean;
}
