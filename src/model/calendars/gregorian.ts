import {Calendar, CalendarDate} from "../calendar";
import Time from "../time";
import Zone from "../zone";
import {floorMod, integerBetween, isInteger} from "../../impl/util";
import {isLeapYear} from "../../impl/dateMath";

export interface GregorianDate extends CalendarDate {
    year: number;
    month: number;
    day: number;
}

export class GregorianCalendar implements Calendar<GregorianDate> {
    name = "gregorian";
    defaultValues = { year: 1, month: 1, day: 1 };

    fromGregorian = (obj: GregorianDate): GregorianDate => obj;

    isInvalid = (obj: any): [string, number] | null => {
        const validYear = isInteger(obj.year),
            validMonth = integerBetween(obj.month, 1, 12),
            validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));

        if (!validYear) {
            return ["year", obj.year];
        } else if (!validMonth) {
            return ["month", obj.month];
        } else if (!validDay) {
            return ["day", obj.day];
        } else return null;
    };

    toGregorian = (obj: GregorianDate): GregorianDate => obj;
}

export const gregorianInstance: GregorianCalendar = new GregorianCalendar();

export function daysInMonth(year: number, month: number) {
    const modMonth = floorMod(month - 1, 12) + 1,
        modYear = year + (month - modMonth) / 12;
    return [31, isLeapYear(modYear) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
}

export const gregorianToTS = (gregorianDate: GregorianDate, time: Time, offset: number, zone: Zone): [number, number] =>
    fixOffset(objToLocalTS(gregorianDate, time), offset, zone);

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

// convert a calendar object to a local timestamp (epoch, but with the offset baked in)
export function objToLocalTS(gregorianDate: GregorianDate, time: Time) {
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
    if (integerBetween(gregorianDate.year, 0, 99)) {
        const date = new Date(ts);
        date.setUTCFullYear(date.getUTCFullYear() - 1900);
        return date.getTime();
    }

    return ts;
}

// find the right offset at a given local time. The o input is our guess, which determines which
// offset we'll pick in ambiguous cases (e.g. there are two 3 AMs b/c Fallback DST)
const fixOffset = (localTS: number, offset: number, zone: Zone): [number, number] => {
    // Our UTC time is just a guess because our offset is just a guess
    let utcGuess = localTS - offset * 60 * 1000;

    // Test whether the zone matches the offset for this ts
    const o2 = zone.offset(utcGuess);

    // If so, offset didn't change and we're done
    if (offset === o2) {
        return [utcGuess, offset];
    }

    // If not, change the ts by the difference in the offset
    utcGuess -= (o2 - offset) * 60 * 1000;

    // If that gives us the local time we want, we're done
    const o3 = zone.offset(utcGuess);
    if (o2 === o3) {
        return [utcGuess, o2];
    }

    // If it's different, we're in a hole time. The offset has changed, but the we don't adjust the time
    return [localTS - Math.min(o2, o3) * 60 * 1000, Math.max(o2, o3)];
};
