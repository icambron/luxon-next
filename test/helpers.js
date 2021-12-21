import {
  getDefaultDateTimeFormat,
  getDefaultLocale,
  getNowFn,
  getDefaultZone,
  setDefaultDateTimeFormat,
  setDefaultLocale,
  setNowFn,
  setDefaultZone,
  clearCaches,
} from "../src/luxon";

export const resetCaches = () => {
  clearCaches();
};

export const withNow = (nowfn, f) => {
  const oldNow = getNowFn();

  try {
    setNowFn(nowfn);
    f();
  } finally {
    setNowFn(oldNow);
  }
};

export const withDefaultZone = (zone, f) => {
  const oldZone = getDefaultZone();
  try {
    setDefaultZone(zone);
    f();
  } finally {
    setDefaultZone(oldZone);
  }
};

export const withDefaultLocale = (local, f) => {
  const oldLocale = getDefaultLocale();
  try {
    setDefaultLocale(local);
    f();
  } finally {
    setDefaultLocale(oldLocale);
  }
};

export const withDefaultFormat = (fmt, f) => {
  const oldFmt = getDefaultDateTimeFormat();
  try {
    setDefaultDateTimeFormat(fmt);
    f();
  } finally {
    setDefaultDateTimeFormat(oldFmt);
  }
};
