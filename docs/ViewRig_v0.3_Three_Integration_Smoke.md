# ViewRig v0.3 Three Integration Smoke

Status: R9 real Three adapter smoke hardening.

## Scope

`@viewrig/adapter-three` remains a thin structural adapter. It applies `CameraState` to a Three-compatible camera and does not own solver, rig, blend, composer, or constraint semantics.

The package-local integration smoke uses the real `three` package to cover:

- `PerspectiveCamera` position, quaternion, fov, near, far, and projection updates
- `OrthographicCamera` position, quaternion, zoom, near, far, and projection updates
- missing optional lens fields, where existing Three camera clip planes must be preserved
- projection matrix mutation after applying perspective or orthographic lens changes

## Commands

```powershell
pnpm --filter @viewrig/adapter-three test
pnpm boundary:check
pnpm test
```

CI runs `pnpm --filter @viewrig/adapter-three test` explicitly in addition to the root unit test pass so adapter smoke failures are visible as their own workflow step.

## Boundary

`@viewrig/core` remains engine agnostic. Real Three imports are limited to package-local adapter tests, the adapter package development dependency, and the playground.
