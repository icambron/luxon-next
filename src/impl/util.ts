// todo: clean this up, once enough of the rest is in place

import { InvalidArgumentError } from "../model/errors"
import {ZoneOffsetFormat} from "../model/zone";

/**
 * @private
 */

// TYPES

export function isUndefined(o: unknown): o is number {
    return typeof o === "undefined";
}

export function isNumber(o: unknown): o is number {
    return typeof o === "number";
}

export function isInteger(o: unknown) {
    return typeof o === "number" && o % 1 === 0;
}

export function isString(o: unknown): o is string {
    return typeof o === "string";
}

export function isDate(o: unknown): o is Date {
    return Object.prototype.toString.call(o) === "[object Date]";
}

// CAPABILITIES

export function hasIntl() {
    try {
        return typeof Intl !== "undefined" && !!Intl.DateTimeFormat;
    } catch (e) {
        return false;
    }
}

export function hasFormatToParts() {
    return !(typeof(Intl.DateTimeFormat.prototype.formatToParts) == "undefined");
}

export function hasRelative() {
    try {
        return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
    } catch (e) {
        return false;
    }
}

// OBJECTS AND ARRAYS

export function maybeArray<T>(thing: T | T[]) {
    return Array.isArray(thing) ? thing : [thing];
}

export function bestBy<T, U>(arr: T[], by: (_: T) => U, compare: (_: U, __: U) => U) {
    const best = arr.reduce<[U, T] | undefined>((best, next) => {
        const pair: [U, T] = [by(next), next];
        if (best === undefined) {
            return pair;
        } else if (compare(best[0], pair[0]) === best[0]) {
            return best;
        } else {
            return pair;
        }
    }, undefined);

    if (best === undefined) throw new InvalidArgumentError("bestBy expects a non empty array");

    return best[1];
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]) {
    return keys.reduce<Partial<Pick<T, K>>>((a, k) => {
        a[k] = obj[k];
        return a;
    }, {}) as Pick<T, K>;
}

// NUMBERS AND STRINGS

export function integerBetween(thing: number, bottom: number, top: number) {
    return thing >= bottom && thing <= top;
}

// x % n but takes the sign of n instead of x
export function floorMod(x: number, n: number) {
    return x - n * Math.floor(x / n);
}

export function padStart(input: string | number, n = 2) {
    if (input.toString().length < n) {
        return ("0".repeat(n) + input).slice(-n);
    } else {
        return input.toString();
    }
}

export function parseInteger(text: string) {
    if (isUndefined(text) || text === null || text === "") {
        return undefined;
    } else {
        return parseInt(text, 10);
    }
}

export function parseMillis(fraction: string | null | undefined) {
    // Return undefined (instead of 0) in these cases, where fraction is not set
    if (isUndefined(fraction) || fraction === null || fraction === "") {
        return undefined;
    } else {
        const f = parseFloat("0." + fraction) * 1000;
        return Math.floor(f);
    }
}

export function roundTo(value: number, digits: number, towardZero = false) {
    const factor = 10 ** digits,
        rounder = towardZero ? Math.trunc : Math.round;
    return rounder(value * factor) / factor;
}

// DATE BASICS

export function untruncateYear(year: number) {
    if (year > 99) {
        return year;
    } else return year > 60 ? 1900 + year : 2000 + year;
}

// PARSING

export function parseZoneInfo(
    ts: number,
    offsetFormat?: string,
    locale?: string,
    timeZone?: string
) {
    const date = new Date(ts),
        intlOptions = {
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone
        };

    const modified: Intl.DateTimeFormatOptions = Object.assign(
        { timeZoneName: offsetFormat },
        intlOptions
        ),
        intl = hasIntl();

    if (intl && hasFormatToParts()) {
        const parsed = new Intl.DateTimeFormat(locale, modified)
            .formatToParts(date)
            .find(m => m.type.toLowerCase() === "timezonename");
        return parsed ? parsed.value : null;
    } else if (intl) {
        // this probably doesn't work for all locales
        const without = new Intl.DateTimeFormat(locale, intlOptions).format(date),
            included = new Intl.DateTimeFormat(locale, modified).format(date),
            diffed = included.substring(without.length),
            trimmed = diffed.replace(/^[, \u200e]+/, "");
        return trimmed;
    } else {
        return null;
    }
}

// signedOffset('-5', '30') -> -330
export function signedOffset(offHourStr: string, offMinuteStr: string) {
    let offHour = parseInt(offHourStr, 10);

    // don't || this because we want to preserve -0
    if (Number.isNaN(offHour)) {
        offHour = 0;
    }

    const offMin = parseInt(offMinuteStr, 10) || 0,
        offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
    return offHour * 60 + offMinSigned;
}

// COERCION

export function asNumber(value: unknown) {
    const numericValue = Number(value);
    if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue))
        throw new InvalidArgumentError(`Invalid unit value ${value}`);
    return numericValue;
}

export function normalizeObject<T extends string>(
    obj: Record<string, unknown>,
    normalizer: (key: string) => T
) {
    return Object.keys(obj).reduce<Partial<Record<T, number>>>((normalized, key) => {
        const value = obj[key];
        if (value !== undefined && value !== null) normalized[normalizer(key)] = asNumber(value);
        return normalized;
    }, {});
}

export function formatOffset(offset: number, format: ZoneOffsetFormat) {
    const hours = Math.trunc(Math.abs(offset / 60)),
        minutes = Math.trunc(Math.abs(offset % 60)),
        sign = offset >= 0 ? "+" : "-";

    switch (format) {
        case "short":
            return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
        case "narrow":
            return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
        case "techie":
            return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
        default:
            throw new RangeError(`Value format ${format} is out of range for property format`);
    }
}

export const ianaRegex = /[A-Za-z_+-]{1,256}(:?\/[A-Za-z_+-]{1,256}(\/[A-Za-z_+-]{1,256})?)?/;
