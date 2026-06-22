# Orbit Showcase Recipe

Status: v0.5 R9 recipe

Use `createOrbitShowcasePreset` when a game or editor needs to inspect an actor,
object, boss, or selected scene anchor with normalized look and distance input.

```ts
import {
  createOrbitShowcasePreset,
  createYawPitchChannel,
  createZoomChannel
} from "@viewrig/core";

const look = createYawPitchChannel("showcase-look", {
  yaw: 45,
  pitch: 20,
  minPitch: -45,
  maxPitch: 75
});
const distance = createZoomChannel("showcase-distance", {
  value: 5,
  min: 2,
  max: 10
});

const orbit = createOrbitShowcasePreset({
  id: "showcase-camera",
  target: selectedAnchorPosition,
  look,
  distance,
  pivotOffset: [0, 1, 0]
});

const result = orbit.evaluate({ time });
adapter.apply(engineCamera, result.state);
```

## Tuning

`result.debug.tuning` includes `distance`. A host UI can expose that control as
wheel zoom, trigger input, or an editor slider.

## Sinan POC-2 Mapping

For Sinan POC-2, Sinan owns InputFlow and passes already-normalized yaw, pitch,
and zoom/distance values into the internal adapter. ViewRig returns
`CameraState`; Sinan maps and applies the runtime camera pose.

## Boundary

Do not pass DOM events, Three cameras, Sinan stores, or editor object references
into the preset config.
