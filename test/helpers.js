import {
  getDefaultFormat,
  getDefaultLocale,
  getNowFn,
  getDefaultZone,
  setDefaultFormat,
  setDefaultLocale,
  setNowFn,
  setDefaultZone,
  clearCaches,
} from "../src/settings";

const resetCaches = () => {
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
  const oldFmt = getDefaultFormat();
  try {
    setDefaultFormat(fmt);
    f();
  } finally {
    setDefaultFormat(oldFmt);
  }
};
