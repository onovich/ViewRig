# Third-Person Gameplay Recipe

Status: v0.5 R3 draft

Use `createThirdPersonGameplayPreset` when a game needs a practical player
camera with a target, inherited yaw/pitch input, shoulder offset, debug metadata,
and tuning controls.

```ts
import {
  createShoulderChannel,
  createThirdPersonGameplayPreset,
  createYawPitchChannel
} from "@viewrig/core";
import { applyThreeCameraState } from "@viewrig/adapter-three";

const look = createYawPitchChannel("player-look", {
  minPitch: -45,
  maxPitch: 75
});
const shoulder = createShoulderChannel("player-shoulder", {
  value: 1
});

const camera = createThirdPersonGameplayPreset({
  id: "player-camera",
  target: playerTargetPosition,
  look,
  shoulder,
  distance: 4,
  pivotOffset: [0, 1.5, 0],
  shoulderOffset: [0.45, 0.05, 0]
});

const result = camera.evaluate({ time: worldTime });
applyThreeCameraState(threeCamera, result.state);
```

## Notes

- Raw DOM, pointer lock, gamepad, and rebinding stay outside `@viewrig/core`.
- The preset reuses `evaluateThirdPersonRig`; it does not introduce a new solver.
- `result.debug.tuning` exposes `distance` and `shoulder` controls for
  playgrounds or tools.
- `result.draw` contains renderer-agnostic debug draw commands. Adapters decide
  whether and how to render them.
- `CameraState` remains the runtime output. Engine adapters apply it to real
  cameras.
- The v0.6 gallery smoke verifies target movement, shoulder tuning, distance
  tuning, and adapter application for this preset.

## Defaults

| Setting | Default |
| --- | --- |
| `id` | `third-person-gameplay` |
| `label` | `Third Person Gameplay` |
| `distance` | `4` |
| `pivotOffset` | `[0, 1.5, 0]` |
| `shoulder` | `1` |
| `shoulderOffset` | `[0.45, 0.05, 0]` |

## Boundary

This recipe does not publish packages, change package visibility, create a
Sinan adapter, or move engine/DOM input into core.
