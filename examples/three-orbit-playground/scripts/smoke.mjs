import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
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

for (const token of ["#view", "#yaw", "#pitch", "#distance", "#debugOverlay", "#debugState", "#pose"]) {
  if (!html.includes(token.slice(1)) && !js.includes(token)) {
    throw new Error(`Missing smoke token: ${token}`);
  }
}

for (const token of ["addEventListener(\"input\", render)", "JSON.stringify(pose", "orbitPose(", "drawDebugOverlay(", "ctx.setLineDash"]) {
  if (!js.includes(token)) {
    throw new Error(`Missing interactive pose token: ${token}`);
  }
}

for (const token of ["canvas", "input", "output", "pre"]) {
  if (!css.includes(token)) {
    throw new Error(`Missing playground style token: ${token}`);
  }
}

if (!existsSync(resolve(dist, "index.html"))) {
  throw new Error("Missing playground dist/index.html. Run `pnpm --dir examples/three-orbit-playground build` before smoke.");
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

async function setRange(page, selector, value) {
  await page.locator(selector).evaluate((input, nextValue) => {
    input.value = String(nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

async function readCanvasSignal(page) {
  return page.locator("#view").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let paintedPixels = 0;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) {
        paintedPixels += 1;
      }
    }

    return {
      height: canvas.height,
      paintedPixels,
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

  const response = await page.goto(url, { waitUntil: "networkidle" });
  if (response == null || !response.ok()) {
    throw new Error(`Playground request failed: ${response?.status() ?? "no response"}`);
  }

  await page.locator("#view").waitFor();
  const firstCanvasSignal = await readCanvasSignal(page);
  if (firstCanvasSignal.width !== 960 || firstCanvasSignal.height !== 540 || firstCanvasSignal.paintedPixels < 1_000) {
    throw new Error(`Canvas did not render a useful frame: ${JSON.stringify(firstCanvasSignal)}`);
  }

  await setRange(page, "#yaw", -30);
  await setRange(page, "#pitch", 30);
  await setRange(page, "#distance", 7.2);

  const pose = JSON.parse(await page.locator("#pose").textContent());
  assertClose(pose.position.x, -3.12, "pose.position.x");
  assertClose(pose.position.y, 3.6, "pose.position.y");
  assertClose(pose.position.z, 5.4, "pose.position.z");

  await page.locator("#debugOverlay").uncheck();
  const debugOff = await page.locator("#debugState").textContent();
  if (debugOff !== "debug:off") {
    throw new Error(`Debug toggle did not update off state: ${debugOff}`);
  }

  await page.locator("#debugOverlay").check();
  const debugOn = await page.locator("#debugState").textContent();
  if (debugOn !== "debug:on live:orbit") {
    throw new Error(`Debug toggle did not update on state: ${debugOn}`);
  }

  const secondCanvasSignal = await readCanvasSignal(page);
  if (secondCanvasSignal.paintedPixels < 1_000) {
    throw new Error(`Canvas became blank after interaction: ${JSON.stringify(secondCanvasSignal)}`);
  }

  if (consoleErrors.length > 0) {
    throw new Error(`Browser console errors: ${consoleErrors.join(" | ")}`);
  }

  console.log(`three-orbit-playground browser smoke passed (${launched.label})`);
} finally {
  await browser?.close();
  await closeServer(server);
}
