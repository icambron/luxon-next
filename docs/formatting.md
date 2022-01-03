# Formatting

This section covers creating strings to represent a DateTime. There are three types of formatting capabilities:

1.  Technical formats like ISO 8601 and RFC 2822
2.  Internationalizable human-readable formats
3.  Token-based formatting

## Technical formats (strings for computers)

### ISO 8601

[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) is the most widely used set of string formats for dates and times. Luxon can _parse_ a wide range of them, but provides direct support for formatting only a few of them:

```js
toISO(dt); //=> '2017-04-20T11:32:00.000-04:00'
toISODate(dt); //=> '2017-04-20'
toISOWeekDate(dt); //=> '2017-W17-7'
toISOTime(dt); //=> '11:32:00.000-04:00'
```

Generally, you'll want the first one. Use it by default when building or interacting with APIs, communicating times over a wire, etc.

Luxon's ISO formatting functions have some optional paramters that allow you to different variants of the ISO format. See the API docs for more details.


### HTTP and RFC 2822

There are a number of legacy standard date and time formats out there, and Luxon supports some of them. You shouldn't use them unless you have a specific reason to.

```js
toRFC2822(dt); //=> 'Thu, 20 Apr 2017 11:32:00 -0400'
toHTTP(dt); //=> 'Thu, 20 Apr 2017 03:32:00 GMT'
```

### Unix timestamps

