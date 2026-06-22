import { createServer } from "node:http";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
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

for (const token of [
  "#view",
  "#mode",
  "#yaw",
  "#pitch",
  "#distance",
  "#shoulder",
  "#railT",
  "#railDriver",
  "#duration",
  "#damping",
  "#composer",
  "#debugOverlay",
  "#modeState",
  "#debugState",
  "#pose"
]) {
  if (!html.includes(token.slice(1)) && !js.includes(token)) {
    throw new Error(`Missing smoke token: ${token}`);
  }
}

for (const token of [
  "galleryModes",
  "applyThreeCameraState(",
  "evaluateThirdPersonGameplayPreset(",
  "evaluateOrbitShowcasePreset(",
  "evaluateFollowShowcasePreset(",
  "evaluateFirstPersonGameplayPreset(",
  "evaluateRailShotPreset(",
  "createPolylinePath(",
  "JSON.stringify(createPoseOutput",
  "new PerspectiveCamera(",
  "drawGalleryFrame("
]) {
  if (!js.includes(token)) {
    throw new Error(`Missing gallery integration token: ${token}`);
  }
}

for (const token of ["canvas", "input", "select", "output", "pre"]) {
  if (!css.includes(token)) {
    throw new Error(`Missing playground style token: ${token}`);
  }
}

if (!existsSync(resolve(dist, "index.html"))) {
  throw new Error("Missing playground dist/index.html. Run `pnpm --dir examples/three-orbit-playground build` before smoke.");
}

const buildInfoPath = resolve(dist, "viewrig-build.json");
if (!existsSync(buildInfoPath)) {
  throw new Error("Missing playground dist/viewrig-build.json. Run the playground build before smoke.");
}

const buildInfo = JSON.parse(readFileSync(buildInfoPath, "utf8"));
if (buildInfo.mode !== "vite" && buildInfo.mode !== "lightweight") {
  throw new Error(`Unknown playground build mode: ${JSON.stringify(buildInfo)}`);
}

if (buildInfo.mode === "vite") {
  const distHtml = readFileSync(resolve(dist, "index.html"), "utf8");
  const assetsDir = resolve(dist, "assets");
  const assets = existsSync(assetsDir) ? readdirSync(assetsDir) : [];

  if (distHtml.includes("./src/main.js")) {
    throw new Error("Vite build did not replace the source module entry.");
  }

  if (!assets.some((asset) => asset.endsWith(".js"))) {
    throw new Error("Vite build did not emit a JavaScript bundle asset.");
  }
}

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"]
]);

function contentType(filePath) {
  return mimeTypes.get(extname(filePath)) ?? "application/octet-stream";
}

function assertInRoot(filePath) {
  const child = relative(dist, filePath);
  return child === "" || (!child.startsWith("..") && !isAbsolute(child));
}

function startServer() {
  const server = createServer((request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(url.pathname);
      if (pathname === "/favicon.ico") {
        response.writeHead(204);
        response.end();
        return;
      }

      const rawPath = pathname === "/" ? "index.html" : pathname.slice(1);
      const filePath = resolve(dist, rawPath);

      if (!assertInRoot(filePath)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      if (!existsSync(filePath)) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, { "content-type": contentType(filePath) });
      response.end(readFileSync(filePath));
    } catch (error) {
      response.writeHead(500);
      response.end(error instanceof Error ? error.message : String(error));
    }
  });

  return new Promise((resolveServer, rejectServer) => {
    server.once("error", rejectServer);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address == null || typeof address === "string") {
        rejectServer(new Error("Could not resolve smoke server address."));
        return;
      }
      resolveServer({
        server,
        url: `http://127.0.0.1:${address.port}/`
      });
    });
  });
}

function closeServer(server) {
  return new Promise((resolveClose, rejectClose) => {
    server.close((error) => {
      if (error) {
        rejectClose(error);
        return;
      }
      resolveClose();
    });
  });
}

function assertClose(actual, expected, label) {
  if (Math.abs(actual - expected) > 0.02) {
    throw new Error(`${label} expected ${expected.toFixed(2)}, got ${actual.toFixed(2)}`);
  }
}

function assertPoseVector(vector, label) {
  for (const axis of ["x", "y", "z"]) {
    if (typeof vector?.[axis] !== "number" || !Number.isFinite(vector[axis])) {
      throw new Error(`${label}.${axis} must be a finite number: ${JSON.stringify(vector)}`);
    }
  }
}

