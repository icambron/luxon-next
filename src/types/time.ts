export type TimeUnit = "hour" | "minute" | "second" | "millisecond";
export type Time = {
  [key in TimeUnit]: number;
};
export type TimeUnitPlural = "hours" | "minutes" | "seconds" | "milliseconds";
