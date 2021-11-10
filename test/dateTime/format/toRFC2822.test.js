import { fromGregorian, setTime } from "../../../src/dateTime/core";
import { toRFC2822 } from "../../../src/dateTime/format";
import { setZone, toUTC } from "../../../src/dateTime/zone";

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

test("toRFC2822() returns an RFC 2822 date", () => {
  expect(dt |> toUTC() |> toRFC2822()).toBe("Tue, 25 May 1982 09:23:54 +0000");
  expect(dt |> setZone("America/New_York") |> toRFC2822()).toBe("Tue, 25 May 1982 05:23:54 -0400");
  expect(dt |> setTime({ hour: 15 }) |> toRFC2822()).toBe("Tue, 25 May 1982 15:23:54 +0000");
});
