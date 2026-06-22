import { readdirSync, readFileSync } from "node:fs";
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

function runChangesetStatus(args) {
  const result = spawnSync(process.execPath, [
    "node_modules/@changesets/cli/bin.js",
    "status",
    "--verbose",
    ...args
  ], {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  return {
    status: result.status,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`
  };
}

function hasEmptyChangeset() {
  for (const fileName of readdirSync(".changeset")) {
    if (!fileName.endsWith(".md") || fileName === "README.md") {
      continue;
    }

    const content = readFileSync(`.changeset/${fileName}`, "utf8").replace(/\r\n/g, "\n").trim();
    if (content === "---\n---") {
      return true;
    }
  }

  return false;
}

const config = readJson(".changeset/config.json");
assert(config.baseBranch === "main", "Changesets baseBranch must be main.");
assert(config.commit === false, "Changesets must not auto-commit in dry-run mode.");
assert(config.access === "restricted", "Changesets access must stay restricted while packages are private.");

for (const packagePath of packagePaths) {
  const manifest = readJson(packagePath);
  assert(manifest.private === true, `${manifest.name} must remain private during v0.3 dry-run governance.`);
}

let result = runChangesetStatus(["--since", "HEAD"]);

if (result.status !== 0 && result.output.includes("Some packages have been changed but no changesets were found") && hasEmptyChangeset()) {
  result = runChangesetStatus([]);
}

if (result.status !== 0 && !result.output.includes("No changesets found")) {
  throw new Error(`Changesets status failed:\n${result.output}`);
}

console.log(result.output.trim() || "No changesets found for current HEAD.");
console.log("changesets dry-run passed");
