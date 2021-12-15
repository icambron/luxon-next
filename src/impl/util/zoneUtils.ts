import { InvalidArgumentError } from "../../errors";
import { padStart } from "../util/string";
import { OffsetFormatWidth } from "../../types";

/**
 * Returns whether the provided string identifies a real zone
 * @param {string} zone - The string to check
 * @example isValidZone("America/New_York") //=> true
 * @example isValidZone("Fantasia/Castle") //=> false
 * @example isValidZone("Sport~~blorp") //=> false
 * @return {boolean}
 */
export const isValidIANAZone = (zone: string): boolean => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
    return true;
  } catch (e) {
    return false;
  }
}; // signedOffset('-5', '30') -> -330

const ianaRegex = /^[A-Za-z_+-]{1,256}(:?\/[A-Za-z0-9_+-]{1,256}(\/[A-Za-z0-9_+-]{1,256})?)?$/;

/**
 * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
 * @param {string} s - The string to check validity on
 * @example isValidSpecifier("America/New_York") //=> true
 * @example isValidSpecifier("Fantasia/Castle") //=> true
 * @example isValidSpecifier("Sport~~blorp") //=> false
 * @return {boolean}
 */
export const isValidIANASpecifier = (s: string): boolean => {
  return !!(s && ianaRegex.exec(s) !== null);
};

export const signedOffset = (offHourStr: string, offMinuteStr: string): number => {
  let offHour = parseInt(offHourStr, 10);

  // don't || this because we want to preserve -0
  if (Number.isNaN(offHour)) {
    offHour = 0;
  }

  const offMin = parseInt(offMinuteStr, 10) || 0,
    offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
}

export const formatNumericOffset = (offset: number, format: OffsetFormatWidth): string => {
  const hours = Math.trunc(Math.abs(offset / 60));
  const minutes = Math.trunc(Math.abs(offset % 60));
  const sign = offset >= 0 ? "+" : "-";

  switch (format) {
    case "standard":
      return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
    case "narrow":
      return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
    case "techie":
      return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
    default:
      throw new InvalidArgumentError(`Format ${format} isn't supported`);
  }
}
