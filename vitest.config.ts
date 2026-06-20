import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@viewrig/core": resolve(rootDir, "packages/core/src/index.ts"),
      "@viewrig/testing": resolve(rootDir, "packages/testing/src/index.ts")
    }
  },
  test: {
    include: ["packages/*/src/**/*.test.ts"]
  }
});
