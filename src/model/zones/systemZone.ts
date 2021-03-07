import { hasIntl } from "../../impl/util";
import Zone from "../zone";

let singleton: SystemZone | null = null;

/**
 * Represents the system's local zone for this Javascript environment.
 * @implements {Zone}
 */
export default class SystemZone implements Zone {

  get type() {
    return "system";
  }

  get name() {
    if (hasIntl()) {
      return new Intl.DateTimeFormat().resolvedOptions().timeZone;
    } else return "system";
  }

  get isUniversal() {
    return false;
  }

  offset(ts: number) {
    return -new Date(ts).getTimezoneOffset();
  }

  equals(other: Zone) {
    return other.type === "system";
  }
}

/**
 * Get a singleton instance of the system's local zone
 * @return {SystemZone}
 */
export const systemZone = (): SystemZone => {
  if (singleton === null) {
    singleton = new SystemZone();
  }
  return singleton;
}
