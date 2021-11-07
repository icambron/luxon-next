// todo - make this public?
import Zone, { Zoneish } from "../types/zone";
import { isNumber, isString, isUndefined } from "../utils/typeCheck";
import { getDefaultZone } from "../settings";
import { isValidIANASpecifier, isZone } from "../utils/zone";
import { systemZone } from "../model/zones/SystemZone";
import { fixedOffsetZone, parseFixedOffset, utcInstance } from "../model/zones/FixedOffsetZone";
import { createIANAZone} from "../model/zones/IANAZone";
import { InvalidZoneError } from "../errors";

export const normalizeZone = (zoneish: Zoneish): Zone => {
  if (isUndefined(zoneish) || zoneish === null) return getDefaultZone();
  if (isZone(zoneish)) return zoneish;
  if (isString(zoneish)) {
    const lowered = zoneish.toLowerCase();
    if (lowered === "default") return getDefaultZone();
    if (lowered === "system") return systemZone;
    if (lowered === "utc") return utcInstance;

    if (isValidIANASpecifier(lowered)) return createIANAZone(zoneish);

    const parsed = parseFixedOffset(lowered);

    if (!parsed) {
      throw new InvalidZoneError(zoneish);
    }

    return parsed;
  }
  if (isNumber(zoneish)) return fixedOffsetZone(zoneish);
  throw new InvalidZoneError(zoneish);
};