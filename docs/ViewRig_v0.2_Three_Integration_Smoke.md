# ViewRig v0.2 Three Integration Smoke

Status: R6 real Three integration smoke.

## Scope

- `@viewrig/adapter-three` keeps the public API structural and thin: it accepts a Three-compatible camera and applies `CameraState`.
- The adapter package uses the real `three` package in tests to verify `PerspectiveCamera` and `OrthographicCamera` behavior.
- `@viewrig/core` remains engine agnostic. `pnpm boundary:check` rejects core imports of Three, React, Sinan, Rapier, Babylon, PlayCanvas, and related host dependencies.

## Commands

```powershell
pnpm --filter @viewrig/adapter-three test
pnpm boundary:check
pnpm test
```

The adapter package depends on `@viewrig/core` at runtime and uses `three` as a package-local development dependency for integration smoke coverage.
