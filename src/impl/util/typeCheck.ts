/**
 * @private
 */
import { DateTime, Duration, Zone } from "../../types";

export const isDate = (o: unknown): o is Date => Object.prototype.toString.call(o) === "[object Date]";

export const isZone = (obj: any): obj is Zone => obj?.isLuxonZone;

export const isDateTime = (obj: any): obj is DateTime => obj?.isLuxonDateTime;

export const isDuration = (obj: any): obj is Duration => obj?.isLuxonDuration;
