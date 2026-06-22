# ViewRig Recipes

Status: v0.6 R11 recipe index

These recipes show the intended developer path for ViewRig presets,
debug/tuning helpers, and the v0.6 example/adapter flow.

## Preset To Three Camera

Most recipes follow the same integration shape:

```ts
import { applyThreeCameraState } from "@viewrig/adapter-three";

const result = preset.evaluate({ time });
applyThreeCameraState(threeCamera, result.state);
```

`@viewrig/core` stays engine-agnostic. The Three adapter owns applying the
`CameraState` to a host camera, and the host still owns rendering and input.

## Recipes

- [Third-Person Gameplay](third-person-gameplay.md)
- [Orbit Showcase](orbit-showcase.md)
- [First-Person Gameplay](first-person-gameplay.md)
- [Rail Camera Shot](rail-camera-shot.md)
- [Debug Tuning](debug-tuning.md)
- [Sinan Internal Adapter](sinan-internal-adapter.md)

## Example Gallery

The v0.6 gallery lives in `examples/three-orbit-playground` and is validated by:

```powershell
pnpm --dir examples/three-orbit-playground build
pnpm test:browser
```

It covers third-person, orbit, follow, first-person, and rail/camera-shot modes.

## Boundary

Recipes are guidance, not release actions. They do not publish packages, change
package visibility, create GitHub releases, or introduce a public Sinan package.
