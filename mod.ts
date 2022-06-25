import { bold, cyan, green, red } from "std/fmt/colors.ts";
import { parse as parseArg } from "std/flags/mod.ts";
import { parse as parseYoJSON, YoJSONObjectPropValue } from "./yojson.ts";

const parsedArgs = parseArg(Deno.args);
if (parsedArgs._.length != 3) {
  console.error(
    `${red("Error")} 3 file paths must be passed, but ${bold(String(parsedArgs._.length))} path(s) were passed`,
  );
  Deno.exit(1);
}
const [pathX, pathY, pathZ] = parsedArgs._;

if (typeof pathX === "number") {
  console.error(
    `${red("Error")} path must be passed, but ${bold(String(pathX))} was passed`,
  );
  Deno.exit(1);
}
if (typeof pathY === "number") {
  console.error(
    `${red("Error")} path must be passed, but ${bold(String(pathY))} was passed`,
  );
  Deno.exit(1);
}
if (typeof pathZ === "number") {
  console.error(
    `${red("Error")} path must be passed, but ${bold(String(pathZ))} was passed`,
  );
  Deno.exit(1);
}

const textX = await Deno.readTextFile(pathX)
  .catch((e) => {
    console.error(`${red("Error")} Something wrong when reading ${cyan(pathX)}`);
    console.trace(e);
    Deno.exit(1);
  })
  .then((text) => {
    const { ast, errs } = parseYoJSON(text);
    if (ast === null || 0 < errs.length) {
      console.error(`${red("Error")} Syntax error in ${cyan(pathX)}`);
      console.dir(errs);
      Deno.exit(1);
    }
    return ast;
  });
const textY = await Deno.readTextFile(pathY)
  .catch((e) => {
    console.error(`${red("Error")} Something wrong when reading ${cyan(pathY)}`);
    console.trace(e);
    Deno.exit(1);
  })
  .then((text) => {
    const { ast, errs } = parseYoJSON(text);
    if (ast === null || 0 < errs.length) {
      console.error(`${red("Error")} Syntax error in ${cyan(pathY)}`);
      console.dir(errs);
      Deno.exit(1);
    }
    return ast;
  });

export const psVal = (v: YoJSONObjectPropValue) => {
  return `<"${v.key.actual}":{"${v.value.key.actual}":"${v.value.value.actual}"}>`;
};

const textZ = [...textX.actual, ...textY.actual]
  .map(({ key, value }) => `"${key.actual}":${psVal(value)}`)
  .reduce((p, c, i, { length }) => p + c + (i === length - 1 ? "\n}" : ",\n"), "{\n");

await Deno.writeTextFile(pathZ, textZ);
console.log(`${green("Ok")} ${cyan(pathY)} was written`);
Deno.exit(1);
