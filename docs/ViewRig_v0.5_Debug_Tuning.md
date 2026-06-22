# ViewRig v0.5 Debug And Tuning

Date: 2026-06-22
Status: R6 debug/tuning helper notes

## 1. Goal

v0.5 presets expose debug and tuning information in a consistent shape so that
playgrounds, docs, smoke tests, and internal adapters can inspect camera state
without knowing each preset's private config.

The core still returns `CameraState` as the runtime contract. Debug and tuning
data is supporting metadata only.

## 2. Public Helpers

R6 adds these helpers to `@viewrig/core`:

- `getCameraPresetDebugSummary(source)`
- `findCameraPresetTuningControl(source, id)`
- `createCameraPresetTuningSnapshot(source)`
- `createCameraPresetDebugStatus(source)`

Each helper accepts either `CameraPresetEvaluation` or
`CameraPresetDebugSummary`.

## 3. Intended Use

```ts
const result = preset.evaluate({ time });
const distance = findCameraPresetTuningControl(result, "distance");
const snapshot = createCameraPresetTuningSnapshot(result);
const status = createCameraPresetDebugStatus(result);
```

The snapshot is useful for smoke tests and UI assertions:

```ts
expect(snapshot).toEqual({
  distance: 4,
  shoulder: 1
});
```

The status object is intentionally small. It contains preset identity, mode,
live camera id when available, tuning values, tags, and notes.

## 4. Boundary

Debug/tuning helpers must stay renderer-agnostic:

- no DOM;
- no React;
- no Three.js;
- no Sinan runtime or editor imports;
- no engine scene graph references;
- no persistence of runtime-only state into authoring JSON.

Renderer-specific overlays can consume `CameraPresetEvaluation.draw`, but they
must live outside `@viewrig/core`.

## 5. Validation

R6 is complete when:

- unit tests cover tuning lookup, snapshot, and status helpers;
- `pnpm test` passes;
- `pnpm docs:check` passes;
- `pnpm api:check` passes after the public API report is updated.
