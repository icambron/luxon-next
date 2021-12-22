import { durValues, durFromISOTime } from "../../../src/luxon";

const checkTime = (s, ob) => {
  expect(durValues(durFromISOTime(s))).toEqual(ob);
};

test("durFromISOTime can parse a variety of extended ISO time formats", () => {
  checkTime("11:22:33.444", { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 });
  checkTime("11:22:33", { hours: 11, minutes: 22, seconds: 33 });
  checkTime("11:22", { hours: 11, minutes: 22, seconds: 0 });
  checkTime("T11:22", { hours: 11, minutes: 22, seconds: 0 });
});

test("fromISOTime can parse a variety of basic ISO time formats", () => {
  checkTime("112233.444", { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 });
  checkTime("112233", { hours: 11, minutes: 22, seconds: 33 });
  checkTime("1122", { hours: 11, minutes: 22, seconds: 0 });
  checkTime("11", { hours: 11, minutes: 0, seconds: 0 });
  checkTime("T1122", { hours: 11, minutes: 22, seconds: 0 });
});

const rejectsTime = (s) => {
  expect(() => durFromISOTime(s)).toThrow();
};

test("fromISOTime rejects junk", () => {
  rejectsTime("poop");
  rejectsTime("Tglorb");
  rejectsTime("-00:00");
});
