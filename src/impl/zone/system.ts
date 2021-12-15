import { Zone } from "../../types";

/**
 * Represents the system's local zone for this Javascript environment.
 */
class SystemZone implements Zone {

  get type() {
    return "system";
  }

  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  get isUniversal() {
    return false;
  }

  offset = (ts: number) => -new Date(ts).getTimezoneOffset();

  equals = (other: Zone) => other !== undefined && other.type === "system";

  get isLuxonZone() { return true; };
}
/**
 * Get a singleton instance of the system's local zone
 */
export const systemZone: Zone = new SystemZone();
