# Sinan Internal Adapter Recipe

Status: v0.6 R11 recipe

This recipe describes the ViewRig side of a Sinan internal adapter. It does not
create a public `@viewrig/sinan` package.

## Follow/Orbit Flow

```txt
Sinan InputFlow snapshot
  + Sinan world target snapshot
  -> internal adapter maps to ViewRig preset config
  -> ViewRig preset returns CameraPresetEvaluation
  -> internal adapter maps CameraState to RuntimeCameraPose
  -> Sinan runtime applies the pose
```

## CameraShot Flow

```txt
Sinan CameraShot JSON
  -> CameraShotPlayer / DirectorCameraSystem chooses a shot
  -> internal adapter resolves deterministic scrub context
  -> createRailShotPreset(...).evaluate({ time: scrubTime })
  -> CameraState
  -> RuntimeCameraPose
```

## Rules

- Sinan owns InputFlow, CameraShot JSON, editor state, runtime application,
  preview, scrub, restore, save, undo, and validation.
- ViewRig owns rig and path algorithms, preset evaluation, `CameraState`, and
  renderer-agnostic debug metadata.
- Runtime pose, channel cache, damping cache, and host object references must
  not be serialized into Sinan authoring data.
- If ViewRig evaluation fails, Sinan falls back to its existing camera path.
- v0.6 gallery POC labels are evidence tags only: follow/orbit maps to POC-2
  and rail/camera-shot maps to POC-3, but Sinan still owns source-of-truth data.

## Boundary

Keep the adapter in the Sinan repository until the owner approves a public
package review. Do not add `packages/sinan` or `@viewrig/sinan` in ViewRig v0.6.
