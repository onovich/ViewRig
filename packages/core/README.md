# @viewrig/core

Engine-agnostic camera pose solver and rig algorithms for games.

Status: private v0.6 integration-hardening package. The package is not published.

License: UNLICENSED until the project owner selects a public license.

## Preset Example

```ts
import {
  createShoulderChannel,
  createThirdPersonGameplayPreset,
  createYawPitchChannel
} from "@viewrig/core";
import { applyThreeCameraState } from "@viewrig/adapter-three";
import { PerspectiveCamera } from "three";

const look = createYawPitchChannel("player-look", {
  minPitch: -45,
  maxPitch: 75
});
const shoulder = createShoulderChannel("player-shoulder", {
  value: 1
});

const preset = createThirdPersonGameplayPreset({
  target: [0, 0, 0],
  look,
  shoulder,
  distance: 4
});

const result = preset.evaluate({ time: 1 });
const camera = new PerspectiveCamera();
applyThreeCameraState(camera, result.state);
```

Presets return `CameraPresetEvaluation`: the solved `CameraState`, a small
debug/tuning summary, and renderer-agnostic debug draw commands. Engine adapters
still own applying `CameraState` to real cameras.

The v0.6 example gallery and packed consumer smoke both follow this same path:
evaluate a preset in core, pass `result.state` to an adapter, then let the host
engine own rendering and input.

## Boundary

`@viewrig/core` has no dependency on Three.js, DOM, React, Sinan, Rapier,
Babylon, PlayCanvas, or host scene graph types.

See the workspace README for architecture, validation, recipes, and release
governance notes.
