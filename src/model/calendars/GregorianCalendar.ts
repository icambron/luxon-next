import { Calendar } from "../../types/calendar";
import { daysInGregorianMonth } from "../../utils/dateMath";
import { buildNormalizer, gregorianUnits, normalizeUnitBundle, simplePlural } from "../../utils/units";
import Zone from "../../types/zone";
import { GregorianDate, GregorianUnit } from "../../types/gregorian";
import { Time } from "../../types/time";
import { integerBetween } from "../../utils/numeric";
import { isInteger } from "../../utils/typeCheck";

/*
The Gregorian calendar (i.e. the dates we use in everyday life) is the lingua franca of Luxon. It's thus a sort of
privileged calendar, primarily because we know how to convert it to and from a timestamp. We can do that with other
calendars too, but only by converting them to or from Gregorian first.
 */

const gregorianNormalizer = buildNormalizer<GregorianUnit>(gregorianUnits, simplePlural);

export class GregorianCalendar implements Calendar<GregorianDate> {
    name = "gregorian";
    defaultValues = { year: 1, month: 1, day: 1 };

    fromObject = (obj: object): GregorianDate => normalizeUnitBundle<GregorianDate>(obj, gregorianNormalizer);
    fromGregorian = (obj: GregorianDate): GregorianDate => obj;
    toGregorian = (obj: GregorianDate): GregorianDate => obj;

    isDateInvalid = ({year, month, day}: any): [string, number] | null => {
        if (!isInteger(year)) {
            return ["year", year];
        } else if (!integerBetween(month, 1, 12)) {
            return ["month", month];
        } else if (!integerBetween(day, 1, daysInGregorianMonth(year, month))) {
            return ["day", day];
        } else return null;
    };

    areEqual = (obj1: GregorianDate, obj2: GregorianDate): boolean  =>
        obj1.year === obj2.year &&
        obj1.month === obj2.month &&
        obj1.day === obj2.day;
}

export const gregorianInstance: GregorianCalendar = new GregorianCalendar();

// convert a calendar object to a local timestamp (epoch, but with the offset baked in)
export const gregorianToLocalTS = (gregorianDate: GregorianDate, time: Time) => {

    const ts = Date.UTC(
        gregorianDate.year,
        gregorianDate.month - 1,
        gregorianDate.day,
        time.hour,
        time.minute,
        time.second,
        time.millisecond
    );

    // for legacy reasons, years between 0 and 99 are interpreted as 19XX; revert that
    if (0 < gregorianDate.year && gregorianDate.year <= 99) {
        const date = new Date(ts);
        date.setUTCFullYear(date.getUTCFullYear() - 1900);
        return date.getTime();
    }
    return ts;
};

export const gregorianToTS = (gregorianDate: GregorianDate, time: Time, offset: number, zone: Zone): [number, number, boolean] =>
    fixOffset(gregorianToLocalTS(gregorianDate, time), offset, zone);

// convert an epoch timestamp into a calendar object with the given offset
export const tsToGregorian = (ts: number, offset: number): [GregorianDate, Time] => {
    ts += offset * 60 * 1000;

    const d = new Date(ts);

    const gregorianDate : GregorianDate = {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
    };

    const time : Time = {
        hour: d.getUTCHours(),
        minute: d.getUTCMinutes(),
        second: d.getUTCSeconds(),
        millisecond: d.getUTCMilliseconds()
    };

    return [gregorianDate, time];
};

export const adjustCalendarOverflow = (greg: GregorianDate & Time): GregorianDate & Time => {
    const {year, month, day} = greg;
    return {...greg, day: Math.min(day, daysInGregorianMonth(year, month))};
};

// find the right offset at a given local time. The o input is our guess, which determines which
// offset we'll pick in ambiguous cases (e.g. there are two 3 AMs b/c Fallback DST)
const fixOffset = (localTS: number, offset: number, zone: Zone): [number, number, boolean] => {
    // Our UTC time is just a guess because our offset is just a guess
    let utcGuess = localTS - offset * 60 * 1000;

    // Test whether the zone matches the offset for this ts
    const o2 = zone.offset(utcGuess);

    // If so, offset didn't change and we're done
    if (offset === o2) {
        return [utcGuess, offset, false];
    }

    // If not, change the ts by the difference in the offset
    utcGuess -= (o2 - offset) * 60 * 1000;

    // If that gives us the local time we want, we're done
    const o3 = zone.offset(utcGuess);
    if (o2 === o3) {
        return [utcGuess, o2, false];
    }

    // If it's different, we're in a hole time. The offset has changed, but the we don't adjust the time
    return [localTS - Math.min(o2, o3) * 60 * 1000, Math.max(o2, o3), true];
};
