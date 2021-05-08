/* global test */
/* eslint no-global-assign: "off" */

import {getDefaultNowFn, getDefaultZone, setDefaultNowFn, setDefaultZone} from "../src/model/settings";
import IANAZone from "../src/model/zones/IANAZone";

const resetCaches = () => {
  IANAZone.resetCache();
}

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
