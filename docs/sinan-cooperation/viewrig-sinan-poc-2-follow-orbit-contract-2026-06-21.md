# ViewRig / Sinan POC-2 Follow Orbit Contract

Date: 2026-06-21
Status: v0.2 R11 execution contract
Related:

- `rfc-004-sinan-camera-pose-shot-rig-boundary.md`
- `viewrig-sinan-internal-poc-adapter-2026-06-20.md`
- `viewrig-camera-shot-optional-solver-mode-2026-06-20.md`

## Goal

POC-2 proves that Sinan Showcase gameplay can use ViewRig follow/orbit solving while Sinan keeps camera ownership.

The POC must not add a public `@viewrig/sinan` package to this repository. The adapter remains inside the Sinan repository until the Sinan runtime and editor contracts are stable enough for a public package review.

## Frame Flow

```txt
Sinan InputFlow snapshot
  + Sinan World player/target transform
  + optional Sinan WorldProbe / PhysicsProbe
  -> Sinan internal ViewRig adapter input
  -> ViewRig FollowRig or OrbitRig
  -> CameraState
  -> Sinan RuntimeCameraPose
  -> WebRuntime.setCameraPose
```

ViewRig does not call `WebRuntime.setCameraPose` directly. Sinan owns that runtime side effect.

## InputFlow Mapping

Sinan should sample input once per gameplay frame and pass stable intent values into the internal adapter.

| Sinan input concept | ViewRig input |
| --- | --- |
| look delta x | yaw channel delta |
| look delta y | pitch channel delta |
| zoom / wheel / trigger | zoom channel delta |
| shoulder toggle / side preference | shoulder channel value, optional |
| camera mode toggle | Sinan source selector chooses follow or orbit |
| enable / disable camera assist | Sinan source selector enables or bypasses ViewRig |

Rules:

- Raw DOM, pointer lock, gamepad, rebinding, and input context stay in Sinan InputFlow.
- ViewRig receives already-normalized intent/channel values.
- Runtime channel cache is not serialized into CameraShot JSON or any Sinan authoring data.

## World Mapping

Sinan should resolve world data before invoking ViewRig.

| Sinan world concept | ViewRig input |
| --- | --- |
| player entity transform | target position and optional target rotation |
| look-at anchor | follow/orbit target point |
| world delta time | solver `deltaSeconds` / evaluation context |
| camera bounds | confiner input or no-op when absent |
| physics query | `WorldProbe` adapter, optional |

Rules:

- Missing physics probe must not block POC-2. Constraint behavior should fall back to no-op or clamp-only.
- Invalid world hits should be dropped by the Sinan adapter with debug metadata rather than leaking host objects into ViewRig core.
- ViewRig core must not import Sinan world stores, Rapier, Three, DOM, or editor state.

## Runtime Pose Mapping

The internal adapter maps `CameraState` to Sinan runtime pose data.

| CameraState field | RuntimeCameraPose field |
| --- | --- |
| `position` | camera world position |
| `rotation` | camera world rotation |
| `lens.projection` | runtime projection mode if supported |
| `lens.fov` | perspective field of view |
| `lens.orthographicSize` | orthographic size / zoom mapping |
| `lens.near` / `lens.far` | camera clipping planes |
| `debug` | optional preview/debug metadata only |

The adapter then asks Sinan runtime code to apply the pose:

```ts
const state = evaluateViewRigCamera(input);
const pose = mapCameraStateToRuntimeCameraPose(state);
webRuntime.setCameraPose(pose);
```

This snippet is conceptual. The real call site and runtime object names belong to the Sinan repository.

## POC Modes

### Orbit Showcase

- Target: player avatar, showcase object, or selected scene anchor.
- Input: yaw, pitch, distance/zoom.
- Acceptance: changing yaw/pitch/zoom visibly changes runtime camera pose.

### Follow Showcase

- Target: player avatar or showcase actor.
- Input: target transform, follow offset, optional yaw/shoulder channel.
- Acceptance: moving the target updates camera pose while preserving editor camera isolation.

## Acceptance Matrix

- POC can be enabled and disabled by Sinan source selection.
- Editor viewport camera is not affected by gameplay camera state.
- Existing Sinan CameraShotPlayer and DirectorCameraSystem remain available as fallback.
- Browser smoke or screenshot evidence shows camera pose changes for orbit/follow controls.
- No ViewRig runtime state is written into Sinan JSON.
- No public `@viewrig/sinan` package or `packages/sinan` folder exists in ViewRig.
- ViewRig boundary checks still pass.

## Fallback Rules

- If ViewRig adapter initialization fails, Sinan uses its existing gameplay camera path.
- If world probe is absent, ViewRig constraints run without physics-backed collision.
- If input channels are unavailable, Sinan passes deterministic defaults.
- If `WebRuntime.setCameraPose` rejects a pose, Sinan records debug information and restores the previous valid camera path.

## Out Of Scope

- Public npm package for Sinan integration.
- CameraShot schema changes for POC-2.
- Timeline scrub behavior.
- Persistent ViewRig runtime cache.
- Replacing Sinan CameraShotPlayer, DirectorCameraSystem, editor commands, or save/undo policy.
