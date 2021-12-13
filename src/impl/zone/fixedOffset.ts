import { Zone } from "../../types";
import { formatNumericOffset, signedOffset } from "../util/zoneUtils";

class FixedOffsetZone implements Zone {
  private readonly _fixed: number;

  constructor(offset: number) {
    /** @private **/
    this._fixed = offset;
  }

  get type() {
    return "fixed";
  }

  get name() {
    return this._fixed === 0 ? "UTC" : `UTC${formatNumericOffset(this._fixed, "narrow")}`;
  }

  get isUniversal() {
    return true;
  }

  offset = (_ts?: number) => this._fixed;

  equals = (other: Zone): boolean =>
    other && other.type === "fixed" && (other as FixedOffsetZone)._fixed === this._fixed;

  isLuxonZone = true;
}
/**
 * Get a singleton instance of UTC
 */
export const utcInstance: Zone = new FixedOffsetZone(0);

/**
 * Get an instance with a specified offset
 * @param {number} offset - The offset in minutes
 * @return {Zone}
 */
export const fixedOffsetZone = (offset: number): Zone =>
  offset === 0 ? utcInstance : new FixedOffsetZone(offset);

/**
 * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
 * @param {string} s - The offset string to util
 * @example parseSpecifier("UTC+6")
 * @example parseSpecifier("UTC+06")
 * @example parseSpecifier("UTC-6:00")
 * @return {Zone | null}
 */
export const parseFixedOffset = (s: string): Zone | null => {
  if (s) {
    const regexp = /^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i;
    const r = regexp.exec(s);
    if (r !== null) {
      return fixedOffsetZone(signedOffset(r[1], r[2]));
    }
  }
  return null;
};
