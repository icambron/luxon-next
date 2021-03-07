/**
 * An abstract Zone class
 * @interface
 */
export default interface Zone {
  /**
   * The type of zone
   * @type {string}
   */
  type: string;

  /**
   * The name of this zone.
   * @type {string}
   */
  name: string;

  /**
   * Returns whether the offset is known to be fixed for the whole year.
   * @type {boolean}
   */
  isUniversal: boolean;

  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts: number): number;

  /**
   * Return whether this Zone is equal to another zone
   * @param {Zone} other - the zone to compare
   * @return {boolean}
   */
  equals(other: Zone) : boolean;
}

export type Zoneish = Zone | number | string | null | undefined;

export const isZone = (maybeZone: any): maybeZone is Zone => maybeZone.name !== undefined;

