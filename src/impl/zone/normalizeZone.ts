import { Zone, Zoneish } from "../../types";
import { isZone } from "../util/typeCheck";
import { getDefaultZone } from "../../settings";
import { systemZone } from "./system";
import { fixedOffsetZone, parseFixedOffset, utcInstance } from "./fixedOffset";
import { ianaZone } from "./iana";
import { InvalidZoneError } from "../../errors";
import { isValidIANASpecifier } from "../util/zoneUtils";


export const normalizeZone = (zoneish: Zoneish): Zone => {
  if (typeof zoneish == "undefined" || zoneish === null) return getDefaultZone();
  if (isZone(zoneish)) return zoneish;
  if (typeof zoneish == "string") {
    const lowered = zoneish.toLowerCase();
    if (lowered === "default") return getDefaultZone();
    if (lowered === "system") return systemZone;
    if (lowered === "utc") return utcInstance;

    if (isValidIANASpecifier(lowered)) return ianaZone(zoneish);

    const parsed = parseFixedOffset(lowered);

    if (!parsed) {
      throw new InvalidZoneError(zoneish);
    }

    return parsed;
  }
  if (typeof zoneish === "number") return fixedOffsetZone(zoneish);
  throw new InvalidZoneError(zoneish);
};
