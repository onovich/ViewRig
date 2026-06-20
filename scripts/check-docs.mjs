import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const failures = [];

function requirePath(path) {
  if (!existsSync(path)) {
    failures.push(`Missing required path: ${path}`);
  }
}

function assertNoBom(path) {
  const bytes = readFileSync(path);
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    failures.push(`UTF-8 BOM is not allowed: ${path}`);
  }
}

requirePath("README.md");
requirePath("docs");

if (existsSync("README.md")) {
  assertNoBom("README.md");
}

if (existsSync("docs") && statSync("docs").isDirectory()) {
  const docs = readdirSync("docs")
    .filter((name) => name.startsWith("ViewRig_") && name.endsWith(".md"))
    .map((name) => join("docs", name));

  if (docs.length === 0) {
    failures.push("Expected at least one docs/ViewRig_*.md document.");
  }

  for (const path of docs) {
    assertNoBom(path);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log("docs check passed");
