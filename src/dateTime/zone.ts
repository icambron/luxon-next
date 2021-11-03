import { fixedOffsetZone } from "../model/zones/fixedOffsetZone";
import { systemZone } from "../model/zones/systemZone";
import { DateTime, alter, normalizeZone } from "../model/dateTime";
import { getDefaultZone } from "../settings";
import { gregorianToTS } from "../model/calendars/gregorian";
import { Zoneish } from "../model/zone";

/**
 * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
 *
 * @param {string|Zone} [zone='default'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'default', 'system' or 'utc'. You may also supply an instance of a {@link Zone} class.
 * @param {Object} opts - options
 * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
 * @return {DateTime}
 */
export const setZone = (zone: Zoneish, { keepLocalTime = false } = {}): ((dt: DateTime) => DateTime) => {
  const realZone = normalizeZone(zone);
  return (dt) => {
    if (realZone.equals(dt.zone)) {
      return dt;
    } else {
      let newTS = dt.ts;
      if (keepLocalTime) {
        const offsetGuess = realZone.offset(dt.ts);
        [newTS, ] = gregorianToTS(dt.gregorian, dt.time, offsetGuess, realZone);
      }
      return alter(dt, newTS, realZone);
    }
  };
};

/**
 * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
 *
 * Equivalent to {@link setZone}(dt, 'utc')
 * @param {number} [offset=0] - optionally, an offset from UTC in minutes
 * @param {Object} [opts={}] - options to pass to `setZone()`
 * @return {DateTime}
 */
export const toUTC = (offset = 0, opts = {}): ((dt: DateTime) => DateTime) => setZone(fixedOffsetZone(offset), opts);

/**
 * "Set" the DateTime's zone to the system's time zone. Returns a newly-constructed DateTime.
 * The system time zone is the one set on the machine where this code gets executed.
 *
 * Equivalent to `{@link setZone}("system")`
 * @return {DateTime}
 */
export const toSystemZone = (): ((dt: DateTime) => DateTime) => setZone(systemZone);

/**
 * "Set" the DateTime's zone to the default zone. Returns a newly-constructed DateTime.
 * The default time zone is used when creating new DateTimes, unless otherwise specified.
 * It defaults to the system's time zone, but can be overriden in `Settings`.
 *
 * Equivalent to `{@link setZone}(dt, "default")`
 * @return {DateTime}
 */
export const toDefaultZone = (): ((dt: DateTime) => DateTime) => setZone(getDefaultZone());
