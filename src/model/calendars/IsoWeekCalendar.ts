import { Calendar } from "../../types/calendar";
import { computeOrdinal, daysInYear, uncomputeOrdinal, weeksInWeekYear } from "../../utils/dateMath";
import { buildNormalizer, isoWeekUnits, normalizeUnitBundle, simplePlural } from "../../utils/units";
import { GregorianDate } from "../../types/gregorian";
import { ISOWeekDate, IsoWeekUnit } from "../../types/isoWeek";
import { integerBetween } from "../../utils/numeric";
import { isInteger } from "../../utils/typeCheck";

const isoWeekNormalizer = buildNormalizer<IsoWeekUnit>(isoWeekUnits, simplePlural);

const dayOfWeek = (year: number, month: number, day: number) => {
    const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return js === 0 ? 7 : js;
};

export class IsoWeekCalendar implements Calendar<ISOWeekDate> {
    defaultValues = { weekYear: 1, weekNumber: 1, weekday: 1};
    name = "isoweekdate";

    fromObject = (obj: object) => normalizeUnitBundle<ISOWeekDate>(obj, isoWeekNormalizer);

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

    isDateInvalid(obj: ISOWeekDate): [string, number] | null {
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

    areEqual = (obj1: ISOWeekDate, obj2: ISOWeekDate): boolean  =>
        obj1.weekYear === obj2.weekYear &&
        obj1.weekNumber === obj2.weekNumber &&
        obj1.weekday === obj2.weekday;
}

export const isoWeekCalendarInstance = new IsoWeekCalendar();

