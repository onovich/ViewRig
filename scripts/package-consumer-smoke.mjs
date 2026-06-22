import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

const isDryRun = process.argv.includes("--dry-run");
const keepTemp = process.argv.includes("--keep-temp");

const packages = [
  { dir: "packages/core", name: "@viewrig/core" },
  { dir: "packages/testing", name: "@viewrig/testing" },
  { dir: "packages/adapter-three", name: "@viewrig/adapter-three" }
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function quoteWindowsCommandArg(arg) {
  if (!/[\s&()^|<>"]/u.test(arg)) {
    return arg;
  }

  return `"${arg.replaceAll('"', '""')}"`;
}

function runPnpm(args, cwd) {
  const npmExecPath = process.env.npm_execpath;
  const invocation =
    npmExecPath !== undefined && (npmExecPath.endsWith(".cjs") || npmExecPath.endsWith(".js"))
      ? { command: process.execPath, args: [npmExecPath, ...args], shell: false }
      : process.platform === "win32"
        ? {
            command: process.env.ComSpec ?? "cmd.exe",
            args: ["/d", "/s", "/c", ["pnpm", ...args].map(quoteWindowsCommandArg).join(" ")],
            shell: false
          }
        : { command: "pnpm", args, shell: false };

  const result = spawnSync(invocation.command, invocation.args, {
    cwd,
    encoding: "utf8",
    shell: invocation.shell
  });

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.error !== undefined) {
    throw new Error(`pnpm ${args.join(" ")} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`pnpm ${args.join(" ")} failed:\n${output}`);
  }

  return output;
}

function runNode(args, cwd) {
  const result = spawnSync(process.execPath, args, {
    cwd,
    encoding: "utf8"
  });

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.error !== undefined) {
    throw new Error(`node ${args.join(" ")} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`node ${args.join(" ")} failed:\n${output}`);
  }

  return output;
}

function assertBuiltPackage(workspacePackage) {
  const packageJsonPath = resolve(workspacePackage.dir, "package.json");
  const distIndexPath = resolve(workspacePackage.dir, "dist/index.js");
  assert(existsSync(packageJsonPath), `Missing ${workspacePackage.dir}/package.json`);
  assert(existsSync(distIndexPath), `Missing ${workspacePackage.dir}/dist/index.js. Run pnpm build first.`);

  const manifest = readJson(packageJsonPath);
  assert(manifest.name === workspacePackage.name, `Expected ${workspacePackage.name}, got ${manifest.name}`);
  assert(manifest.exports?.["."]?.import === "./dist/index.js", `${workspacePackage.name} must export dist/index.js`);
  return manifest;
}

function packPackage(workspacePackage, tarballDir) {
  const before = new Set(readdirSync(tarballDir));
  runPnpm(["--dir", workspacePackage.dir, "pack", "--pack-destination", tarballDir], process.cwd());
  const created = readdirSync(tarballDir).filter((name) => !before.has(name) && name.endsWith(".tgz"));
  assert(created.length === 1, `${workspacePackage.name} should create one tarball, got ${created.length}`);
  return join(tarballDir, created[0]);
}

function packageSpec(tarballPath) {
  return `file:../tarballs/${basename(tarballPath)}`;
}

function writeConsumerProject(consumerDir, tarballs, threeVersion) {
  mkdirSync(consumerDir, { recursive: true });
  const viewRigDependencySpecs = {
    "@viewrig/core": packageSpec(tarballs["@viewrig/core"]),
    "@viewrig/testing": packageSpec(tarballs["@viewrig/testing"]),
    "@viewrig/adapter-three": packageSpec(tarballs["@viewrig/adapter-three"])
  };

  writeFileSync(
    join(consumerDir, "package.json"),
    `${JSON.stringify(
      {
        name: "viewrig-consumer-smoke",
        version: "0.0.0",
        private: true,
        type: "module",
        packageManager: "pnpm@11.8.0",
        dependencies: {
          ...viewRigDependencySpecs,
          three: threeVersion
        }
      },
      null,
      2
    )}\n`
  );

  writeFileSync(
    join(consumerDir, "pnpm-workspace.yaml"),
    `packages:
  - .
overrides:
  '@viewrig/core': ${viewRigDependencySpecs["@viewrig/core"]}
  '@viewrig/testing': ${viewRigDependencySpecs["@viewrig/testing"]}
  '@viewrig/adapter-three': ${viewRigDependencySpecs["@viewrig/adapter-three"]}
`
  );

  writeFileSync(
    join(consumerDir, "smoke.mjs"),
    `import { strict as assert } from "node:assert";
import { VIEWRIG_CORE_PACKAGE, evaluateFixedPose } from "@viewrig/core";
import { describeTestingRuntime } from "@viewrig/testing";
import { applyThreeCameraState } from "@viewrig/adapter-three";
import { PerspectiveCamera } from "three";

assert.equal(VIEWRIG_CORE_PACKAGE, "@viewrig/core");
assert.equal(describeTestingRuntime(), "@viewrig/testing uses @viewrig/core");

const camera = new PerspectiveCamera(50, 16 / 9, 0.1, 1000);
const state = evaluateFixedPose({
  position: [1, 2, 3],
  rotation: [0, 0.3826834323650898, 0, 0.9238795325112867],
  lens: { projection: "perspective", fov: 70, near: 0.2, far: 500 }
});

applyThreeCameraState(camera, state);

assert.deepEqual(camera.position.toArray(), [1, 2, 3]);
assert.deepEqual(camera.quaternion.toArray(), [0, 0.3826834323650898, 0, 0.9238795325112867]);
assert.equal(camera.fov, 70);
assert.equal(camera.near, 0.2);
assert.equal(camera.far, 500);

console.log("consumer smoke passed");
`
  );
}

const manifests = packages.map(assertBuiltPackage);
const adapterManifest = manifests.find((manifest) => manifest.name === "@viewrig/adapter-three");
const threeVersion = adapterManifest?.devDependencies?.three;
assert(typeof threeVersion === "string" && threeVersion.length > 0, "@viewrig/adapter-three must declare a three devDependency");

if (isDryRun) {
  console.log("consumer smoke dry-run passed");
  console.log(`temp prefix: ${join(tmpdir(), "viewrig-consumer-smoke-")}`);
  for (const workspacePackage of packages) {
    console.log(`would pack ${workspacePackage.name} from ${workspacePackage.dir}`);
  }
  console.log(`would install three@${threeVersion}`);
  process.exit(0);
}

const tempRoot = mkdtempSync(join(tmpdir(), "viewrig-consumer-smoke-"));
const tarballDir = join(tempRoot, "tarballs");
const consumerDir = join(tempRoot, "consumer");

try {
  mkdirSync(tarballDir, { recursive: true });
  const tarballs = {};
  for (const workspacePackage of packages) {
    tarballs[workspacePackage.name] = packPackage(workspacePackage, tarballDir);
  }

  writeConsumerProject(consumerDir, tarballs, threeVersion);
  runPnpm(["install", "--ignore-scripts"], consumerDir);
  const output = runNode(["smoke.mjs"], consumerDir);
  process.stdout.write(output);
  console.log(`consumer smoke temp: ${tempRoot}`);
} finally {
  if (keepTemp) {
    console.log(`kept consumer smoke temp: ${tempRoot}`);
  } else {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}
