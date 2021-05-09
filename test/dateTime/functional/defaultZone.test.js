import { withDefaultZone } from "../../helpers";
import { fromGregorian, now, zone, zoneName } from "../../../src/dateTime/core";
import { getDefaultZone, setDefaultZone } from "../../../src/settings";
import { createIANAZone } from "../../../src/model/zones/IANAZone";

test("Setting the default zone results in a different creation zone", () => {
  withDefaultZone(createIANAZone("Asia/Tokyo"), () => {
    expect(now() |> zoneName).toBe("Asia/Tokyo");
    expect(fromGregorian({}) |> zoneName).toBe("Asia/Tokyo");
  });
});

test("Setting the default zone to undefined gives you back a system zone", () => {
  const sysZone = getDefaultZone();
  withDefaultZone(createIANAZone("Asia/Tokyo"), () => {
    setDefaultZone(undefined);
    expect(now() |> zone).toBe(sysZone);
  });
});

test("Setting the default zone to null gives you back a system zone", () => {
  const sysZone = getDefaultZone();
  withDefaultZone(createIANAZone("Asia/Tokyo"), () => {
    setDefaultZone(null);
    expect(now() |> zone).toBe(sysZone);
  });
});
