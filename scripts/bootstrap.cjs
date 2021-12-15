import("../build/mjs/luxon.mjs").then(luxon => {
  for ([key, val] of Object.entries(luxon)) {
    global[key] = val;
  }
});
