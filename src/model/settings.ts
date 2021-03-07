import Zone from "./zone";
import {systemZone} from "./zones/systemZone";

let defaultZone: Zone = systemZone();
let nowFn : () => number = () => Date.now();

export const getDefaultZone = (): Zone => defaultZone;
export const setDefaultZone = (zone: Zone) => defaultZone = zone;

export const getDefaultNowFn = (): () => number => nowFn;
export const setDefaultNowFn = (fn: () => number) =>  nowFn = fn;
