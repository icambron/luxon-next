import { computeOrdinal, daysInYear, uncomputeOrdinal } from "../util/dateMath";
import { normalizeUnit, normalizeUnitBundle, ordinalUnits, simplePlural } from "../util/units";
import { integerBetween } from "../util/numeric";
import { isInteger } from "../util/typeCheck";
import { GregorianDate, OrdinalCalendar, OrdinalDate, OrdinalUnit } from "../../types";

const ordinalNormalizer = (unit: string, throwOnError?: boolean) => normalizeUnit<OrdinalUnit>("ordinalunit", ordinalUnits, simplePlural, unit, throwOnError);

class OrdinalCalendarImpl implements OrdinalCalendar {
    defaultValues = { year: 1, ordinal: 1 };
    name = "ordinal"

    fromObject = (obj: object) => normalizeUnitBundle<OrdinalDate>(obj, ordinalNormalizer);

    fromGregorian = (obj: GregorianDate): OrdinalDate => {
        const { year, month, day } = obj;
        return { year, ordinal: computeOrdinal(year, month, day) };
    };

    isDateInvalid = (obj: OrdinalDate): [string, number] | null => {
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

    areEqual = (obj1: OrdinalDate, obj2: OrdinalDate): boolean  =>
        obj1.year === obj2.year &&
        obj1.ordinal === obj2.ordinal;
}

export const ordinalInstance = new OrdinalCalendarImpl();
