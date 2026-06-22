# ViewRig v0.6 Consumer Smoke

Date: 2026-06-22
Status: R10 packed consumer smoke evidence

## 1. Goal

R10 strengthens `package:consumer-smoke` so the temporary external project
does not merely import ViewRig packages. It now proves the packed consumer can
combine a v0.5 core preset with `@viewrig/adapter-three` and apply the
preset-generated `CameraState` to a real Three camera.

## 2. Coverage

The generated consumer project installs local tarballs for:

- `@viewrig/core`;
- `@viewrig/testing`;
- `@viewrig/adapter-three`;
- `three` as the consumer-side engine dependency.

The smoke verifies:

- public package imports resolve from packed artifacts;
- `@viewrig/testing` consumes the packed core package;
- a fixed pose applies to `PerspectiveCamera`;
- a third-person gameplay preset evaluates to `CameraState`;
- that preset-generated state applies through `applyThreeCameraState`;
- camera position, lens, clip planes, and matrix-world position match the preset
  output;
- orbit, follow, first-person, and rail-shot preset imports still execute.

## 3. Release Boundary

This remains a local tarball smoke. It does not publish to npm, run Changesets
version or publish, change package visibility, create a tag/release, or deploy
TypeDoc publicly.

## 4. R10 Validation

Required validation:

- `pnpm package:consumer-smoke`
- `pnpm package:dry-run`
- `pnpm release:dry-run`

R10 status: PASS when required validation passes and the commit is pushed.
