/**
 * @private
 */

export function isObject(o: unknown): o is object {
  return typeof o === "object";
}

export function isUndefined(o: unknown): o is undefined {
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
