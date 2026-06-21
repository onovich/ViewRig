import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const packages = [
  { dir: "packages/core", name: "@viewrig/core" },
  { dir: "packages/testing", name: "@viewrig/testing" },
  { dir: "packages/adapter-three", name: "@viewrig/adapter-three" }
];

const expectedFiles = [
  "dist/index.d.ts",
  "dist/index.js",
  "package.json"
];

const forbiddenOutputTokens = [
  ".test.",
  "node_modules/",
  "src/",
  "tsconfig.tsbuildinfo"
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertPackageManifest(manifest, expectedName) {
  assert(manifest.name === expectedName, `Expected package name ${expectedName}, got ${manifest.name}`);
  assert(manifest.private === true, `${expectedName} must remain private for v0.2 dry-runs`);
  assert(manifest.type === "module", `${expectedName} must remain ESM-first`);
  assert(manifest.sideEffects === false, `${expectedName} must remain side-effect free`);
  assert(manifest.exports?.["."]?.types === "./dist/index.d.ts", `${expectedName} must export dist/index.d.ts`);
  assert(manifest.exports?.["."]?.import === "./dist/index.js", `${expectedName} must export dist/index.js`);

  const files = manifest.files ?? [];
  for (const file of [
    "dist/**/*.d.ts",
    "dist/**/*.d.ts.map",
    "dist/**/*.js",
    "dist/**/*.js.map"
  ]) {
    assert(files.includes(file), `${expectedName} files must include ${file}`);
  }
}

function pnpmInvocation(packageDir) {
  const args = ["--dir", packageDir, "pack", "--dry-run"];
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath !== undefined && (npmExecPath.endsWith(".cjs") || npmExecPath.endsWith(".js"))) {
    return {
      command: process.execPath,
      args: [npmExecPath, ...args]
    };
  }

  if (process.platform === "win32") {
    return {
      command: process.env.ComSpec ?? "cmd.exe",
      args: ["/d", "/s", "/c", `pnpm --dir ${packageDir} pack --dry-run`]
    };
  }

  return {
    command: "pnpm",
    args
  };
}

function runPackDryRun(packageDir, packageName) {
  const invocation = pnpmInvocation(packageDir);
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.error !== undefined) {
    throw new Error(`${packageName} pack dry-run could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${packageName} pack dry-run failed:\n${output}`);
  }

  for (const file of expectedFiles) {
    assert(output.includes(file), `${packageName} dry-run output is missing ${file}`);
  }

  for (const token of forbiddenOutputTokens) {
    assert(!output.includes(token), `${packageName} dry-run output includes forbidden token ${token}`);
  }
}

for (const workspacePackage of packages) {
  const packageJsonPath = resolve(workspacePackage.dir, "package.json");
  const distIndex = resolve(workspacePackage.dir, "dist/index.js");

  assert(existsSync(packageJsonPath), `Missing ${workspacePackage.dir}/package.json`);
  assert(existsSync(distIndex), `Missing ${workspacePackage.dir}/dist/index.js. Run pnpm build before package dry-run.`);

  const manifest = readJson(packageJsonPath);
  assertPackageManifest(manifest, workspacePackage.name);
  runPackDryRun(workspacePackage.dir, workspacePackage.name);
  console.log(`${workspacePackage.name} package dry-run passed`);
}
