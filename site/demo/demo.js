import { now, ymd, ymdUTC, toUTC, toSystemZone, toGregorian, fromGregorian, toLocaleString, toFormat, fromFormat, toRelativeHuman, plus, minus, toRFC2822, fromISO, diff } from "../esm/luxon.js";

const run = function (code) {
  let result;
  try {
    result = eval(code);
  } catch (e) {
    console.error(e);
    return "[error]";
  }

  switch (true) {
    case result.isLuxonDateTime:
      return "[ DateTime " + result.toString() + " ]";
    case result.isLuxonDuration:
      return "[ Duration " + JSON.stringify(result.values) + " ]";
    default:
      return JSON.stringify(result);
  }
};


const examples = [];
const example = function (code) {
  examples.push(
    "<tr class='example'><td class='code'>" +
      code +
      "</td><td class='divider'>//=> </td><td class='result'>" +
      run(code) +
      "</td></tr>"
  );
};

example("now()");
example("ymd(2017, 5, 15, 17, 36)");
example("ymdUTC(2017, 5, 15, 17, 36)");
example("toUTC(now())");
example("toSystemZone(ymdUTC(2017, 5, 15, 17, 36))");
example("toGregorian(now())");
example("fromGregorian({year: 2017, month: 5, day: 15, hour: 17, minute: 36})");
example(
  "fromGregorian({year: 2017, month: 5, day: 15, hour: 17, minute: 36 }, 'America/New_York')"
);
example(
  "fromGregorian({year: 2017, month: 5, day: 15, hour: 17, minute: 36 }, 'Asia/Singapore')"
);
example("plus(now(), {minutes: 15, seconds: 8})");
example("plus(now(), {days: 6})");
example("minus(now(), {days: 6})");
example("diff(ymd(1982, 5, 25), now())");
example("diff(ymd(1982, 5, 25), now(), 'days')");
example("diff(ymd(1982, 5, 25), now(), ['days', 'hours'])");
example("toLocaleString(now())");
example("toLocaleString(now(), { dateStyle: 'medium' })");
example("toLocaleString(now(), 'fr', { dateStyle: 'full' })");
example("fromISO('2017-05-15')");
example("fromISO('2017-05-15T17:36')");
example("fromISO('2017-W33-4')");
example("fromISO('2017-W33-4T04:45:32.343')");
example("fromFormat('12-16-2017', 'MM-dd-yyyy')");
example("toFormat(now(), 'MM-dd-yyyy')");
example("toFormat(now(), 'MMMM dd, yyyy')");
example("toFormat(now(), 'MMMM dd, yyyy', 'fr')");
example("fromFormat('May 25, 1982', 'MMMM dd, yyyy')");
example("fromFormat('mai 25, 1982', 'MMMM dd, yyyy', 'fr')");
example("toRelativeHuman(now(), plus(now(), { days: 1 }))");
example("toRelativeHuman(now(), plus(now(), { days: -1 }))");
example("toRelativeHuman(now(), plus(now(), { months: 1 }))");
example("toRelativeHuman(now(), plus(now(), { days: 1 }), 'fr')");
example("toRelativeHuman(now(), plus(now(), { days: -1 }), 'fr')");
example("toRelativeHuman(now(), plus(now(), { months: 1 }), 'fr')");
example("toRFC2822(now())");

let all = "<h1>Some Luxon examples</h1>";
all +=
  "<p>This is not meant to be a comprehensive showcase of Luxon's capabilities, just a quick flavoring.</p>";
all += "<table>";
all += examples.join("");
all += "</table>";

document.body.innerHTML = all;

