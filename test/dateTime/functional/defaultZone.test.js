import { withDefaultZone } from "../../helpers";
import { fromGregorian, now, zone, zoneName } from "../../../src/dateTime/core";
import { getDefaultZone, setDefaultZone } from "../../../src/settings";
import { systemZone } from "../../../src/impl/zone/system";
import { ianaZone } from "../../../src/impl/zone/iana";

test("Setting the default zone results in a different creation zone", () => {
  withDefaultZone(ianaZone("Asia/Tokyo"), () => {
    expect(zoneName(now())).toBe("Asia/Tokyo");
    expect(zoneName(fromGregorian({}))).toBe("Asia/Tokyo");
  });
});

test("Setting the default zone to undefined gives you back a system zone", () => {
  const sysZone = getDefaultZone();
  withDefaultZone(ianaZone("Asia/Tokyo"), () => {
    setDefaultZone(undefined);
    expect(zone(now())).toBe(sysZone);
  });
});

test("Setting the default zone to null gives you back a system zone", () => {
  const sysZone = getDefaultZone();
  withDefaultZone(ianaZone("Asia/Tokyo"), () => {
    setDefaultZone(null);
    expect(zone(now())).toBe(sysZone);
  });
});

test("Setting the default zone to the system zone instance works", () => {
  const sysZone = getDefaultZone();
  withDefaultZone(ianaZone("Asia/Tokyo"), () => {
    setDefaultZone(systemZone);
    expect(zone(now())).toBe(sysZone);
  });
});
