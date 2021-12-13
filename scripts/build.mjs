import { promises as fs } from "fs"; 
import * as fsSync from "fs";
import swc, { minify } from "@swc/core";

const defaultSwcOpts = JSON.parse(fsSync.readFileSync(".swcrc"));

const bundle = async (name, opts = {}) => {

  const defaultOpts = {entry: "src/luxon.ts", moduleType: "es6", minify: false, output: "luxon.js", global: false};

  opts = {...defaultOpts, ...opts};

  if (!fsSync.existsSync(`build/${name}`)) {
    await fs.mkdir(`build/${name}`);
  }

  const swcOpts = {...defaultSwcOpts, minify: opts.minify, module: { type: opts.moduleType }};

  if (minify) {
    swcOpts.jsc.minify = { mangle: { topLevel: false }, compress: true };
  }

  const {luxon} = await swc.bundle({
    entry: { luxon: opts.entry },
    mode: "production",
    options: swcOpts
  });

  await Promise.all([
    fs.writeFile(`build/${name}/${opts.output}`, luxon.code),
    fs.writeFile(`build/${name}/luxon.map.js`, luxon.map)
  ]);
}

const buildAll = () => Promise.all([
  bundle("es6"),
  bundle("mjs", { output: "luxon.mjs" }),
  bundle("commonjs", { moduleType: "commonjs" }),
  bundle("global", { entry: "src/global.js", minify: true })
]);


if (!fsSync.existsSync("build")) {
  fsSync.mkdirSync("build");
}

buildAll()

