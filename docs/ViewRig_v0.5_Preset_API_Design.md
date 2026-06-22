# ViewRig v0.5 Preset API Design

Date: 2026-06-22
Status: R2 architecture/API design

## 1. Decision

v0.5 introduces a small `presets` composition layer in `@viewrig/core`.

The first public surface is `CameraPreset`: a typed descriptor that wraps an
existing evaluator and returns a `CameraPresetEvaluation` containing:

- the solved `CameraState`;
- a `CameraPresetDebugSummary` for product UI, recipes, and smoke tests;
- optional renderer-agnostic `DebugDrawCommand` values.

This is a composition API, not a second rig framework.

## 2. Public Types

The R2 foundation adds:

- `CameraPresetMode`
- `CameraPresetTuningControl`
- `CameraPresetEvaluationContext`
- `CameraPresetDebugSummary`
- `CameraPresetDebugSummaryInput`
- `CameraPresetEvaluation`
- `CameraPreset<TConfig>`
- `CameraPresetDescriptor<TConfig>`
- `createCameraPresetDebugSummary`
- `createCameraPresetEvaluation`
- `defineCameraPreset`

Concrete presets in later rounds should use these foundations rather than
inventing new result objects.

## 3. Evaluation Contract

Preset evaluation is explicit and deterministic:

```ts
const preset = defineCameraPreset({
  id: "orbit-showcase",
  label: "Orbit Showcase",
  mode: "orbit",
  config,
  evaluate(config, context) {
    return evaluateOrbitRig(config, context);
  }
});

const result = preset.evaluate({ time: 1.25 });
```

The preset returns ViewRig data. It does not mutate an engine camera, read DOM
input, own a scene graph, or persist authoring data.

## 4. Debug And Tuning Model

`CameraPresetDebugSummary` intentionally contains low-stakes product metadata:

- preset id, label, and mode;
- live camera id when the solved `CameraState` provides it;
- tags and metadata merged from `CameraState.debug` and the preset descriptor;
- tuning controls with stable ids, labels, current values, and optional numeric
  range hints;
- notes for recipe and smoke-test diagnostics.

The model is renderer-agnostic. It can feed the browser playground, future docs,
or an internal editor adapter without importing UI libraries into core.

## 5. Boundary Rules

Presets may depend on:

- `CameraState`;
- rig evaluators;
- composer helpers;
- constraint helpers;
- channels;
- paths;
- core debug draw command types.

Presets must not depend on:

- Three.js, Babylon.js, PlayCanvas, DOM, React, Rapier, Sinan, or host scene
  graph types;
- playground UI state;
- npm publishing or release workflow state;
- Sinan CameraShot JSON, runtime stores, editor stores, or CameraShotPlayer
  internals.

## 6. Concrete Preset Plan

Later v0.5 rounds should add concrete presets in this order:

1. Third-person gameplay.
2. Orbit showcase and follow showcase.
3. First-person gameplay.
4. Rail/camera-shot.
5. Debug/tuning helpers shared by those presets.

Each concrete preset should:

- call an existing evaluator;
- add unit or golden trace coverage;
- expose meaningful tuning controls;
- include docs or recipes;
- stay compatible with API Extractor and packed-package consumer smoke.

## 7. R2 Validation

R2 is complete when:

- `pnpm test` passes;
- `pnpm api:check` passes after the public API report is updated;
- `pnpm docs:check` passes;
- `git diff --check` passes.
