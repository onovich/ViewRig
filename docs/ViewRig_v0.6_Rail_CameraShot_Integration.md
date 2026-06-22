# ViewRig v0.6 Rail/CameraShot Integration

Date: 2026-06-22
Status: R7 rail/camera-shot gallery evidence

## 1. Goal

R7 strengthens the rail/camera-shot gallery path. The example now demonstrates
both input scrub and time-driver rail workflows while using the same shared
integration sequence:

```txt
example controls -> createRailShotPreset/evaluateRailShotPreset -> CameraState -> @viewrig/adapter-three -> THREE.PerspectiveCamera -> canvas signal
```

## 2. Gallery Behavior

The rail-shot mode exposes:

- `Target / Rail T` as the scrub value;
- `Rail Driver` as `input` or `time`;
- `Duration` for the time-driver path;
- rail path rendering in the canvas signal;
- debug/tuning output for driver, railT, input, and duration as applicable;
- adapter-applied Three camera matrix position in the pose JSON.

Browser smoke verifies both the input scrub and time-driver paths.

## 3. Sinan POC-3 Boundary

The gallery role is tagged as `camera-shot` and `POC-3` to show how the ViewRig
rail preset can support Sinan CameraShot exploration. This is not a schema or
runtime takeover:

- Sinan still owns CameraShot JSON, Director, Timeline, scrub UI, save/undo, and
  playback state.
- ViewRig receives example input or adapter-provided context and returns
  `CameraState`.
- Runtime pose and ViewRig damping/channel state are not written back to Sinan
  authoring data.
- This repository still does not add public `@viewrig/sinan` or `packages/sinan`.

## 4. R7 Validation

Required validation:

- `pnpm test`
- `pnpm test:browser`
- `pnpm boundary:check`

R7 status: PASS when all required commands pass and the commit is pushed.
