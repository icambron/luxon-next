import { durFromMillis } from "../../../src/duration/core";
import { as } from "../../../src/duration/convert";

test("Duration#as shifts to one unit and returns it", () => {
  const dur = durFromMillis(5760000);
  expect(as(dur, "hours")).toBe(1.6);
});
