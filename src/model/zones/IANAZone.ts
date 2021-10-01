import { isUndefined, ianaRegex } from "../../impl/util";
import Zone from "../zone";
import { InvalidZoneError } from "../errors";
import {gregorianToLocalTS} from "../calendars/gregorian";

const matchingRegex = RegExp(`^${ianaRegex.source}$`);

let dtfCache: Record<string, Intl.DateTimeFormat> = {};

function makeDTF(zone: string): Intl.DateTimeFormat {
  if (!dtfCache[zone]) {
    try {
      dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
        hourCycle: "h23",
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      throw new InvalidZoneError(zone);
    }
  }
  return dtfCache[zone];
}

const typeToPos: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};

function partsOffset(dtf: Intl.DateTimeFormat, date: Date) {
  const formatted = dtf.formatToParts(date);
  const filled = new Array<number>();
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i];
    const pos = typeToPos[type];

    if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}

let ianaZoneCache: Record<string, IANAZone> = {};
/**
 * A zone identified by an IANA identifier, like America/New_York
 * @implements {Zone}
 */
export default class IANAZone implements Zone {
  private readonly _zoneName: string;

  constructor(name: string) {
    if (!isValidZone(name)) {
      throw new InvalidZoneError(name);
    }
    this._zoneName = name;
  }

  get type() {
    return "iana";
  }

  get name() {
    return this._zoneName;
  }

  get isUniversal() {
    return false;
  }

  offset(ts: number) {
    const date = new Date(ts),
      dtf = makeDTF(this.name),
      [year, month, day, hour, minute, second] = partsOffset(dtf, date);

    const asUTC = gregorianToLocalTS(
        { year, month, day},
        { hour, minute, second, millisecond: 0}
    );

    let asTS = date.valueOf();
    const over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  }

  equals(other: Zone) {
    return other.type === "iana" && other.name === this.name;
  }
}

/**
 * @param {string} name - Zone name
 * @return {IANAZone}
 */
export const createIANAZone = (name: string): IANAZone => {
  if (!ianaZoneCache[name]) {
    ianaZoneCache[name] = new IANAZone(name);
  }
  return ianaZoneCache[name];
}

/**
 * Reset local caches. Should only be necessary in testing scenarios.
 * @return {void}
 */
export const resetCache = () => {
  ianaZoneCache = {};
  dtfCache = {};
}

/**
 * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
 * @param {string} s - The string to check validity on
 * @example IANAZone.isValidSpecifier("America/New_York") //=> true
 * @example IANAZone.isValidSpecifier("Fantasia/Castle") //=> true
 * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
 * @return {boolean}
 */
export const isValidIANASpecifier = (s: string): boolean => {
  return !!(s && matchingRegex.exec(s) !== null);
}

/**
 * Returns whether the provided string identifies a real zone
 * @param {string} zone - The string to check
 * @example IANAZone.isValidZone("America/New_York") //=> true
 * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
 * @example IANAZone.isValidZone("Sport~~blorp") //=> false
 * @return {boolean}
 */
export const isValidZone = (zone: string): boolean => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
    return true;
  } catch (e) {
    return false;
  }
}

// Etc/GMT+8 -> -480
/** @ignore */
export const parseGMTOffset = (specifier: string): number | null => {
  if (specifier) {
    const regexp = /^Etc\/GMT([+-]\d{1,2})$/i;
    const match = regexp.exec(specifier);
    if (match !== null) {
      return -60 * parseInt(match[1]);
    }
  }
  return null;
}
