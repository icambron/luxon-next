import {Calendar, CalendarDate} from "../calendar";
import {
    integerBetween,
    isInteger,
} from "../../impl/util";
import {GregorianDate} from "./gregorian";
import {computeOrdinal, daysInYear, uncomputeOrdinal} from "../../impl/dateMath";

const dayOfWeek = (year: number, month: number, day: number) => {
    const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return js === 0 ? 7 : js;
};

export interface ISOWeekDate extends CalendarDate {
    weekYear: number;
    weekNumber: number;
    weekday: number;
}

export class IsoWeekCalendar implements Calendar<ISOWeekDate> {
    defaultValues = { weekYear: 1, weekNumber: 1, weekday: 1};
    name = "isoweekdate";

    fromGregorian(obj: GregorianDate): ISOWeekDate {
        const { year, month, day } = obj,
            ordinal = computeOrdinal(year, month, day),
            weekday = dayOfWeek(year, month, day);

        let weekNumber = Math.floor((ordinal - weekday + 10) / 7),
            weekYear;

        if (weekNumber < 1) {
            weekYear = year - 1;
            weekNumber = weeksInWeekYear(weekYear);
        } else if (weekNumber > weeksInWeekYear(year)) {
            weekYear = year + 1;
            weekNumber = 1;
        } else {
            weekYear = year;
        }

        return { weekYear, weekNumber, weekday };
    }

    isInvalid(obj: ISOWeekDate): [string, number] | null {
        if (!isInteger(obj.weekYear)) {
            return ["weekYear", obj.weekYear];
        }

        if (!integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear))) {
            return ["weekNumber", obj.weekNumber];
        }

        if (!integerBetween(obj.weekday, 1, 7)) {
            return ["weekday", obj.weekday];
        }
        return null;
    }

    toGregorian(obj: ISOWeekDate): GregorianDate {
        const { weekYear, weekNumber, weekday } = obj;
        const weekdayOfJan4 = dayOfWeek(weekYear, 1, 4);
        const yearInDays = daysInYear(weekYear);

        let ordinal: number = weekNumber * 7 + weekday - weekdayOfJan4 - 3;
        let year: number;

        if (ordinal < 1) {
            year = weekYear - 1;
            ordinal += daysInYear(year);
        } else if (ordinal > yearInDays) {
            year = weekYear + 1;
            ordinal -= daysInYear(weekYear);
        } else {
            year = weekYear;
        }

        const { month, day } = uncomputeOrdinal(year, ordinal);
        return { year, month, day };
    }
}

export const isoCalendarInstance = new IsoWeekCalendar();

export function weeksInWeekYear(weekYear: number): number {
    const p1 =
        (weekYear +
            Math.floor(weekYear / 4) -
            Math.floor(weekYear / 100) +
            Math.floor(weekYear / 400)) %
        7,
        last = weekYear - 1,
        p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
    return p1 === 4 || p2 === 3 ? 53 : 52;
}
