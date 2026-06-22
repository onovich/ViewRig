# ViewRig v0.6 Orbit/Follow Integration

Date: 2026-06-22
Status: R5 orbit/follow gallery evidence

## 1. Goal

R5 strengthens the v0.6 example gallery paths for orbit and follow cameras. The
gallery now treats orbit as an object-viewer path and follow as an actor-follow
path while both continue to run through the same shared sequence:

```txt
example controls -> v0.5 preset -> CameraState -> @viewrig/adapter-three -> THREE.PerspectiveCamera -> canvas signal
```

## 2. Orbit Path

The orbit mode uses `evaluateOrbitShowcasePreset` and reports:

- gallery role: `object-viewer`;
- Sinan mapping note: `POC-2`;
- target position as the inspected object anchor;
- distance tuning from the shared distance control;
- adapter path: `@viewrig/adapter-three`.

This remains an example workflow. It does not add host object references to
`@viewrig/core` and does not make the example UI a source of runtime truth.

## 3. Follow Path

The follow mode uses `evaluateFollowShowcasePreset` with a moving actor target
driven by the shared target/rail slider. Browser smoke verifies that the target
moves while the camera offset remains stable relative to the target.

The mode reports:

- gallery role: `actor-follow`;
- Sinan mapping note: `POC-2`;
- target snapshot;
- offset tuning;
- adapter-applied Three camera matrix position.

## 4. Sinan Boundary

The POC-2 labels are evidence tags only. Sinan still owns InputFlow sampling,
world state, RuntimeCameraPose application, and any persisted authoring data.
ViewRig continues to expose engine-agnostic presets and `CameraState`; this
repository still does not add public `@viewrig/sinan` or `packages/sinan`.

## 5. R5 Validation

Required validation:

- `pnpm test`
- `pnpm test:browser`
- `pnpm boundary:check`

R5 status: PASS when all required commands pass and the commit is pushed.
