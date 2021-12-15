// basic math computation functions that need to be shared
import { floorMod } from "./numeric";

export const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

export const daysInYear = (year: number) => (isLeapYear(year) ? 366 : 365);

export const daysInMonth = (year: number, month: number) => {
  const modMonth = floorMod(month - 1, 12) + 1;
  const modYear = year + (month - modMonth) / 12;
  return [31, isLeapYear(modYear) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
};

export const computeOrdinal = (year: number, month: number, day: number) =>
  day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];

export const uncomputeOrdinal = (year: number, ordinal: number) => {
  const table = isLeapYear(year) ? leapLadder : nonLeapLadder;
  let month = table.findIndex((i) => i >= ordinal);
  if (month < 0) month = 12;
  const day = ordinal - table[month - 1];
  return { month, day };
};

export const nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
export const leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

export const untruncateYear = (year: number) => (year > 99 ? year : year > 60 ? 1900 + year : 2000 + year);

export function weeksInWeekYear(weekYear: number): number {
  const p1 =
      (weekYear +
        Math.floor(weekYear / 4) -
        Math.floor(weekYear / 100) +
        Math.floor(weekYear / 400)) %
      7,
    last = weekYear - 1,
    p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
  return p1 === 4 || p2 === 3 ? 53 : 52;
}

export const dayOfWeek = (year: number, month: number, day: number) => {
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return js === 0 ? 7 : js;
};
