import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "index.html",
  "src/main.js",
  "src/styles.css"
];

for (const file of required) {
  if (!existsSync(resolve(root, file))) {
    throw new Error(`Missing playground file: ${file}`);
  }
}

const html = readFileSync(resolve(root, "index.html"), "utf8");
const js = readFileSync(resolve(root, "src/main.js"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

for (const token of ["#view", "#yaw", "#pitch", "#distance", "#debugOverlay", "#debugState", "#pose"]) {
  if (!html.includes(token.slice(1)) && !js.includes(token)) {
    throw new Error(`Missing smoke token: ${token}`);
  }
}

for (const token of ["addEventListener(\"input\", render)", "JSON.stringify(pose", "orbitPose(", "drawDebugOverlay(", "ctx.setLineDash"]) {
  if (!js.includes(token)) {
    throw new Error(`Missing interactive pose token: ${token}`);
  }
}

for (const token of ["canvas", "input", "output", "pre"]) {
  if (!css.includes(token)) {
    throw new Error(`Missing playground style token: ${token}`);
  }
}

console.log("three-orbit-playground smoke passed");
