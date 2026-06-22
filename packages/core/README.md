# @viewrig/core

Engine-agnostic camera pose solver and rig algorithms for games.

Status: private v0.5 product usability package. The package is not published.

License: UNLICENSED until the project owner selects a public license.

## Preset Example

```ts
import {
  createShoulderChannel,
  createThirdPersonGameplayPreset,
  createYawPitchChannel
} from "@viewrig/core";

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
adapter.apply(engineCamera, result.state);
```

Presets return `CameraPresetEvaluation`: the solved `CameraState`, a small
debug/tuning summary, and renderer-agnostic debug draw commands. Engine adapters
still own applying `CameraState` to real cameras.

## Boundary

`@viewrig/core` has no dependency on Three.js, DOM, React, Sinan, Rapier,
Babylon, PlayCanvas, or host scene graph types.

See the workspace README for architecture, validation, recipes, and release
governance notes.
