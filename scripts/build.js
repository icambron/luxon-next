import { promises as fs } from "fs"; 
import * as fsSync from "fs";
import swc from "@swc/core";

const defaultSwcOpts = JSON.parse(fsSync.readFileSync(".swcrc"));

const bundle = async (name, options = {}) => {

  const defaultOpts = {entry: "src/luxon.ts", moduleType: "es6", minify: false, output: "luxon.js", global: false};

  const opts = {...defaultOpts, ...options };

  if (!fsSync.existsSync(`build/${name}`)) {
    await fs.mkdir(`build/${name}`);
  }

  const swcOpts = {...defaultSwcOpts, minify: opts.minify, };

  if (opts.minify) {
    const jsc = {...swcOpts.jsc };
    jsc.minify = { mangle: { topLevel: false }, compress: true };
    swcOpts.jsc = jsc;
  }

  const {luxon} = await swc.bundle({
    entry: { luxon: opts.entry },
    mode: "production",
    options: swcOpts,
    module: { type: opts.moduleType }
  });

  await Promise.all([
    fs.writeFile(`build/${name}/${opts.output}`, luxon.code),
    fs.writeFile(`build/${name}/luxon.map.js`, luxon.map)
  ]);
}

const buildAll = () => Promise.all([
  bundle("esm"),
  // not sure why these don't work?? They just seem to produce esm modules...
  // bundle("commonjs", { moduleType: "commonjs" }),
  // bundle("amd", { moduleType: "amd" })
]);


if (!fsSync.existsSync("build")) {
  fsSync.mkdirSync("build");
}

buildAll()

