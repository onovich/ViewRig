# Debug Tuning Recipe

Status: v0.5 R9 recipe

Use the preset debug helpers when a playground, smoke test, or internal adapter
needs a small stable view of preset state.

```ts
import {
  createCameraPresetDebugStatus,
  createCameraPresetTuningSnapshot,
  findCameraPresetTuningControl
} from "@viewrig/core";

const result = preset.evaluate({ time });

const distance = findCameraPresetTuningControl(result, "distance");
const tuning = createCameraPresetTuningSnapshot(result);
const status = createCameraPresetDebugStatus(result);
```

## Smoke-Test Pattern

```ts
expect(tuning).toEqual({
  distance: 4,
  shoulder: 1
});
expect(status.mode).toBe("thirdPerson");
```

## Rendering Debug Draw

`result.draw` contains renderer-agnostic commands. A Three, Canvas, Babylon, or
custom editor overlay can render those commands outside core.

## Boundary

Do not store `CameraPresetDebugStatus` in authoring JSON as source-of-truth. It
is runtime diagnostics only.
