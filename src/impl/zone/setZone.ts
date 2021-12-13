import { DateTime, Zoneish } from "../../types";
import { gregorianToTS } from "../calendars/gregorian";
import { alter } from "../dateTime";

// combine these?
import { normalizeZone } from "./normalizeZone";

export const setZone = (dt: DateTime, zone: Zoneish, { keepLocalTime = false } = {}): DateTime => {
  const realZone = normalizeZone(zone);
  if (realZone.equals(dt.zone)) {
    return dt;
  } else {
    let newTS = dt.ts;
    if (keepLocalTime) {
      const offsetGuess = realZone.offset(dt.ts);
      [newTS] = gregorianToTS(dt.gregorian, dt.time, offsetGuess, realZone);
    }
    return alter(newTS, realZone)(dt);
  }
};
