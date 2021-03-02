import {GregorianDate} from "./gregorian";
import {integerBetween, isInteger} from "../../impl/util";
import {computeOrdinal, daysInYear, uncomputeOrdinal} from "../../impl/dateMath";
import {Calendar, CalendarDate} from "../calendar";

export interface OrdinalDate extends CalendarDate {
    year: number;
    ordinal: number;
}

export class OrdinalCalendar implements  Calendar<OrdinalDate> {
    defaultValues = { year: 1, ordinal: 1 };
    name = "ordinal"

    fromGregorian = (obj: GregorianDate): OrdinalDate => {
        const { year, month, day } = obj,
            ordinal = computeOrdinal(year, month, day);
        return { year, ordinal };
    };

    isInvalid = (obj: OrdinalDate): [string, number] | null => {
        if (!isInteger(obj.year)) {
            return ["year", obj.year];
        }

        if (!integerBetween(obj.ordinal, 1, daysInYear(obj.year))) {
            return ["ordinal", obj.ordinal];
        }

        return null;
    };

    toGregorian = ({ year, ordinal }: OrdinalDate): GregorianDate =>
        ({year, ...uncomputeOrdinal(year, ordinal)});
}
