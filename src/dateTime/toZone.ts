import FixedOffsetZone from "../model/zones/fixedOffsetZone";
import SystemZone from "../model/zones/systemZone";
import DateTime, {alter} from "../model/dateTime";
import Zone from "../model/zone";
import {isNumber, isString, isUndefined} from "../impl/util";
import IANAZone from "../model/zones/IANAZone";
import {InvalidZoneError} from "../model/errors";
import {getDefaultZone} from "../model/settings";
import {gregorianToTS} from "../model/calendars/gregorian";

export type Zoneish = Zone | number | string | null | undefined;

const isZone = (maybeZone: any): maybeZone is Zone => maybeZone.name !== undefined;

export const toZone = (zoneish: Zoneish) => {
    if (isUndefined(zoneish) || zoneish === null) return getDefaultZone();
    if (isZone(zoneish)) return zoneish;
    if (isString(zoneish)) {
        const lowered = zoneish.toLowerCase();
        if (lowered === "default") return getDefaultZone();
        if (lowered === "system") return SystemZone.instance;
        if (lowered === "utc") return FixedOffsetZone.utcInstance;
        if (IANAZone.isValidSpecifier(lowered)) return IANAZone.create(zoneish);

        const parsed = FixedOffsetZone.parseSpecifier(lowered);

        if (!parsed) {
            throw new InvalidZoneError(zoneish);
        }

        return parsed;
    }
    if (isNumber(zoneish)) return FixedOffsetZone.instance(zoneish);
    throw new InvalidZoneError(zoneish);
}

/**
 * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
 *
 * By default, the setter keeps the underlying instant the same (as in, the same timestamp), but the new instance will report different local time and consider DSTs when making computations, as with {@link DateTime#plus}. You may wish to use {@link DateTime#toSystemZone} and {@link DateTime#toUTC} which provide simple convenience wrappers for commonly used zones.
 * @param {DateTime} dt
 * @param {string|Zone} [tz='default'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'default', 'system' or 'utc'. You may also supply an instance of a {@link Zone} class.
 * @param {Object} opts - options
 * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
 * @return {DateTime}
 */
export const setZone = (dt: DateTime, tz: Zoneish, { keepLocalTime = false } = {}) => {
    tz = toZone(tz);
    if (tz.equals(dt.zone)) {
        return dt;
    } else {
        let newTS = dt.ts;
        if (keepLocalTime) {
            const offsetGuess = tz.offset(dt.ts);
            [newTS] = gregorianToTS(dt.gregorian, dt.time, offsetGuess, tz);
        }
        return alter(dt, newTS, tz);
    }
}

/**
 * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
 *
 * Equivalent to {@link setZone}(dt, 'utc')
 * @param {DateTime} dt
 * @param {number} [offset=0] - optionally, an offset from UTC in minutes
 * @param {Object} [opts={}] - options to pass to `setZone()`
 * @return {DateTime}
 */
export const toUTC = (dt: DateTime, offset = 0, opts = {}) =>
    setZone(dt, FixedOffsetZone.instance(offset), opts);

/**
 * "Set" the DateTime's zone to the system's time zone. Returns a newly-constructed DateTime.
 * The system time zone is the one set on the machine where this code gets executed.
 *
 * Equivalent to `{@link setZone}(dt, "system")`
 * @return {DateTime}
 */
export const toSystemZone = (dt: DateTime) =>
    setZone(dt, SystemZone.instance);

/**
 * "Set" the DateTime's zone to the default zone. Returns a newly-constructed DateTime.
 * The default time zone is used when creating new DateTimes, unless otherwise specified.
 * It defaults to the system's time zone, but can be overriden in `Settings`.
 *
 * Equivalent to `{@link setZone}(dt, "default")`
 * @param {DateTime} dt
 * @return {DateTime}
 */
export const toDefaultZone = (dt: DateTime) => setZone(dt, getDefaultZone());
