import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const failures = [];
const forbiddenCoreImportNames = [
  "three",
  "react",
  "sinan",
  "rapier",
  "@dimforge/rapier3d",
  "babylon",
  "playcanvas"
];

function walkFiles(root, predicate = () => true) {
  if (!existsSync(root)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...walkFiles(path, predicate));
    } else if (predicate(path)) {
      files.push(path);
    }
  }

  return files;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function importedSpecifiers(source) {
  const specifiers = [];
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[^'"]+?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+(?:type\s+)?[^'"]+?\s+from\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.push(match[1]);
    }
  }

  return specifiers;
}

function fail(path, message) {
  failures.push(`${relative(process.cwd(), path)}: ${message}`);
}

if (existsSync("packages/sinan")) {
  failures.push("packages/sinan must not exist before a public Sinan adapter is approved.");
}

if (existsSync("packages/debug-three")) {
  failures.push("packages/debug-three is deferred for v0.2; keep Three debug rendering out of public packages.");
}

for (const path of walkFiles("packages", (file) => file.endsWith("package.json"))) {
  const manifest = readJson(path);
  if (manifest.name === "@viewrig/sinan") {
    fail(path, "@viewrig/sinan is out of scope for M0-M8.");
  }
  if (manifest.name === "@viewrig/debug-three") {
    fail(path, "@viewrig/debug-three is deferred for v0.2.");
  }
}

for (const path of walkFiles("packages/core/src", (file) => extname(file) === ".ts")) {
  const source = readFileSync(path, "utf8");
  for (const specifier of importedSpecifiers(source)) {
    const normalized = specifier.toLowerCase();
    if (forbiddenCoreImportNames.some((name) => normalized === name || normalized.startsWith(`${name}/`))) {
      fail(path, `core must not import host dependency "${specifier}".`);
    }
  }
}

for (const path of walkFiles("packages/adapter-three/src", (file) => extname(file) === ".ts")) {
  const source = readFileSync(path, "utf8");
  for (const specifier of importedSpecifiers(source)) {
    if (specifier.includes("packages/core") || specifier.includes("../core") || specifier.includes("..\\core")) {
      fail(path, `adapter-three must import the public @viewrig/core API, not "${specifier}".`);
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log("boundary check passed");
