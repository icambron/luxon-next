import { fromGregorian } from "../../../src/dateTime/core";
import { setZone, toUTC } from "../../../src/dateTime/zone";
import { plus } from "../../../src/dateTime/math";
import { toHTTP } from "../../../src/dateTime/format";

const dtMaker = () =>
  fromGregorian(
    {
      year: 1982,
      month: 5,
      day: 25,
      hour: 9,
      minute: 23,
      second: 54,
      millisecond: 123,
    },
    "utc"
  );
const dt = dtMaker();

test("toHTTP() returns an RFC 1123 date", () => {
  expect(dt |> toUTC() |> toHTTP()).toBe("Tue, 25 May 1982 09:23:54 GMT");
  expect(dt |> setZone("America/New_York") |> toHTTP()).toBe("Tue, 25 May 1982 09:23:54 GMT");
  expect(dt |> plus({ hours: 10 }) |> toHTTP()).toBe("Tue, 25 May 1982 19:23:54 GMT");
});
