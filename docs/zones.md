# Time zones and offsets

Luxon has support for time zones. This page explains how to use them.

## Don't worry!

You _usually_ don't need to worry about time zones. Your code runs on a computer with a particular time zone and everything will work consistently in that zone without you doing anything. It's when you want to do complicated stuff _across_ zones that you have to think about it. Even then, here are some pointers to help you avoid situations where you have to think carefully about time zones:

1.  Don't make servers think about _local_ times. Configure them to use UTC and write your server's code to work in UTC. Times can often be thought of as a simple count of epoch milliseconds; what you would call that time (e.g. 9:30) in what zone doesn't (again, often) matter.
2.  Communicate times between systems in ISO 8601, like `2017-05-15T13:30:34Z` where possible (it doesn't matter if you use Z or some local offset; the point is that it precisely identifies the millisecond on the global timeline).
3.  Where possible, only think of time zones as a formatting concern; your application ideally never knows that the time it's working with is called "9:00" until it's being rendered to the user.
4.  Barring 3, do as much manipulation of the time (say, adding an hour to the current time) in the client code that's already running in the time zone where the results will matter.

All those things will make it less likely you ever need to work explicitly with time zones and may also save you plenty of other headaches. But those aren't possible for some applications; you might need to work with times in zones other than the one the program is running in, for any number of reasons. And that's where Luxon's time zone support comes in.

## Terminology

Bear with me here. Time zones are a pain in the ass. Luxon has lots of tools to deal with them, but there's no getting around the fact that they're complicated. The terminology for time zones and offsets isn't well-established. But let's try to impose some order:

1.  An **offset** is a difference between the local time and the UTC time, such as +5 (hours) or -12:30. They may be expressed directly in minutes, or in hours, or in a combination of minutes and hours. Here we'll use hours.
1.  A **time zone** is a set of rules, associated with a geographical location, that determines the local offset from UTC at any given time. The best way to identify a zone is by its IANA string, such as "America/New_York". That zone says something to the effect of "The offset is -5, except between March and November, when it's -4".
1.  A **fixed-offset time zone** is any time zone that never changes offsets, such as UTC. Luxon supports fixed-offset zones directly; they're specified like UTC+7, which you can interpret as "always with an offset of +7".
1.  A **named offset** is a time zone-specific name for an offset, such as Eastern Daylight Time. It expresses both the zone (America's EST roughly implies America/New_York) and the current offset (EST means -5). They are also confusing in that they overspecify the offset (e.g. for any given time it is unnecessary to specify EST vs EDT; it's always whichever one is right). They are also ambiguous (BST is both British Summer Time and Bangladesh Standard Time), unstandardized, and internationalized (what would a Frenchman call the US's EST?). For all these reasons, you should avoid them when specifying times programmatically. Luxon only supports their use in formatting.

Some subtleties:

1.  Multiple zones can have the same offset (think about the US's zones and their Canadian equivalents), though they might not have the same offset all the time, depending on when their DSTs are. Thus zones and offsets have a many-to-many relationship.
1.  Just because a time zone doesn't have a DST now doesn't mean it's fixed. Perhaps it had one in the past. Regardless, Luxon does not have first-class access to the list of rules, so it assumes any IANA-specified zone is not fixed and checks for its current offset programmatically.

If all this seems too terse, check out these articles. The terminology in them is subtly different but the concepts are the same:

- [Time Zones Aren’t Offsets – Offsets Aren’t Time Zones](https://spin.atomicobject.com/2016/07/06/time-zones-offsets/)
- [Stack Overflow's timezone wiki page](https://stackoverflow.com/tags/timezone/info)

## Luxon works with time zones

Luxon's DateTimes support zones directly. Each DateTime object is "in" a particular zone, by which I mean that `zone` is one of the core properties of each DateTime.

It's important to remember that a DateTime represents a specific instant in time and that instant has an unambiguous meaning independent of what time zone you're in; the zone is really a piece of social metadata that affects how humans interact with the time, rather than a fact about the passing of time itself. Of course, Luxon is a library for humans, so that social metadata affects Luxon's behavior too. It just doesn't change _what time it is_.

Specifically, a DateTime's zone affects its behavior in these ways:

1.  Times will be formatted as they would be in that zone.
1.  Transformations to the DateTime (such as `plus` or `startOf`) will obey any DSTs in that zone that affect the calculation (see "Math across DSTs" below)

Generally speaking, Luxon does not support changing a DateTime's offset, just its zone. That allows it to enforce the behaviors in the list above. The offset for that DateTime is just whatever the zone says it is. If you are unconcerned with the effects above, then you can always give your DateTime a fixed-offset zone.

## Using Zones

There are a few ways to set the zone of a DateTime:
 * You can change the zone of a DateTime by calling the `setZone` function, or its convenience wrappers like `toUTC()`, `toDefaultZone()`, `toSystemZone()`, and `toFixedOffset()`. See "Changing zones" below.
 * Many functions for constructing DateTime instances take arguments that set the zone. See "Creating DateTimes with an explicit zone" below.
 * Some functions that construct DateTimes from strings can read the zone out of the string. See "Parsing DateTimes"
 * The default zone -- that is, the zone Luxon uses in creating DateTimes when the zone is not explicitly specified -- can itself be changed globally. See "System and default zones" below.

### Specifying a zone

Generally, Luxon's functions that take zone arguments let you specify the zone in a few ways:

| Type                | Example                       | Description                                                       |
| ------------        | ------------------------------| ----------------------------------------------------------------- |
| IANA string         | 'America/New_York'            | that zone                                                         |
| system string       | 'system'                      | the system's local zone                                           |
| UTC string          | 'utc'                         | Universal Coordinated Time                                        |
| fixed offset string | 'UTC+7'                       | a fixed offset zone                                               |
| Zone                | ianaZone("America/New_York")  | a Zone instance provided by one of Luxon's functions              |
| Zone                | new YourZone()                | A custom implementation of Luxon's Zone interface (advanced only) |

Thus, you can set a zone any of these ways:

```js
const dt = now();
setZone(dt, "America/New_York");
setZone(dt, "system");
setZone(dt, "utc");
setZone(dt, "utc+7");

const zoneObject = ianaZone("America/New_York");
setZone(dt, zoneObject);
```

See the union type Zoneish for more info.

### IANA support

IANA-specified zones are string identifiers like "America/New_York" or "Asia/Tokyo". Luxon gains direct support for them by abusing built-in Intl APIs.

If you specify a zone and your environment doesn't support that zone, Luxon will throw an `InvalidZoneError` . That could be because the environment doesn't support zones at all (generally browsers older than Luxon supports), because for whatever reason it doesn't support that _particular_ zone, or because the zone is just bogus. Like this:

```js
setZone(now(), "America/Bogus"); // throws!
```

### System and default zone

When no zone is explicitly specified, DateTime instances are created in the system's zone and parsed strings are interpreted as specifying times in the system's zone. For example, my computer is configured to use `America/New_York`, which has an offset of -4 in May:

```js
var local = ymd(2017, 05, 15, 9, 10, 23);

zoneName(local) //=> 'America/New_York'
local.toString(); //=> '2017-05-15T09:10:23.000-04:00'

local  = DateTime.fromISO("2017-05-15T09:10:23");

zoneName(local); //=> 'America/New_York'
local.toString(); //=> '2017-05-15T09:10:23.000-04:00'
```

This default zone can be changed from the system's zone to a zone of your choosing:

```js
setDefaultZone(ianaZone("Asia/Tokyo"));
zoneName(now()) //=> "Asia/Tokyo"
```

Note that `setDefaultZone()` only accepts a zone _object_ -- unlike other zone functions, it doesn't coerce Zoneish arguments. So you need to construct a zone instance from the available factory functions.

### Zone objects

Most users will simply pass in the strings and let Luxon construct the appropriate Zone object out of it. However, if you want to build the Zone object yourself, see the `ianaZone()` and `fixedOffsetZone()` functions, as well as the `systemZone` and `utcZone` singletons. Building your own custom zone type is simply a matter of implementing the `Zone` interface.

## Changing zones

### setZone

Luxon objects are immutable, so when we say "changing zones" we really mean "creating a new instance with a different zone". Changing zone generally means "change the zone in which this DateTime is expressed (and according to which rules it is manipulated), but don't change the underlying timestamp." For example:

```js
var local = now();
var rezoned = setZone(local "America/Los_Angeles");

// different local times with different offsets
local.toString(); //=> '2017-09-13T18:30:51.141-04:00'
rezoned.toString(); //=> '2017-09-13T15:30:51.141-07:00'

// but actually the same time
local.valueOf() === rezoned.valueOf(); //=> true
```

### keepLocalTime

Generally, it's best to think of the zone as a sort of metadata that you slide around independent of the underlying count of milliseconds. However, sometimes that's not what you want. Sometimes you want to change zones while keeping the local time fixed and instead altering the timestamp. Luxon supports this:

```js
var local = now();
var rezoned = setZone(local, "America/Los_Angeles", { keepLocalTime: true });

local.toString(); //=> '2017-09-13T18:36:23.187-04:00'
rezoned.toString(); //=> '2017-09-13T18:36:23.187-07:00'

local.valueOf() === rezoned.valueOf(); //=> false
```

If you find that confusing, I recommend just not using it. On the other hand, if you find yourself using this all the time, you are probably doing something wrong.

## Creating DateTimes

### Creating DateTimes with an explicit zone

Many of Luxon's factory functions allow you to tell it specifically what zone to create the DateTime in:

```js
var dt = now("Europe/Paris");
zoneName(dt) //=> 'Europe/Paris'
offset(dt) //=> 120
dt.toString() // => '2021-12-22T20:01:45.204Z'
```

In addition, some functions, like `ymdUTC()`, specifically interprets the input as being specified in UTC. They _also_ returns a DateTime in UTC:

```js
var utc = ymdUTC(2017, 05, 15, 9, 10, 23);

zoneName(utc); //=> 'UTC'
utc.toString(); //=> '2017-05-15T09:10:23.000Z'
```

### Parsing DateTimes

When parsing, there are two things to consider:

1. What is the zone of the resulting DateTime instance?
2. The date and time in the string were expressed in some local time. In what zone does Luxon _interpret_ that information as having been expressed in? Note that some strings actually specify in the string itself which zone or offset they're expressed in.

In theory, those are orthogonal concerns, but in practice they're closely related. Here's how Luxon handles them:

1. If no zone in specified in the string and no zone arguments are provided, the string is interpreted in the default zone, and the resulting DateTime is in the default zone.
2. If the string specifies a zone or offset (such as in the ISO string "2014-08-06T10:00:00-04:00"), then the time is interpretted in _that_ zone and then converted to the default zone.
3. If a zone is specified as argument to the parse function, Luxon converts the date to that zone. If the string specifies the zone, then that's the zone we're converting _from_ (see 2). If the string does not specify the zone or offset, then Luxon uses the Zone argument as the interpretation zone too, and thus the conversion is a noop.
4. If the `useZoneFromInput` option is specified and the string itself specifies the zone or offset, Luxon set the zone of the DateTime to that zone, so that the conversion is a noop. Note that if only an offset is provided by the string, the zone will be a fixed-offset one, since Luxon doesn't know which zone is meant, even if you do.

Same explanation, but in code:

```js
// 1. zone that has no offset information, and we're not providing a zone argument
const noZoneSpecified = fromISO("2017-05-15T09:10:23");
zone(noZoneSpecified)       //=> a SystemZone
zoneName(noZoneSpecified)   //=> "America/New_York" (because that's my system's zone)

// note the time is the same as in the original string, because it was interpretted with a -4 offset, and kept there
toISO(noZoneSpecified)      //=> '2017-05-15T09:10:23.000-04:00'

// 2. a string that specifies the offset or offset
const specifyOffset = fromISO("2017-05-15T09:10:23-08:00");
zone(specifyOffset)       //=> a SystemZone

toISO(specifyOffset)      //=> '2017-05-15T13:10:23.000-04:00'. We converted this time into our system zone, which for me is America/New_York. -8 in the string is 4 hours off from my -4 summer time, so we end up with a local time 4 hours later

// 3a. zone is specified as an argument and there's no offset or zone info in the string
let explicitZone = fromISO("2017-05-15T09:10:23", { zone: "Europe/Paris" });

// fromISO() lets you substitute the zone directly for the option hash, if you have no other options to specify
explicitZone = fromISO("2017-05-15T09:10:23", "Europe/Paris");

zoneName(explicitZone) //=> 'Europe/Paris'

toISO(explicitZone) //=> '2017-05-15T09:10:23.000+02:00'. Note this is the same as the original time, because the string was also interpretted as expressing a Paris time.

// 3b. the zone is specified as an argument AND in the string
let explicitAndInString = fromISO("2017-05-15T09:10:23-08:00", "Europe/Paris");

zoneName(explicitAndInString) //=> 'Europe/Paris'. This is what we asked for

toISO(explicitAndInString) //=> '2017-05-15T19:10:23.000+02:00'. We converted from -8 (from the string) to +2 (Paris offset)

// we've been letting the string specify an offset, but it can also specify a zone

explicitAndInString = fromFormat(
  "2017-05-15T09:10:23 America/Anchorage",   // Anchorage is -8 in the summer
  "yyyy-MM-dd[T]HH:mm:ss z",
  { zone: "Europe/Paris" }
);

toISO(explicitAndInString) //=> '2017-05-15T19:10:23.000+02:00'

// 4. the string specifies the offset and `useZoneFromInput` is specified:

const keepOffset = fromISO("2017-05-15T09:10:23-08:00", { useTargetZoneFromInput: true });

zoneName(keepOffset);  //=> 'UTC-8'
keepOffset.toString(); //=> '2017-05-15T09:10:23.000-09:00'

const keepZone = fromFormat("2017-05-15T09:10:23 Europe/Paris", "yyyy-MM-dd'T'HH:mm:ss z", {
  useTargetZoneFromInput: true
});

zoneName(keepZone);  //=> 'Europe/Paris'
keepZone.toString(); //=> '2017-05-15T09:10:23.000+02:00'
```

Couple of additional notes:

1. It doesn't make sense to specify both the `useZoneFromInput` and `zone` options
2. I'm sometimes asked why `useZoneFromInput` isn't the default. "Doesn't the string _tell you_ the zone?" The answer is that many programs don't control the string; they come from some outside system that could use any offset it feels like. But the program relies on the behavior of its DateTime instances to be consitent. If `useZoneFromInput` were the default then 9:00 would mean something different from DateTime instance to DateTime instance, and the program using it would to do all sorts of extra checks to understand the semantics of the time. It would be a weird default to let the string's details alter the behavior of the DateTime, asopposed to simply specifying the underlying time. But there are obviously exceptions, which is why the option exists.
3. I'm sometimes asked why the user can't control the "interpreation zone" and the "target zone" independently. There are certainly instances where that would be useful: if I have a string that I know specifies the time in Tongan local time but my program needs to do stuff with it in Napalese local time, that would be a nice option. But that's pretty rare, and it's almost as easy to do `setZone(parsedInTonga, "Asia/Kathmandu")`. In exchange, there are fewer options to implement, document, and test.


## Accessing zone information

Luxon DateTimes have a few different accessors that let you find out about the zone and offset:

```js
var local = now();

zone(local);     //=> [an instance of Zone]
zoneName(local); //=> 'America/New_York'
offset(local);   //=> -240

isOffsetFixed(local) //=> false
isInDST(local)       //=> true

formatOffset(local)                         //=> 'EST'
formatOffset(local, { width: "short" })     //=> 'EST'
formatOffset(local, { width: "long" })      //=> 'Eastern Standard Time'
formatOffset(local, { width: "techie" })    //=> '-0500'
formatOffset(local, { width: "standard" })  //> '-05:00'
formatOffset(local, { width: "narrow" })    //=> '-5'

// not every locale has a good string for every offset name
formatOffset(local, "fr") //=> 'UTC−5'
formatOffset(local, { locale: "fr" }) //=> 'UTC−5'

// but sometimes they do!
formatOffset(local, { locale: "fr", width: "long" } ) //=> 'heure normale de l’Est nord-américain'
```

## DST weirdness

Because our ancestors were morons, they opted for a system wherein many governments shift around the local time twice a year for no good reason. And it's not like they do it in a neat, coordinated fashion. No, they do it whimsically, varying the shifts' timing from country to country (or region to region!) and from year to year. And of course, they do it the opposite way south of the Equator. This is all a tremendous waste of everyone's energy and, er, time, but it is how the world works and a date and time library has to deal with it.

Most of the time, DST shifts will happen without you having to do anything about it and everything will just work. Luxon goes to some pains to make DSTs as unweird as possible. But there are exceptions. This section covers them.

### Invalid times

Some local times simply don't exist. The Spring Forward DST shift involves shifting the local time forward by (usually) one hour. In my zone, `America/New_York`, on March 12, 2017 the millisecond after `1:59:59.999` is `3:00:00.000`. Thus the times between `2:00:00.000` and `2:59:59.999`, inclusive, don't exist in that zone. But of course, nothing stops a user from constructing a DateTime out of that local time.

If you create such a DateTime from scratch, the missing time will be advanced by an hour:

```js
ymd(2017, 3, 12, 2, 30).toString(); //=> '2017-03-12T03:30:00.000-04:00'
```

You can also do date math that lands you in the middle of the shift. These also push forward:

```js
ymd(2017, 3, 11, 2, 30) |>
  plus(%, { days: 1 }) |>
  toISO(%) //=> '2017-03-12T03:30:00.000-04:00'

ymd(2017, 3, 13, 2, 30) |>
  minus(%, { days: 1 }) |> 
  toISO(%); //=> '2017-03-12T03:30:00.000-04:00'
```

### Ambiguous times

Harder to handle are ambiguous times. During Fall Back, some local times happen twice. In my zone, `America/New_York`, on November 5, 2017 the millisecond after `1:59:59.000` became `1:00:00.000`. But of course there was already a 1:00 that day, one hour before before this one. So if you create a DateTime with a local time of 1:30, which time do you mean? It's an important question, because they correspond to different moments in time.

However, Luxon's behavior here is undefined. It makes no promises about which of the two possible timestamps the instance will represent. Currently, its specific behavior is like this:

```js
ymd(2017, 11, 5, 1, 30) |> offset(%) / 60; //=> -4
ymd(2017, 11, 4, 1, 30) |> plus(%, { days: 1 }) |> offset(%) / 60; //=> -4
ymd(2017, 11, 6, 1, 30) |> minus(%, { days: 1 }) |> offset(%) / 60; //=> -5
```

In other words, sometimes it picks one and sometimes the other. Luxon doesn't guarantee the specific behavior above. That's just what it happens to do.

If you're curious, this lack of definition is because Luxon doesn't actually know that any particular DateTime is an ambiguous time. It doesn't know the time zones rules at all. It just knows the local time does not contradict the offset and leaves it at that. To find out the time is ambiguous and define exact rules for how to resolve it, Luxon would have to test nearby times to see if it can find duplicate local time, and it would have to do that on every creation of a DateTime, regardless of whether it was anywhere near a real DST shift. Because that's onerous, Luxon doesn't bother.

### Math across DSTs

There's a whole [section](math.md) about date and time math, but it's worth highlighting one thing here: when Luxon does math across DSTs, it adjusts for them when working with higher-order, variable-length units like days, weeks, months, and years. When working with lower-order, exact units like hours, minutes, and seconds, it does not. For example, DSTs mean that days are not always the same length: one day a year is (usually) 23 hours long and another is 25 hours long. Luxon makes sure that adding days takes that into account. On the other hand, an hour is always 3,600,000 milliseconds.

An easy way to think of it is that if you add a day to a DateTime, you should always get the same time the next day, regardless of any intervening DSTs. On the other hand, adding 24 hours will result in DateTime that is 24 hours later, which may or may not be the same time the next day. In this example, my zone is `America/New_York`, which had a Spring Forward DST in the early hours of March 12.

```js
var start = ymd(2017, 3, 11, 10);
hour(start);                           //=> 10, just for comparison
plus(start, { days: 1 }) |> hour(%);   //=> 10, stayed the same
plus(start, { hours: 24 }) |> hour(%); //=> 11, DST pushed forward an hour
```
