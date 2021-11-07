import { listEras } from "../../../src/dateTime/format";

test("listEras() lists both eras", () => {
  expect(listEras()).toEqual(["BC", "AD"]);
  expect(listEras({ width: "short" })).toEqual(["BC", "AD"]);
  expect(listEras({ width: "long" })).toEqual(["Before Christ", "Anno Domini"]);
  expect(listEras("fr", { width: "short" })).toEqual(["av. J.-C.", "ap. J.-C."]);
  expect(listEras("fr", { width: "long" })).toEqual(["avant Jésus-Christ", "après Jésus-Christ"]);
});

test("listEras() allows calendar args", () => {
  expect(listEras("en", { calendar: "islamic" })).toEqual(["AH"]);
});
