import { getDefaultZone } from "../settings";
import { gregorianToTS } from "../impl/calendars/gregorian";
import { alter } from "../impl/dateTime";
import { fixedOffsetZone } from "../impl/zone/fixedOffset";
import { systemZone } from "../impl/zone/system";
import { DateTime, Zoneish } from "../types";
import { normalizeZone } from "../impl/zone/normalizeZone";

/**
 * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
 *
 * @param [zone='default'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'default', 'system' or 'utc'. You may also supply an instance of a {@link Zone} class.
 * @param opts - options
 * @param [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
 */
export const setZone = (dt: DateTime, zone: Zoneish, { keepLocalTime = false } = {}): DateTime => {
  const realZone = normalizeZone(zone);
  if (realZone.equals(dt.zone)) {
    return dt;
  } else {
    let newTS = dt.ts;
    if (keepLocalTime) {
      const offsetGuess = realZone.offset(dt.ts);
      [newTS] = gregorianToTS(dt.gregorian, dt.time, offsetGuess, realZone);
    }
    return alter(newTS, realZone)(dt);
  }
};

/**
 * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
 *
 * Equivalent to {@link setZone}(dt, 'utc')
*  @param dt
 * @param [offset=0] - optionally, an offset from UTC in minutes
 * @param [opts={}] - options to pass to `setZone()`
 */
export const toUTC = (dt: DateTime, offset: number = 0, opts: object = {}): DateTime => setZone(dt, fixedOffsetZone(offset), opts);

/**
 * "Set" the DateTime's zone to the system's time zone. Returns a newly-constructed DateTime.
 * The system time zone is the one set on the machine where this code gets executed.
 *
 * Equivalent to `{@link setZone}("system")`
 */
export const toSystemZone = (dt: DateTime): DateTime => setZone(dt, systemZone);

/**
 * "Set" the DateTime's zone to the default zone. Returns a newly-constructed DateTime.
 * The default time zone is used when creating new DateTimes, unless otherwise specified.
 * It defaults to the system's time zone, but can be overriden in `Settings`.
 *
 * Equivalent to `{@link setZone}(dt, "default")`
 */
export const toDefaultZone = (dt: DateTime): DateTime => setZone(dt, getDefaultZone());