function assertPoseShape(pose) {
  assertPoseVector(pose?.position, "pose.position");
  assertPoseVector(pose?.target, "pose.target");
}

async function setRange(page, selector, value) {
  await page.locator(selector).evaluate((input, nextValue) => {
    input.value = String(nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

async function setSelect(page, selector, value) {
  await page.locator(selector).selectOption(value);
}

async function readCanvasSignal(page) {
  return page.locator("#view").evaluate(async (canvas) => {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const rendered = canvas.toDataURL("image/png");
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    const blankRendered = blank.toDataURL("image/png");
    let colorHash = 0;

    for (let i = 0; i < rendered.length; i += 1) {
      colorHash = (colorHash + rendered.charCodeAt(i) * (i + 1)) % 1_000_000_007;
    }

    return {
      colorHash,
      dataUrlLength: rendered.length,
      height: canvas.height,
      paintedPixels: rendered === blankRendered ? 0 : canvas.width * canvas.height,
      width: canvas.width
    };
  });
}

async function launchBrowser() {
  try {
    return {
      browser: await chromium.launch(),
      label: "playwright-chromium"
    };
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("Executable doesn't exist")) {
      throw error;
    }

    const failures = [error.message];
    for (const channel of ["msedge", "chrome"]) {
      try {
        return {
          browser: await chromium.launch({ channel }),
          label: `system-${channel}`
        };
      } catch (channelError) {
        failures.push(channelError instanceof Error ? channelError.message : String(channelError));
      }
    }

    throw new Error(`${failures.join("\n")}\nInstall the local Playwright browser cache with: pnpm exec playwright install chromium`);
  }
}

async function assertMode(page, mode, expectedPresetId) {
  await setSelect(page, "#mode", mode);
  const pose = JSON.parse(await page.locator("#pose").textContent());
  assertPoseShape({
    position: pose.state.position,
    target: pose.target
  });

  if (pose.mode !== mode || pose.presetId !== expectedPresetId) {
    throw new Error(`Unexpected gallery mode identity: ${JSON.stringify({ mode, expectedPresetId, pose })}`);
  }

  if (pose.adapter !== "@viewrig/adapter-three" || pose.renderer !== "three-camera-canvas") {
    throw new Error(`Gallery did not use the shared Three adapter path: ${JSON.stringify(pose)}`);
  }

  const modeState = await page.locator("#modeState").textContent();
  if (!modeState?.includes(`mode:${mode}`) || !modeState.includes(`role:${pose.integration.role}`)) {
    throw new Error(`Mode state did not reflect ${mode}: ${modeState}`);
  }

  const matrixWorldPosition = pose.camera?.matrixWorldPosition;
  if (!Array.isArray(matrixWorldPosition) || matrixWorldPosition.length !== 3) {
    throw new Error(`Missing camera matrix world position: ${JSON.stringify(pose.camera)}`);
  }

  const signal = await readCanvasSignal(page);
  if (signal.paintedPixels < 1_000) {
    throw new Error(`Canvas became blank in ${mode}: ${JSON.stringify(signal)}`);
  }

  return pose;
}

function assertThirdPersonOffset(pose, expectedOffsetX, expectedOffsetY, expectedOffsetZ) {
  assertClose(pose.state.position.x - pose.target.x, expectedOffsetX, "thirdPerson offset x");
  assertClose(pose.state.position.y - pose.target.y, expectedOffsetY, "thirdPerson offset y");
  assertClose(pose.state.position.z - pose.target.z, expectedOffsetZ, "thirdPerson offset z");
}

function assertIntegrationRole(pose, role, sinanPoc) {
  if (pose.integration?.role !== role || pose.integration?.sinanPoc !== sinanPoc) {
    throw new Error(`Unexpected integration role: ${JSON.stringify(pose.integration)}`);
  }
}

function assertFollowOffset(pose, expectedOffsetX, expectedOffsetY, expectedOffsetZ) {
  assertClose(pose.state.position.x - pose.target.x, expectedOffsetX, "follow offset x");
  assertClose(pose.state.position.y - pose.target.y, expectedOffsetY, "follow offset y");
  assertClose(pose.state.position.z - pose.target.z, expectedOffsetZ, "follow offset z");
}

const { server, url } = await startServer();
let browser;

try {
  const launched = await launchBrowser();
  browser = launched.browser;
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });
  page.on("requestfailed", (request) => {
    consoleErrors.push(`Request failed: ${request.url()} ${request.failure()?.errorText ?? "unknown"}`);
  });
  page.on("response", (browserResponse) => {
    if (browserResponse.status() >= 400) {
      consoleErrors.push(`HTTP ${browserResponse.status()}: ${browserResponse.url()}`);
    }
  });

  const response = await page.goto(url, { waitUntil: "networkidle" });
  if (response == null || !response.ok()) {
    throw new Error(`Playground request failed: ${response?.status() ?? "no response"}`);
  }

  await page.locator("#view").waitFor();
  await page.waitForFunction(() => globalThis.__viewrigGalleryFrame > 0);
  const firstCanvasSignal = await readCanvasSignal(page);
  if (firstCanvasSignal.width !== 960 || firstCanvasSignal.height !== 540 || firstCanvasSignal.paintedPixels < 1_000) {
    throw new Error(`Canvas did not render a useful frame: ${JSON.stringify(firstCanvasSignal)}`);
  }
  const modeCanvasHashes = new Map();

  await setRange(page, "#yaw", -30);
  await setRange(page, "#pitch", 30);
  await setRange(page, "#distance", 7.2);
  await setRange(page, "#damping", 0.35);
  await setSelect(page, "#composer", "wide");

  const thirdPersonPose = await assertMode(page, "thirdPerson", "third-person-gameplay");
  modeCanvasHashes.set("thirdPerson", (await readCanvasSignal(page)).colorHash);
  assertIntegrationRole(thirdPersonPose, "gameplay-target-follow", "POC-2");
  assertThirdPersonOffset(thirdPersonPose, -3.12 + 0.45, 5.15, 5.4);
  assertClose(thirdPersonPose.target.x, -0.36, "thirdPersonPose.target.x");
  assertClose(thirdPersonPose.tuning.targetRailT, 0.35, "thirdPersonPose.tuning.targetRailT");
  assertClose(thirdPersonPose.tuning.dampingHalfLife, 0.35, "thirdPersonPose.tuning.dampingHalfLife");
  if (thirdPersonPose.tuning.composer !== "wide") {
    throw new Error(`Composer tuning did not update: ${JSON.stringify(thirdPersonPose.tuning)}`);
  }

  await setRange(page, "#shoulder", -1);
  const shoulderPose = await assertMode(page, "thirdPerson", "third-person-gameplay");
  assertClose(shoulderPose.tuning.shoulder, -1, "shoulderPose.tuning.shoulder");
  assertThirdPersonOffset(shoulderPose, -3.12 - 0.45, 5.05, 5.4);

  await setRange(page, "#railT", 0.8);
  const movingTargetPose = await assertMode(page, "thirdPerson", "third-person-gameplay");
  assertClose(movingTargetPose.target.x, 0.72, "movingTargetPose.target.x");
  assertClose(movingTargetPose.tuning.targetRailT, 0.8, "movingTargetPose.tuning.targetRailT");
  assertThirdPersonOffset(movingTargetPose, -3.12 - 0.45, 5.05, 5.4);

  await setRange(page, "#railT", 0.35);
  const orbitPose = await assertMode(page, "orbit", "orbit-showcase");
  modeCanvasHashes.set("orbit", (await readCanvasSignal(page)).colorHash);
  assertIntegrationRole(orbitPose, "object-viewer", "POC-2");
  assertClose(orbitPose.state.position.x, -3.12, "orbitPose.state.position.x");
  assertClose(orbitPose.state.position.y, 4.6, "orbitPose.state.position.y");
  assertClose(orbitPose.state.position.z, 5.4, "orbitPose.state.position.z");
  const followPose = await assertMode(page, "follow", "follow-showcase");
  modeCanvasHashes.set("follow", (await readCanvasSignal(page)).colorHash);
  assertIntegrationRole(followPose, "actor-follow", "POC-2");
  assertFollowOffset(followPose, -0.5, 2, -7.2);
  await setRange(page, "#railT", 0.65);
  const movingFollowPose = await assertMode(page, "follow", "follow-showcase");
  assertFollowOffset(movingFollowPose, -0.5, 2, -7.2);
  const followTargetDelta = Math.hypot(
    movingFollowPose.target.x - followPose.target.x,
    movingFollowPose.target.z - followPose.target.z
  );
  if (followTargetDelta < 0.2) {
    throw new Error(`Follow target did not move enough: ${JSON.stringify({ before: followPose.target, after: movingFollowPose.target })}`);
  }
  await setRange(page, "#pitch", 75);
  const firstPersonPose = await assertMode(page, "firstPerson", "first-person-gameplay");
  modeCanvasHashes.set("firstPerson", (await readCanvasSignal(page)).colorHash);
  assertIntegrationRole(firstPersonPose, "eye-anchor", "POC-2");
  assertClose(firstPersonPose.state.position.y - firstPersonPose.target.y, 1.65, "firstPerson eye offset");
  assertClose(firstPersonPose.tuning.eyeHeight, 1.65, "firstPerson eyeHeight tuning");
  if (firstPersonPose.integration.pitchClamp?.max !== 60 || firstPersonPose.integration.appliedPitch !== 60) {
    throw new Error(`First-person pitch clamp did not apply: ${JSON.stringify(firstPersonPose.integration)}`);
  }

  await setRange(page, "#pitch", 30);
  await setSelect(page, "#mode", "railShot");
  await setSelect(page, "#railDriver", "input");
  await setRange(page, "#railT", 0.72);
  const railPose = await assertMode(page, "railShot", "rail-shot");
  modeCanvasHashes.set("railShot", (await readCanvasSignal(page)).colorHash);
  assertIntegrationRole(railPose, "camera-shot", "POC-3");
  if (railPose.tuning.railT !== 0.72 || railPose.tuning.input !== 0.72) {
    throw new Error(`Rail tuning did not update: ${JSON.stringify(railPose.tuning)}`);
  }
  if (railPose.tuning.railDriver !== "input") {
    throw new Error(`Rail input driver did not persist: ${JSON.stringify(railPose.tuning)}`);
  }

  await setSelect(page, "#railDriver", "time");
  await setRange(page, "#duration", 6);
  await setRange(page, "#railT", 0.5);
  const timedRailPose = await assertMode(page, "railShot", "rail-shot");
  if (timedRailPose.tuning.driver !== "time" || timedRailPose.tuning.duration !== 6 || timedRailPose.tuning.railT !== 0.5) {
    throw new Error(`Rail time driver did not update: ${JSON.stringify(timedRailPose.tuning)}`);
  }
  if (new Set(modeCanvasHashes.values()).size < 4) {
    throw new Error(`Gallery mode canvas matrix is not distinct enough: ${JSON.stringify(Object.fromEntries(modeCanvasHashes))}`);
  }
  const railControls = await page.evaluate(() => ({
    durationDisabled: document.querySelector("#duration").disabled,
    railDriverDisabled: document.querySelector("#railDriver").disabled,
    shoulderDisabled: document.querySelector("#shoulder").disabled
  }));
  if (railControls.durationDisabled || railControls.railDriverDisabled || !railControls.shoulderDisabled) {
    throw new Error(`Rail control state is not polished: ${JSON.stringify(railControls)}`);
  }

  await page.locator("#debugOverlay").uncheck();
  const debugOff = await page.locator("#debugState").textContent();
  if (debugOff !== "debug:off live:railShot") {
    throw new Error(`Debug toggle did not update off state: ${debugOff}`);
  }
  const debugOffCanvasSignal = await readCanvasSignal(page);
  if (debugOffCanvasSignal.paintedPixels < 1_000) {
    throw new Error(`Canvas became blank with debug off: ${JSON.stringify(debugOffCanvasSignal)}`);
  }

  await page.locator("#debugOverlay").check();
  const debugOn = await page.locator("#debugState").textContent();
  if (debugOn !== "debug:on live:railShot preset:rail-shot adapter:three") {
    throw new Error(`Debug toggle did not update on state: ${debugOn}`);
  }

  const secondCanvasSignal = await readCanvasSignal(page);
  if (secondCanvasSignal.paintedPixels < 1_000) {
    throw new Error(`Canvas became blank after interaction: ${JSON.stringify(secondCanvasSignal)}`);
  }
  if (secondCanvasSignal.colorHash === debugOffCanvasSignal.colorHash) {
    throw new Error(`Debug overlay did not visibly change the canvas: ${JSON.stringify({ debugOffCanvasSignal, secondCanvasSignal })}`);
  }

  if (consoleErrors.length > 0) {
    throw new Error(`Browser console errors: ${consoleErrors.join(" | ")}`);
  }

  console.log(`three-orbit-playground browser smoke passed (${launched.label}, ${buildInfo.mode})`);
} finally {
  await browser?.close();
  await closeServer(server);
}
