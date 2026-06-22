import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const packagePaths = [
  "packages/core/package.json",
  "packages/testing/package.json",
  "packages/adapter-three/package.json"
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const config = readJson(".changeset/config.json");
assert(config.baseBranch === "main", "Changesets baseBranch must be main.");
assert(config.commit === false, "Changesets must not auto-commit in dry-run mode.");
assert(config.access === "restricted", "Changesets access must stay restricted while packages are private.");

for (const packagePath of packagePaths) {
  const manifest = readJson(packagePath);
  assert(manifest.private === true, `${manifest.name} must remain private during v0.3 dry-run governance.`);
}

const result = spawnSync(process.execPath, [
  "node_modules/@changesets/cli/bin.js",
  "status",
  "--verbose",
  "--since",
  "HEAD"
], {
  cwd: process.cwd(),
  encoding: "utf8"
});

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
if (result.status !== 0 && !output.includes("No changesets found")) {
  throw new Error(`Changesets status failed:\n${output}`);
}

console.log(output.trim() || "No changesets found for current HEAD.");
console.log("changesets dry-run passed");
