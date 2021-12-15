import("../build/es6/luxon.js").then(luxon => {
  for ([key, val] of Object.entries(luxon)) {
    global[key] = val;
  }
});
