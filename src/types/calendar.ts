import { GregorianDate } from "./gregorian";

export interface Calendar<TDate> {
  name: string;
  defaultValues: TDate;
  fromObject(obj: object): TDate;
  isDateInvalid(obj: TDate): [string, number] | null;
  fromGregorian(obj: GregorianDate): TDate;
  toGregorian(obj: TDate): GregorianDate;
  areEqual(obj1: TDate, obj2: TDate): boolean;
}
