# First-Person Gameplay Recipe

Status: v0.5 R9 recipe

Use `createFirstPersonGameplayPreset` when a game needs an eye-anchor camera
with inherited yaw/pitch state and a compact tuning summary.

```ts
import {
  createFirstPersonGameplayPreset,
  createYawPitchChannel
} from "@viewrig/core";

const look = createYawPitchChannel("player-look", {
  minPitch: -89,
  maxPitch: 89
});

const firstPerson = createFirstPersonGameplayPreset({
  id: "player-eye",
  target: playerRootPosition,
  look,
  eyeOffset: [0, 1.65, 0]
});

const result = firstPerson.evaluate({ time });
adapter.apply(engineCamera, result.state);
```

## Switching

Share the same look channel with a third-person preset when switching between
first-person and third-person cameras. That keeps yaw/pitch continuity in the
same spirit as `matchThenBlend`.

## Tuning

`result.debug.tuning` includes `eyeHeight`. Host input and pointer lock remain
outside `@viewrig/core`.

## Boundary

The preset does not read raw input, own a player controller, or apply the final
pose to an engine camera.
