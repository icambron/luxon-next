import {intAndFraction, isUndefined, roundTo} from "../impl/util";
import {pluralizeUnit, PluralUnit, Unit} from "./units";

export type DurationValues = {
    readonly [unit in PluralUnit] : number
};


type MutableDurationValues = {
    [unit in PluralUnit] : number
}

const durationZeroes: DurationValues = { years: 0, quarters: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
const durationValueKeys: Array<keyof DurationValues> = Object.keys(durationZeroes) as Array<keyof DurationValues>;

export type ConversionAccuracy = "casual" | "longterm";
type Trie = Record<string, Record<string, number>>;

const lowOrderMatrix: Trie = {
    weeks: {
        days: 7,
        hours: 7 * 24,
        minutes: 7 * 24 * 60,
        seconds: 7 * 24 * 60 * 60,
        milliseconds: 7 * 24 * 60 * 60 * 1000
    },
    days: {
        hours: 24,
        minutes: 24 * 60,
        seconds: 24 * 60 * 60,
        milliseconds: 24 * 60 * 60 * 1000
    },
    hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1000 },
    minutes: { seconds: 60, milliseconds: 60 * 1000 },
    seconds: { milliseconds: 1000 }
};

const casualMatrix: Trie = {
    years: {
        months: 12,
        quarters: 4,
        weeks: 52,
        days: 365,
        hours: 365 * 24,
        minutes: 365 * 24 * 60,
        seconds: 365 * 24 * 60 * 60,
        milliseconds: 365 * 24 * 60 * 60 * 1000
    },
    quarters: {
        months: 3,
        weeks: 13,
        days: 91,
        hours: 91 * 24,
        minutes: 91 * 24 * 60,
        milliseconds: 91 * 24 * 60 * 60 * 1000
    },
    months: {
        weeks: 4,
        days: 30,
        hours: 30 * 24,
        minutes: 30 * 24 * 60,
        seconds: 30 * 24 * 60 * 60,
        milliseconds: 30 * 24 * 60 * 60 * 1000
    },
    ...lowOrderMatrix
};

const daysInYearAccurate = 146097.0 / 400;
const daysInMonthAccurate = 146097.0 / 4800;

const accurateMatrix: Trie = {
    years: {
        months: 12,
        weeks: daysInYearAccurate / 7,
        days: daysInYearAccurate,
        hours: daysInYearAccurate * 24,
        minutes: daysInYearAccurate * 24 * 60,
        seconds: daysInYearAccurate * 24 * 60 * 60,
        milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000
    },
    quarters: {
        months: 3,
        weeks: daysInYearAccurate / 28,
        days: daysInYearAccurate / 4,
        hours: (daysInYearAccurate * 24) / 4,
        minutes: (daysInYearAccurate * 24 * 60) / 4,
        seconds: (daysInYearAccurate * 24 * 60 * 60) / 4,
        milliseconds: (daysInYearAccurate * 24 * 60 * 60 * 1000) / 4
    },
    months: {
        weeks: daysInMonthAccurate / 7,
        days: daysInMonthAccurate,
        hours: daysInMonthAccurate * 24,
        minutes: daysInMonthAccurate * 24 * 60,
        seconds: daysInMonthAccurate * 24 * 60 * 60,
        milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000
    },
    ...lowOrderMatrix
};

export const toMillis = (values: Partial<DurationValues>, conversionAccuracy: ConversionAccuracy = "casual"): number => {
    const matrix = conversionAccuracy === "casual" ? casualMatrix : accurateMatrix;
    return durationValueKeys.reduce((total: number, k) => {
        const val = values[k];
        if (isUndefined(val)) return total;
        const ratio = k === "milliseconds" ? 1 : matrix[k]["milliseconds"];
        return total + ratio * val;
    }, 0);
}

interface AccumulatedFractions {
    ints: MutableDurationValues;
    remainderMilliseconds: number
}

export const shiftFractionsToMillis = (dur: Duration) : Duration => {
    const matrix = dur.conversionAccuracy === "casual" ? casualMatrix : accurateMatrix;

    const vs =  {milliseconds: 0, ...dur.values};

    const newVals = durationValueKeys.reduce((accum: AccumulatedFractions, k) => {
        const val = vs[k] || 0;

        const [whole, fraction] = intAndFraction(val);
        accum.ints[k] = whole;

        if (k !== "milliseconds") {
            accum.remainderMilliseconds += matrix[k]["milliseconds"] * fraction;
        }

        return accum;
    }, { ints: {}, remainderMilliseconds: 0,  } as AccumulatedFractions);

    // no fractional millis please
    newVals.ints.milliseconds = roundTo(newVals.ints.milliseconds + newVals.remainderMilliseconds, 0);

    return new Duration(newVals.ints as Partial<DurationValues>, dur.conversionAccuracy);
}

export const toIso = (dur: Duration): string => {
    let s = "P";
    if (dur.values.years !== 0) s += dur.values.years + "Y";
    if (dur.values.months !== 0 || dur.values.quarters !== 0) s += (dur.values.months || 0) + (dur.values.quarters || 0) * 3 + "M";
    if (dur.values.weeks !== 0) s += dur.values.weeks + "W";
    if (dur.values.days !== 0) s += dur.values.days + "D";
    if (dur.values.hours !== 0 || dur.values.minutes !== 0 || dur.values.seconds !== 0 || dur.values.milliseconds !== 0)
        s += "T";
    if (dur.values.hours !== 0) s += dur.values.hours + "H";
    if (dur.values.minutes !== 0) s += dur.values.minutes + "M";
    if (dur.values.seconds !== 0 || dur.values.milliseconds !== 0)
        // this will handle "floating point madness" by removing extra decimal places
        // https://stackoverflow.com/questions/588004/is-floating-point-math-broken
        s += roundTo((dur.values.seconds || 0) + (dur.values.milliseconds || 0) / 1000, 3) + "S";
    if (s === "P") s += "T0S";
    return s;
}

export default class Duration {
    private readonly _values: Partial<DurationValues>;
    readonly conversionAccuracy: ConversionAccuracy;
    readonly isLuxonDuration = true;

    constructor(values: Partial<DurationValues>, conversionAccuracy: ConversionAccuracy = "casual") {
       this._values = Object.fromEntries(Object.entries(values).map(([k, v]) => [pluralizeUnit(k), v]))
       this.conversionAccuracy = conversionAccuracy;
    };

    get values(): Partial<DurationValues> {
        return this._values;
    }

    toJson(): string {return toIso(this)};
    toString(): string {return toIso(this)};
    valueOf(): number {return toMillis(this.values, this.conversionAccuracy)};
}

export const defaultEmpties = (values: Partial<DurationValues>): DurationValues => ({...durationZeroes, ...values})

export const isDuration = (obj: any): obj is Duration => obj && obj.isLuxonDuration;

export const alter = (dur: Duration, values: DurationValues, conversionAccuracy?: ConversionAccuracy) : Duration =>
    new Duration({...dur.values, ...values}, conversionAccuracy || dur.conversionAccuracy)
