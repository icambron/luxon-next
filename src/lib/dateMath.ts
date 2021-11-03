// basic math computation functions that need to be shared
// rule: no dependencies
// rule: if it can go elsewhere, put it there

export const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

export const daysInYear = (year: number) => (isLeapYear(year) ? 366 : 365);

export const computeOrdinal = (year: number, month: number, day: number) =>
  day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];

export const uncomputeOrdinal = (year: number, ordinal: number) => {
  const table = isLeapYear(year) ? leapLadder : nonLeapLadder;
  const month0 = table.findIndex((i) => i > ordinal) - 1;
  const day = ordinal - table[month0];
  return { month: month0 + 1, day };
};

export const nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
export const leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];