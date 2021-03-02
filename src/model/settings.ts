import Zone from "./zone";
import SystemZone from "./zones/systemZone";

let defaultZone: Zone = SystemZone.instance;
let nowFn : () => number = () => Date.now();

export const getDefaultZone = (): Zone => defaultZone;
export const setDefaultZone = (zone: Zone) => defaultZone = zone;

export const getDefaultNowFn = (): () => number => nowFn;
export const setDefaultNowFn = (fn: () => number) =>  nowFn = fn;
