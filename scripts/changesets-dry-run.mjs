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

function gitLines(args) {
  const result = spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(`Git command failed: git ${args.join(" ")}\n${result.stdout ?? ""}${result.stderr ?? ""}`);
  }

  return (result.stdout ?? "").split(/\r?\n/).filter((line) => line.length > 0);
}

function currentChangesetFiles() {
  return new Set([
    ...gitLines(["diff", "--name-only", "--diff-filter=AM", "HEAD", "--", ".changeset"]),
    ...gitLines(["ls-files", "--others", "--exclude-standard", "--", ".changeset"])
  ]);
}

function hasCurrentEmptyChangeset() {
  for (const fileName of currentChangesetFiles()) {
    if (!fileName.endsWith(".md") || fileName === ".changeset/README.md") {
      continue;
    }

    const content = readFileSync(fileName, "utf8").replace(/\r\n/g, "\n").trim();
    if (content === "---\n---") {
      return true;
    }
  }

  return false;
}

function hasCurrentChangeset() {
  for (const fileName of currentChangesetFiles()) {
    if (fileName.endsWith(".md") && fileName !== ".changeset/README.md") {
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
  assert(manifest.private === true, `${manifest.name} must remain private during dry-run governance.`);
}

let result = runChangesetStatus(["--since", "HEAD"]);

if (
  result.status !== 0 &&
  result.output.includes("Some packages have been changed but no changesets were found") &&
  (hasCurrentChangeset() || hasCurrentEmptyChangeset())
) {
  result = runChangesetStatus([]);
}

if (result.status !== 0 && !result.output.includes("No changesets found")) {
  throw new Error(`Changesets status failed:\n${result.output}`);
}

console.log(result.output.trim() || "No changesets found for current HEAD.");
console.log("changesets dry-run passed");