DateTime objects can also be converted to numerical [Unix timestamps](https://en.wikipedia.org/wiki/Unix_time):

```js
toMillis(dt); //=> 1492702320000
toSeconds(dt); //=> 1492702320.000
valueOf(dt); //=> 1492702320000, same as toMillis()
```

## Localized formats (strings for humans)

Modern browsers (and other JS environments) provide support for human-readable, internationalized strings. Luxon provides convenient support for them, and you should use them anytime you want to display a time to a user. The formatting will default to the user's locale settings, which in the examples below is `en-US`.

### toLocaleString

The most basic function is `toLocaleString`:

```js
// BASICS
toLocaleString(dt); //=> '4/20/2017, 11:32:00 AM'

// FORMATTING OPTIONS
toLocaleString(dt, { dateStyle: "full", timeStyle: "long" }); //=> 'Tuesday, April 20, 2017, 11:32:00 AM EDT'

// LOCALES
toLocaleString(dt, "fr"); //=> ''20 avr. 2017, 11:32:00'

// the locale can either be a separate arg or part of the options
toLocaleString(dt, "fr", { dateStyle: "full", timeStyle: "long" }); //=> 'jeudi 20 avril 2017 à 11:32:00 UTC−4'
toLocaleString(dt, { locale: "fr", dateStyle: "full", timeStyle: "long" }); //=> 'jeudi 20 avril 2017 à 11:32:00 UTC−4'

// CALENDARS
toLocaleString(dt, { dateStyle: "long", calendar: "islamic" }); //=> 'Rajab 23, 1438 AH'

// NUMBERING
toLocaleString(dt, { dateStyle: "long", numberingSystem: "telu" }); //=> 'April ౨౦, ౨౦౧౭'
```

In addition, you can set the default locale:

```js
toLocaleString(dt, { dateStyle: "full", timeStyle: "long" }); //=> 'Tuesday, April 20, 2017, 11:32:00 AM EDT'

setDefaultLocale("fr");

toLocaleString(dt, { dateStyle: "full", timeStyle: "long" }); //=> 'jeudi 20 avril 2017 à 11:32:00 UTC−4'

setDefaultLocale() // set it back to the browser's default
```

You can set the default format as well:

```js
setDefaultDateTimeFormat({ dateStyle: "full", timeStyle: "short" });

toLocaleString(dt) //=> 'Thursday, April 20, 2017 at 11:32 AM'

setDefaultDateTimeFormat() //=> set it back to default
```

The options argument supports all the fields from the options paramter for [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) as well as `locale`.

`locale` is a BCP-47 identifier that will be used to construct the `Intl.DateTimeFormat` object. The other options are passed as options arguments to `Intl.DateTimeFormat`. The most common options are:

| Option              | Purpose                                                                  |  Domain of values                                                                                                                                                                                  |
| ------------        | -------------------------------------------------------------------------| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `dateStyle`         | Style of the date part. Omit to omit date                                | `"full" | "long" | "medium" | "short"`                                                                                                                                                             |
| `timeStyle`         | Style of the time part. Omit to omit time                                | `"full" | "long" | "medium" | "short"`                                                                                                                                                             |
| `hourCycle`         | Whether to use 24-hour time                                              | `"h23" | "h11"` (don't use the others)                                                                                                                                                             |
| `calendar`          | Which calendar to format in. Defaults to Gregorian                       | `"buddhist"| "chinese"| " coptic"| "ethiopia"| "ethiopic"| "gregory"| " hebrew"| "indian"| "islamic"| "iso8601"| " japanese"| "persian"| "roc"`                                                    |
| `numberingSystem`   | What numbering system to use in formatting numbers. Defaults to `latn`   | `"arab"| "arabext"| " bali"| "beng"| "deva"| "fullwide"| " gujr"| "guru"| "hanidec"| "khmr"| " knda"| "laoo"| "latn"| "limb"| "mlym"| " mong"| "mymr"| "orya"| "tamldec"| " telu"| "thai"| "tibt"` |


However, all the `Intl.DateTimeFormat` options are supported.

### toLocaleTimeString and toLocaleDateString

Luxon also provides just-the-date and just-the-time variants:

```js
toLocaleDateString(dt) //=> '4/20/2017'
toLocaleTimeString(dt) //=> '11:32:00 AM'
```

These work the same way as `toLocaleString`, except that you use `setDefaultDateFormat` and `setDefaultTimeFormat` to alter the default formats, and some of the options won't work (e.g. providing `dateStyle` to `toLocaleTimeString` will throw an error).

### toLocaleParts

Sometimes you need to post-process different parts of the string. For example, an UI might want to style the year differently than the rest of the output string, regardless of where the year appears in the string. To do this, use `toLocaleParts`, which works like this:

```js
toLocaleParts(dt, { dateStyle: "long", timeStyle: "long" })
//=> [
  { type: 'month', value: 'April' },
  { type: 'literal', value: ' ' },
  { type: 'day', value: '20' },
  { type: 'literal', value: ', ' },
  { type: 'year', value: '2017' },
  { type: 'literal', value: ' at ' },
  { type: 'hour', value: '11' },
  { type: 'literal', value: ':' },
  { type: 'minute', value: '32' },
  { type: 'literal', value: ':' },
  { type: 'second', value: '00' },
  { type: 'literal', value: ' ' },
  { type: 'dayPeriod', value: 'AM' },
  { type: 'literal', value: ' ' },
  { type: 'timeZoneName', value: 'EDT' }
]
```

`toLocaleParts` accepts the same options and uses the same defaulting as `toLocaleString`; it just returns a different type. Under the covers, this uses [`Intl.DateTimeFormat.formatToParts()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts) and returns its results transparently. Therefore, refer to its documentation to understand the output structure.

## Token formats (strings for Cthulhu)

This section covers generating strings from DateTimes with programmer-specified formats.

### Consider alternatives

You shouldn't create ad-hoc string formats if you can avoid it. If you intend for a computer to read the string, prefer ISO 8601. If a human will read it, prefer `toLocaleString`. Both are covered above. However, if you have some esoteric need where you need some specific format (e.g. because some other software expects it), then `toFormat` is how you do it.

### toFormat

See `toFormat` for the API signature. As a brief motivating example:

```js
const dt = fromISO("2014-08-06T13:07:04.054");
toFormat(dt, "yyyy LLL dd"); //=> "2014 Aug 06"
```

The supported tokens are described in the table below.

### Intl

All of the strings (e.g. month names and weekday names) are internationalized by introspecting strings generated by the Intl API. Thus the exact strings you get are implementation-specific.

```js
const dt = fromISO("2014-08-06T13:07:04.054");
toFormat(dt, "yyyy LLL dd", "fr") //=> '2014 août 06'
```

Note `toFormat` defaults to `en-US`, not to the globally-set default locale. If you need the string to be internationalized, you need to set the locale explicitly like in the example above (or more preferably, use `toLocaleString`).

### Escaping

You may escape strings using brackets:

```js
toFormat(dt, "HH [hours and] mm [minutes]"); //=> '20 hours and 55 minutes'
```

Escape brackets with slashes:

```js
toFormat(dt, "\\[HH:mm\\]"); //=> `[11:32]`

// note you might need both

toFormat(dt, "HH:mm \\[[literal string inside literal brackets]\\]"); //=> `11:32 [literal string inside literal brackets]`
```

### Standalone vs format tokens

Some tokens have a "standalone" and "format" version. Some languages require different forms of a word based on whether it is part of a longer phrase or just by itself (e.g. "Monday the 22nd" vs "Monday"). Use them accordingly.

```js
const dt = fromISO("2014-08-06T13:07:04.054")
toFormat(dt, "LLLL", "ru"); //=> "август" (standalone)
toFormat(dt, "MMMM", "ru"); //=> "августа" (format)
```

### Macro tokens

Some of the formats are "macros", meaning they correspond to multiple components. These use the native Intl API and will order their constituent parts in a locale-friendly way.

```js
const dt = fromISO("2014-08-06T13:07:04.054");
toFormat(dt, "ff"); //=> "Aug 6, 2014, 1:07 PM"
```

These tokens map to Intl.DateTimeFormat option objects:

```js
{
  D: { dateStyle: "short" },
  DD: { dateStyle: "medium" },
  DDD: { dateStyle: "long" },
  DDDD: { dateStyle: "full" },
  t: { timeStyle: "short" },
  tt: { timeStyle: "medium" },
  ttt: { timeStyle: "long" },
  tttt: { timeStyle: "full" },
  T: { timeStyle: "short", hourCycle: "h23" },
  TT: { timeStyle: "medium", hourCycle: "h23" },
  TTT: { timeStyle: "long", hourCycle: "h23" },
  TTTT: { timeStyle: "full", hourCycle: "h23" },
  f: { dateStyle: "short", timeStyle: "short" },
  ff: { dateStyle: "medium", timeStyle: "medium" },
  fff: { dateStyle: "long", timeStyle: "long" },
  ffff: { dateStyle: "full", timeStyle: "full" },
  F: { dateStyle: "short", timeStyle: "short", hourCycle: "h23" },
  FF: { dateStyle: "medium", timeStyle: "medium" , hourCycle: "h23"},
  FFF: { dateStyle: "long", timeStyle: "long" , hourCycle: "h23"},
  FFFF: { dateStyle: "full", timeStyle: "full" , hourCycle: "h23"},
}
```

In other words, macro tokens are a way of dropping `toLocaleString()` calls into the middle of the string.

### Table of tokens

(Examples below given for `2014-08-06T13:07:04.054` considered as a local time in America/New_York).

| Standalone token | Format token | Description                                                    | Example                                                       |
| ---------------- | ------------ | -------------------------------------------------------------- | ------------------------------------------------------------- |
| S                |              | millisecond, no padding                                        | `54`                                                          |
| SSS              |              | millisecond, padded to 3                                       | `054`                                                         |
| u                |              | fractional seconds, functionally identical to SSS              | `054`                                                         |
| uu               |              | fractional seconds, between 0 and 99, padded to 2              | `05`                                                          |
| uuu              |              | fractional seconds, between 0 and 9                            | `0`                                                           |
| s                |              | second, no padding                                             | `4`                                                           |
| ss               |              | second, padded to 2 padding                                    | `04`                                                          |
| m                |              | minute, no padding                                             | `7`                                                           |
| mm               |              | minute, padded to 2                                            | `07`                                                          |
| h                |              | hour in 12-hour time, no padding                               | `1`                                                           |
| hh               |              | hour in 12-hour time, padded to 2                              | `01`                                                          |
| H                |              | hour in 24-hour time, no padding                               | `9`                                                           |
| HH               |              | hour in 24-hour time, padded to 2                              | `13`                                                          |
| Z                |              | narrow offset                                                  | `+5`                                                          |
| ZZ               |              | short offset                                                   | `+05:00`                                                      |
| ZZZ              |              | techie offset                                                  | `+0500`                                                       |
| ZZZZ             |              | abbreviated named offset                                       | `EST`                                                         |
| ZZZZZ            |              | unabbreviated named offset                                     | `Eastern Standard Time`                                       |
| z                |              | IANA zone                                                      | `America/New_York`                                            |
| a                |              | meridiem                                                       | `AM`                                                          |
| d                |              | day of the month, no padding                                   | `6`                                                           |
| dd               |              | day of the month, padded to 2                                  | `06`                                                          |
| c                | E            | day of the week, as number from 1-7 (Monday is 1, Sunday is 7) | `3`                                                           |
| ccc              | EEE          | day of the week, as an abbreviate localized string             | `Wed`                                                         |
| cccc             | EEEE         | day of the week, as an unabbreviated localized string          | `Wednesday`                                                   |
| ccccc            | EEEEE        | day of the week, as a single localized letter                  | `W`                                                           |
| L                | M            | month as an unpadded number                                    | `8`                                                           |
| LL               | MM           | month as an padded number                                      | `08`                                                          |
| LLL              | MMM          | month as an abbreviated localized string                       | `Aug`                                                         |
| LLLL             | MMMM         | month as an unabbreviated localized string                     | `August`                                                      |
| LLLLL            | MMMMM        | month as a single localized letter                             | `A`                                                           |
| y                |              | year, unpadded                                                 | `2014`                                                        |
| yy               |              | two-digit year                                                 | `14`                                                          |
| yyyy             |              | four- to six- digit year, pads to 4                            | `2014`                                                        |
| G                |              | abbreviated localized era                                      | `AD`                                                          |
| GG               |              | unabbreviated localized era                                    | `Anno Domini`                                                 |
| GGGGG            |              | one-letter localized era                                       | `A`                                                           |
| kk               |              | ISO week year, unpadded                                        | `14`                                                          |
| kkkk             |              | ISO week year, padded to 4                                     | `2014`                                                        |
| W                |              | ISO week number, unpadded                                      | `32`                                                          |
| WW               |              | ISO week number, padded to 2                                   | `32`                                                          |
| o                |              | ordinal (day of year), unpadded                                | `218`                                                         |
| ooo              |              | ordinal (day of year), padded to 3                             | `218`                                                         |
| q                |              | quarter, no padding                                            | `3`                                                           |
| qq               |              | quarter, padded to 2                                           | `03`                                                          |
| D                |              | localized short date                                           | `8/6/2014`                                                    |
| DD               |              | localized medium date                                          | `Aug 6, 2014`                                                 |
| DDD              |              | localized long date                                            | `August 6, 2014`                                              |
| DDDD             |              | localized date full date                                       | `Wednesday, August 6, 2014`                                   |
| t                |              | localized short time                                           | `1:07 PM`                                                     |
| tt               |              | localized medium time                                          | `1:07:04 PM`                                                  |
| ttt              |              | localized long time                                            | `1:07:04 PM EDT`                                              |
| tttt             |              | localized full time                                            | `1:07:04 PM Eastern Daylight Time`                            |
| T                |              | `t` but always 24-hour                                         | `13:07`                                                       |
| TT               |              | `tt` but always 24-hour                                        | `13:07:04`                                                    |
| TTT              |              | `ttt` but always 24-hour                                       | `13:07:04 EDT`                                                |
| TTTT             |              | `tttt` but always 24-hour                                      | `13:07:04 Eastern Daylight Time`                              |
| f                |              | localized short date and time                                  | `8/6/2014, 1:07 PM`                                           |
| ff               |              | localized medium date and time                                 | `Aug 6, 2014, 1:07:04 PM`                                     |
| fff              |              | localized long date and time                                   | `August 6, 2014, 1:07:04 PM EDT`                              |
| ffff             |              | localized full date and time                                   | `Wednesday, August 6, 2014, 1:07:04 PM Eastern Daylight Time` |
| F                |              | `f` but always 24-hour                                         | `8/6/2014, 13:07`                                             |
| FF               |              | `ff` but always 24-hour                                        | `Aug 6, 2014, 13:07:04`                                       |
| FFF              |              | `fff` but always 24-hour                                       | `August 6, 2014, 13:07:04 EDT`                                |
| FFFF             |              | `ffff` but always 24-hour                                      | `Wednesday, August 6, 2014, 13:07:04 Eastern Daylight Time`   |
| X                |              | unix timestamp in seconds                                      | `1407287224`                                                  |
| x                |              | unix timestamp in milliseconds                                 | `1407287224054`                                               |
