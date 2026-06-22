# Rail Camera Shot Recipe

Status: v0.5 R5 draft

Use `createRailShotPreset` when a CameraShot-style preview or playback path
needs deterministic camera samples from a ViewRig `CameraPath`.

```ts
import { createPolylinePath, createRailShotPreset } from "@viewrig/core";

const path = createPolylinePath({
  points: [
    [0, 1.5, 0],
    [0, 1.5, -4],
    [4, 1.5, -4]
  ]
});

const shot = createRailShotPreset({
  id: "intro-shot",
  path,
  driver: {
    type: "time",
    duration: 4
  }
});

const preview = shot.evaluate({ time: scrubTimeSeconds });
adapter.apply(engineCamera, preview.state);
```

## CameraShot Rules

- Sinan or another host editor owns CameraShot JSON, timeline tracks, preview,
  scrub, restore, save, undo, and validation behavior.
- ViewRig owns deterministic path sampling and returns `CameraState`.
- A scrub call should pass explicit `time`; it should not rely on previous
  gameplay frames.
- `CameraPresetEvaluation.debug.metadata` may include `railT`, `railDistance`,
  `driver`, and `pathLength` for diagnostics.
- Runtime pose, damping cache, channel cache, and host scene objects must not be
  serialized into authoring JSON.

## Driver Choices

| Driver | Use case |
| --- | --- |
| `fixed` | still shot or checkpoint preview |
| `time` | deterministic timeline playback/scrub |
| `input` | user-controlled rail camera |
| `targetProjection` | follow a target by nearest path point |

## Boundary

This recipe does not create a public Sinan adapter, does not replace
CameraShotPlayer or DirectorCameraSystem, and does not publish packages.
