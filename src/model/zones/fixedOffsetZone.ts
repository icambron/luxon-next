import { formatOffset, signedOffset } from "../../lib/util";
import Zone from "../zone";

/**
 * A zone with a fixed offset (meaning no DST)
 * @implements {Zone}
 */
export default class FixedOffsetZone implements Zone {
  private readonly _fixed: number;

  constructor(offset: number) {
    /** @private **/
    this._fixed = offset;
  }

  get type() {
    return "fixed";
  }

  get name() {
    return this._fixed === 0 ? "UTC" : `UTC${formatOffset(this._fixed, "narrow")}`;
  }

  get isUniversal() {
    return true;
  }

  offset = (_ts?: number) => this._fixed;

  equals = (other: Zone): boolean =>
      other.type === "fixed" && (other as FixedOffsetZone)._fixed === this._fixed;
}

/**
 * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
 * @param {string} s - The offset string to parsing
 * @example parseSpecifier("UTC+6")
 * @example parseSpecifier("UTC+06")
 * @example parseSpecifier("UTC-6:00")
 * @return {FixedOffsetZone | null}
 */
export const parseFixedOffset = (s: string): FixedOffsetZone | null => {
  if (s) {
    const regexp = /^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i;
    const r = regexp.exec(s);
    if (r !== null) {
      return new FixedOffsetZone(signedOffset(r[1], r[2]));
    }
  }
  return null;
};

/**
 * Get an instance with a specified offset
 * @param {number} offset - The offset in minutes
 * @return {FixedOffsetZone}
 */
export const fixedOffsetZone = (offset: number): FixedOffsetZone =>
    offset === 0 ? utcInstance : new FixedOffsetZone(offset)

/**
 * Get a singleton instance of UTC
 * @return {FixedOffsetZone}
 */
export const utcInstance = new FixedOffsetZone(0);

