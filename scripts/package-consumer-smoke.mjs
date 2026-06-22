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
import {
  VIEWRIG_CORE_PACKAGE,
  createCameraPresetTuningSnapshot,
  createFirstPersonGameplayPreset,
  createFollowShowcasePreset,
  createOrbitShowcasePreset,
  createPolylinePath,
  createRailShotPreset,
  createShoulderChannel,
  createThirdPersonGameplayPreset,
  createYawPitchChannel,
  createZoomChannel,
  evaluateFixedPose
} from "@viewrig/core";
import { describeTestingRuntime } from "@viewrig/testing";
import { applyThreeCameraState } from "@viewrig/adapter-three";
import { PerspectiveCamera } from "three";

assert.equal(VIEWRIG_CORE_PACKAGE, "@viewrig/core");
assert.equal(describeTestingRuntime(), "@viewrig/testing uses @viewrig/core");

function assertClose(actual, expected, label) {
  assert.equal(Number.isFinite(actual), true, label);
  assert.equal(Math.abs(actual - expected) < 0.000001, true, label);
}

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

const look = createYawPitchChannel("look", { yaw: 0, pitch: 0 });
const shoulder = createShoulderChannel("shoulder", { value: 1 });
const thirdPerson = createThirdPersonGameplayPreset({
  target: [0, 0, 0],
  look,
  shoulder,
  distance: 4,
  lens: { projection: "perspective", fov: 62, near: 0.3, far: 250 }
}).evaluate({ time: 1 });

assert.deepEqual(thirdPerson.state.position, { x: 0.45, y: 1.55, z: 4 });
assert.equal(thirdPerson.debug.mode, "thirdPerson");
assert.deepEqual(createCameraPresetTuningSnapshot(thirdPerson), {
  distance: 4,
  shoulder: 1
});

applyThreeCameraState(camera, thirdPerson.state);
assertClose(camera.position.x, thirdPerson.state.position.x, "third-person camera x");
assertClose(camera.position.y, thirdPerson.state.position.y, "third-person camera y");
assertClose(camera.position.z, thirdPerson.state.position.z, "third-person camera z");
assert.equal(camera.fov, 62);
assert.equal(camera.near, 0.3);
assert.equal(camera.far, 250);
assertClose(camera.matrixWorld.elements[12], thirdPerson.state.position.x, "third-person matrix x");
assertClose(camera.matrixWorld.elements[13], thirdPerson.state.position.y, "third-person matrix y");
assertClose(camera.matrixWorld.elements[14], thirdPerson.state.position.z, "third-person matrix z");

look.set({ yaw: 90, pitch: 0 });
const orbitDistance = createZoomChannel("orbit-distance", { value: 6, min: 2, max: 10 });
const orbit = createOrbitShowcasePreset({
  target: [0, 0, 0],
  look,
  distance: orbitDistance
}).evaluate({ time: 2 });

assertClose(orbit.state.position.x, 6, "orbit x");
assert.equal(orbit.state.position.y, 1);
assertClose(orbit.state.position.z, 0, "orbit z");
assert.deepEqual(createCameraPresetTuningSnapshot(orbit), { distance: 6 });

const follow = createFollowShowcasePreset({
  target: { position: [2, 0, -1] },
  offset: [0, 2, -6]
}).evaluate({ time: 3 });

assert.deepEqual(follow.state.position, { x: 2, y: 2, z: -7 });
assert.equal(follow.debug.mode, "follow");

const firstPerson = createFirstPersonGameplayPreset({
  target: [1, 0, 2],
  look: { yaw: 0, pitch: 0 },
  eyeOffset: [0, 1.8, 0]
}).evaluate({ time: 4 });

assert.deepEqual(firstPerson.state.position, { x: 1, y: 1.8, z: 2 });
assert.deepEqual(createCameraPresetTuningSnapshot(firstPerson), { eyeHeight: 1.8 });

const path = createPolylinePath({
  points: [
    [0, 0, 0],
    [0, 0, -4],
    [4, 0, -4]
  ]
});
const railShot = createRailShotPreset({
  path,
  driver: { type: "time", duration: 4 }
}).evaluate({ time: 2 });

assert.deepEqual(railShot.state.position, { x: 0, y: 0, z: -4 });
assert.equal(railShot.debug.mode, "railShot");
assert.equal(railShot.debug.metadata.driver, "time");
assert.equal(createCameraPresetTuningSnapshot(railShot).duration, 4);

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
