import { toGregorian } from "../../../src/dateTime/core";
import { fromOrdinal, toOrdinal } from "../../../src/dateTime/ordinal";

test("fromOrdinal() builds the right Gregorian date", () => {
  const dt = fromOrdinal({ year: 2016, ordinal: 146, hour: 1, minute: 2, second: 3, millisecond: 4 })
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 1,
    minute: 2,
    second: 3,
    millisecond: 4,
  })

  expect(dt |> toOrdinal()).toEqual({
    year: 2016,
    ordinal: 146,
    hour: 1,
    minute: 2,
    second: 3,
    millisecond: 4,
  });
});

test("fromOrdinal() defaults the ordinal", () => {
  const dt = fromOrdinal({ year: 2016 });
  expect(dt |> toGregorian()).toEqual({
    year: 2016,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});