import { fromMillis } from "../../../src/duration/core";
import { as } from "../../../src/duration/convert";

test("Duration#as shifts to one unit and returns it", () => {
  const dur = fromMillis(5760000);
  expect(dur |> as("hours")).toBe(1.6);
});
