import Zone, { isZone } from "./zone";
import { systemZone } from "./zones/systemZone";
import { InvalidArgumentError } from "./errors";

let defaultZone: Zone = systemZone;
let nowFn: () => number = () => Date.now();

export const getDefaultZone = (): Zone => defaultZone;
export const setDefaultZone = (zone?: Zone) => {
  if (zone !== undefined && zone != null && !isZone(zone)) {
    throw new InvalidArgumentError("must set the default zone to an instance of Zone");
  }
  defaultZone = zone || systemZone;
};

export const getDefaultNowFn = (): (() => number) => nowFn;
export const setDefaultNowFn = (fn: () => number) => (nowFn = fn);
