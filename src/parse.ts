import Zone, { Zoneish } from "./model/zone";
import { MixedDateTimeUnitBundle } from "./model/units";

export const fromISO = (iso: string, zone?: Zoneish): string | null => {


}

function parseDataToDateTime(parsed: MixedDateTimeUnitBundle, parsedZone: Zone | null, zone: Zoneish, format, text) {
  const { setZone, zone } = opts;
  if (parsed && Object.keys(parsed).length !== 0) {
    const interpretationZone = parsedZone || zone,
      inst = DateTime.fromObject(parsed, {
        ...opts,
        zone: interpretationZone,
      });
    return setZone ? inst : inst.setZone(zone);
  } else {
    return null;
  }
}
