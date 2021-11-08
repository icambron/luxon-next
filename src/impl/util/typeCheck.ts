/**
 * @private
 */
import { DateTime, Duration, Zone } from "../../types";

export const isObject = (o: unknown): o is object => typeof o === "object";

export const isUndefined = (o: unknown): o is undefined => typeof o === "undefined";

export const isNumber = (o: unknown): o is number => typeof o === "number";

export const isInteger = (o: unknown) => typeof o === "number" && o % 1 === 0;

export const isString = (o: unknown): o is string => typeof o === "string";

export const isDate = (o: unknown): o is Date => Object.prototype.toString.call(o) === "[object Date]";

export const isZone = (obj: any): obj is Zone => obj?.isLuxonZone;

export const isDateTime = (obj: any): obj is DateTime => obj?.isLuxonDateTime;

export const isDuration = (obj: any): obj is Duration => obj?.isLuxonDuration;