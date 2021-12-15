An experimental rewrite of Luxon.

## Ideas here

 1. Make tree-shaking work by dispensing with classes and being careful about dependency structure
 2. Support chaining using JS pipe operators (presumably the hack variety)
 3. Typescript all the things
 4. Calendar extensibility (though not parser and formatter extensibility)
 5. Clearer control of memoization
 6. Fewer things are "part" of the core objects, such as locale and conversionAccuracy, and are instead always arguments to particular functions, or global defaults

## Caveat Emptor!

This is completely experimental. If you use this for anything real, you are making a mistake.

The future of this code is very much in doubt:

 1. The Temporal API (a much-improved native Date API for the browser) is now in Stage 3. It should obviate most of the need for a library like Luxon and may cause me to shelve it altogether. At the very least, I will happily chuck a ton of the code here.
 2. I'm working on this while I have some time off, which I'll eventually stop having. I also may simply move onto other stuff. Creating a new date/time library no one asked for is a lot of work!
