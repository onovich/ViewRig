import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const mode = process.argv.includes("--write") ? "write" : "check";
const cli = resolve("node_modules", "@microsoft", "api-extractor", "bin", "api-extractor");
const configs = [
  "packages/core/api-extractor.json",
  "packages/testing/api-extractor.json",
  "packages/adapter-three/api-extractor.json"
];

let failed = false;

for (const config of configs) {
  const args = [cli, "run", "--config", config];
  if (mode === "write") {
    args.push("--local");
  }

  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    stdio: "inherit"
  });

  if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`api extractor ${mode} passed`);
