import { durFromMillis, as } from "../../../src/luxon";

test("as shifts to one unit and returns it", () => {
  const dur = durFromMillis(5760000);
  expect(as(dur, "hours")).toBe(1.6);
});
