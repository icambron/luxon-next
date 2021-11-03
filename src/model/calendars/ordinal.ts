import {GregorianDate} from "./gregorian";
import {integerBetween, isInteger} from "../../lib/util";
import {computeOrdinal, daysInYear, uncomputeOrdinal} from "../../lib/dateMath";
import {Calendar} from "../calendar";
import {buildNormalizer, normalizeUnitBundle, simplePlural, OrdinalUnit, ordinalUnits} from "../units";

export interface OrdinalDate  {
    year: number;
    ordinal: number;
}

const ordinalNormalizer = buildNormalizer<OrdinalUnit>(ordinalUnits, simplePlural);

export class OrdinalCalendar implements  Calendar<OrdinalDate> {
    defaultValues = { year: 1, ordinal: 1 };
    name = "ordinal"

    fromObject = (obj: object) => normalizeUnitBundle<OrdinalDate>(obj, ordinalNormalizer);

    fromGregorian = (obj: GregorianDate): OrdinalDate => {
        const { year, month, day } = obj;
        return { year, ordinal: computeOrdinal(year, month, day) };
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

    areEqual = (obj1: OrdinalDate, obj2: OrdinalDate): boolean  =>
        obj1.year === obj2.year &&
        obj1.ordinal === obj2.ordinal;
}

export const ordinalInstance = new OrdinalCalendar();
