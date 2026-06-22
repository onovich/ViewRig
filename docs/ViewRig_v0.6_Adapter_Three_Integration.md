# ViewRig v0.6 Adapter-Three Integration

Date: 2026-06-22
Status: R2 adapter integration evidence

## 1. Goal

R2 strengthens the evidence that `@viewrig/adapter-three` applies ViewRig
`CameraState` output to real Three cameras. The adapter remains a thin host
writer: it does not evaluate presets, choose rigs, read input, raycast, compose
shots, or own gameplay state.

## 2. Apply Contract

`applyThreeCameraState(camera, state)` writes:

- `state.position` into `camera.position`;
- `state.rotation` into `camera.quaternion`;
- perspective `state.lens.fov` into `camera.fov`;
- orthographic `state.lens.orthographicSize` into `camera.zoom`;
- optional `state.lens.near` and `state.lens.far` into camera clip planes;
- `updateMatrixWorld(true)` when the host camera exposes it;
- `updateProjectionMatrix()` when the host camera exposes it.

The public adapter contract is still structural. A minimal fake camera only
needs position, quaternion, lens fields, and optional projection update support.
Real Three cameras provide the matrix-world method, so integration tests verify
the immediate transform matrix refresh without making `@viewrig/core` aware of
Three.

## 3. Real Three Evidence

The R2 test coverage now includes:

- fixed perspective camera state applied to `PerspectiveCamera`;
- fixed orthographic camera state applied to `OrthographicCamera`;
- missing optional near/far fields preserving existing clip planes;
- projection matrix mutation after lens changes;
- matrix-world refresh after transform application;
- preset-generated third-person `CameraState` applied to a real
  `PerspectiveCamera`;
- look direction parity between the preset state quaternion and the real Three
  camera quaternion.

## 4. Boundary Confirmation

Adapter-three remains outside core:

- `@viewrig/core` imports no Three, DOM, React, Sinan, Rapier, Babylon,
  PlayCanvas, or host scene graph objects.
- `@viewrig/adapter-three` consumes only `CameraState` plus structural camera
  methods.
- Presets continue to live in core as engine-agnostic composition helpers.
- Example and smoke work can use real Three cameras, but adapter-three does not
  duplicate rig, composer, constraint, channel, or preset semantics.

## 5. R2 Validation

Required validation for this round:

- `pnpm --filter @viewrig/adapter-three test`
- `pnpm boundary:check`
- `git diff --check`

R2 status: PASS when all required commands pass and the commit is pushed.
