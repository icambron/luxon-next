import { isUndefined } from "../util/typeCheck";
import { InvalidZoneError } from "../../errors";
import { gregorianToLocalTS } from "../calendars/gregorian";
import { memo } from "../util/caching";
import { Zone } from "../../types";
import { isValidIANAZone } from "./zone";

const makeDTF = memo("ianaDtf", (zone: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hourCycle: "h23",
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    throw new InvalidZoneError(zone);
  }
});

const typeToPos: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};

const partsOffset = (dtf: Intl.DateTimeFormat, date: Date) => {
  const formatted = dtf.formatToParts(date);
  const filled = new Array<number>();
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i];
    const pos = typeToPos[type];

    if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
};

/**
 * A zone identified by an IANA identifier, like America/New_York
 */
class IANAZone implements Zone {
  private readonly _zoneName: string;

  constructor(name: string) {
    if (!isValidIANAZone(name)) {
      throw new InvalidZoneError(name);
    }
    this._zoneName = name;
  }

  get type() {
    return "iana";
  }

  get name() {
    return this._zoneName;
  }

  get isUniversal() {
    return false;
  }

  offset = (ts: number) => {
    const date = new Date(ts),
      dtf = makeDTF(this.name),
      [year, month, day, hour, minute, second] = partsOffset(dtf, date);

    const asUTC = gregorianToLocalTS(
      { year, month, day },
      { hour, minute, second, millisecond: 0 }
    );

    let asTS = date.valueOf();
    const over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  };

  equals = (other: Zone) => other.type === "iana" && other.name === this.name;

  isLuxonZone = true;
}

/**
 * @param name - Zone name
 */
export const ianaZone: (zoneName: string) => Zone = memo("ianaZone", (name: string) => new IANAZone(name));
