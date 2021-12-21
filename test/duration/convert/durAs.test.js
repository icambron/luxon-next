import { durFromMillis, durAs } from "../../../src/luxon";

test("as shifts to one unit and returns it", () => {
  const dur = durFromMillis(5760000);
  expect(durAs(dur, "hours")).toBe(1.6);
});
