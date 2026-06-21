import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

function writeBuildInfo(mode, detail = {}) {
  writeFileSync(
    resolve(dist, "viewrig-build.json"),
    `${JSON.stringify({
      mode,
      tool: mode === "vite" ? "vite" : "lightweight-copy",
      ...detail
    }, null, 2)}\n`
  );
}

function lightweightBuild(reason) {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  cpSync(resolve(root, "index.html"), resolve(dist, "index.html"));
  cpSync(resolve(root, "src"), resolve(dist, "src"), { recursive: true });
  writeBuildInfo("lightweight", { reason });
  console.log(`three-orbit-playground lightweight build passed (${reason})`);
}

if (process.env.VIEWRIG_PLAYGROUND_LIGHTWEIGHT_BUILD === "1") {
  lightweightBuild("env-fallback");
} else {
  try {
    const { build } = await import("vite");
    await build({
      root,
      logLevel: "warn",
      build: {
        emptyOutDir: true,
        outDir: "dist",
        sourcemap: false
      }
    });
    writeBuildInfo("vite");
    console.log("three-orbit-playground vite build passed");
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }

    lightweightBuild("vite-unavailable");
  }
}
