import { ianaZone, ymdUTC, hour, toDefaultZone } from "../../../src/luxon";
import { withDefaultZone } from "../../helpers";

test("toDefaultZone switches to the default zone", () => {
  withDefaultZone(ianaZone("Asia/Tokyo"), () => {
    const inUtc = ymdUTC(2020, 11, 16, 9);
    const zoned = toDefaultZone(inUtc);

    expect(hour(zoned)).toBe(18);
    expect(zoned.offset).toBe(9 * 60);
  });
});
