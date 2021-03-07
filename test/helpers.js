/* global test */
/* eslint no-global-assign: "off" */

import {getDefaultNowFn, getDefaultZone, setDefaultNowFn, setDefaultZone} from "../src/model/settings";
import IANAZone from "../src/model/zones/IANAZone";

const resetCaches = () => {
  IANAZone.resetCache();
}

export const withoutIntl = (name, f) => {
  const fullName = `With no Intl support, ${name}`;
  test(fullName, () => {
    const intl = Intl;
    try {
      Intl = undefined;
      resetCaches();
      f();
    } finally {
      Intl = intl;
    }
  });
};

export const withoutFTP = (name, f) => {
  const fullName = `With no FormatToParts support, ${name}`;
  test(fullName, () => {
    const { formatToParts } = Intl.DateTimeFormat.prototype;
    try {
      Intl.DateTimeFormat.prototype.formatToParts = undefined;
      resetCaches()
      f();
    } finally {
      Intl.DateTimeFormat.prototype.formatToParts = formatToParts;
    }
  });
};

export const withoutRTF = (name, f) => {
  const fullName = `With no RelativeTimeFormat support, ${name}`;
  test(fullName, () => {
    const rtf = Intl.RelativeTimeFormat;
    try {
      Intl.RelativeTimeFormat = undefined;
      resetCaches()
      f();
    } finally {
      Intl.RelativeTimeFormat = rtf;
    }
  });
};

export const withoutZones = (name, f) => {
  const fullName = `With no time zone support, ${name}`;
  test(fullName, () => {
    const { DateTimeFormat } = Intl;
    try {
      Intl.DateTimeFormat = (locale, opts = {}) => {
        if (opts.timeZone) {
          // eslint-disable-next-line no-throw-literal
          throw `Unsupported time zone specified ${opts.timeZone}`;
        }
        return DateTimeFormat(locale, opts);
      };
      Intl.DateTimeFormat.prototype = DateTimeFormat.prototype;

      resetCaches();
      f();
    } finally {
      Intl.DateTimeFormat = DateTimeFormat;
    }
  });
};

export const withNow = (name, dt, f) => {
  test(name, () => {
    const oldNow = getDefaultNowFn();

    try {
      setDefaultNowFn(() => dt.valueOf());
      f();
    } finally {
      setDefaultNowFn(oldNow);
    }
  });
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
