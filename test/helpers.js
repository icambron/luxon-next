/* global test */
/* eslint no-global-assign: "off" */

import {
  getDefaultLocale,
  getDefaultNowFn,
  getDefaultZone,
  setDefaultLocale,
  setDefaultNowFn,
  setDefaultZone
} from "../src/settings";
import { resetCache as resetIANACache } from "../src/model/zones/IANAZone";

const resetCaches = () => {
  resetIANACache();
};

export const withNow = (nowfn, f) => {
  const oldNow = getDefaultNowFn();

  try {
    setDefaultNowFn(nowfn);
    f();
  } finally {
    setDefaultNowFn(oldNow);
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
