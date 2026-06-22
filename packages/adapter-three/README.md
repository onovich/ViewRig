# @viewrig/adapter-three

Structural Three-compatible camera adapter for ViewRig CameraState.

Status: private v0.6 integration-hardening package. The package is not published.

License: UNLICENSED until the project owner selects a public license.

The public adapter contract remains structural. Three.js is used by package-local integration tests and examples.

## Minimal Use

```ts
import { evaluateThirdPersonGameplayPreset } from "@viewrig/core";
import { applyThreeCameraState } from "@viewrig/adapter-three";
import { PerspectiveCamera } from "three";

const camera = new PerspectiveCamera();
const result = evaluateThirdPersonGameplayPreset({
  target: [0, 0, 0],
  look: { yaw: 30, pitch: 15 },
  distance: 4,
  lens: { projection: "perspective", fov: 60, near: 0.1, far: 120 }
});

applyThreeCameraState(camera, result.state);
```

The adapter writes position, quaternion, lens, clip planes, and available Three
matrix/projection updates. It does not evaluate gameplay presets or own input,
constraints, composers, or host scene state.

See the workspace README for architecture, validation, and release governance notes.
