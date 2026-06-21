# ViewRig / Sinan POC-3 CameraShot Enhancement Contract

Date: 2026-06-21
Status: v0.2 R12 execution contract
Related:

- `viewrig-camera-shot-optional-solver-mode-2026-06-20.md`
- `viewrig-sinan-poc-2-follow-orbit-contract-2026-06-21.md`
- `rfc-004-sinan-camera-pose-shot-rig-boundary.md`

## Goal

POC-3 proves that a Sinan CameraShot can optionally use ViewRig algorithms for shot playback or preview while Sinan remains the authoring source of truth.

This contract covers execution behavior only. It does not add a public `@viewrig/sinan` package, does not change ViewRig core to know about Sinan, and does not authorize npm publication.

## Source Of Truth

Sinan owns:

- CameraShot JSON.
- CameraShot schema extension review.
- Timeline camera track references.
- CameraShotPlayer and DirectorCameraSystem ownership.
- Preview, scrub, restore, save, undo, and validation behavior.

ViewRig owns:

- Camera rig and path algorithms.
- `CameraState` output.
- Renderer-agnostic debug metadata and draw commands.
- Pure interfaces such as `WorldProbe`.

Runtime pose output is not authoring data.

## Execution Flow

```txt
Sinan CameraShot JSON
  -> CameraShotPlayer / DirectorCameraSystem selects shot
  -> optional ViewRig extension mapper
  -> ViewRig solver, path, composer, constraints
  -> CameraState
  -> RuntimeCameraPose
  -> Sinan runtime camera application
```

ViewRig returns data. Sinan applies data.

## Timeline Scrub Contract

Timeline scrub must be deterministic and side-effect-light.

Inputs owned by Sinan:

- shot id
- scrub time
- normalized shot time, if available
- resolved target snapshot
- optional deterministic input channel values
- optional world/probe snapshot or no-probe fallback

Adapter rules:

- Scrub evaluation must not depend on previous runtime frames.
- Scrub evaluation must not mutate gameplay camera channel caches.
- Time-based drivers use the scrub time supplied by Sinan.
- Input-based drivers require deterministic values supplied by the scrub context.
- Missing scrub-only data must fall back to current CameraShot behavior or produce a validation warning.

Expected output:

- one `RuntimeCameraPose` for the scrubbed time
- optional preview/debug metadata
- no persistent ViewRig runtime state

## Restore Contract

Sinan owns restore behavior.

Rules:

- Entering preview or scrub must not overwrite the gameplay camera source unless Sinan explicitly chooses that source.
- Exiting preview or scrub restores according to Sinan DirectorCameraSystem rules.
- ViewRig adapter state can be discarded at any time.
- Last pose, damping cache, input channel cache, and solver scratch data must not be used as restore source-of-truth.

## Fallback Contract

Sinan must keep existing CameraShot behavior as the fallback path.

Fallback triggers:

- `viewRig` extension missing.
- `viewRig.enabled !== true`.
- solver is `"none"` or unsupported.
- rig/path/composer/constraint config fails validation.
- world/probe data is unavailable and required by the selected mode.
- ViewRig evaluation throws or returns invalid pose data.

Fallback response:

- use existing CameraShotPlayer behavior
- record a validation warning or debug event
- avoid writing partial ViewRig runtime state into JSON

## Serialization Rules

Allowed in CameraShot JSON after Sinan schema review:

- stable solver id
- stable rig/path/composer/constraint config
- stable driver config
- enabled flag and schema version

Forbidden in CameraShot JSON:

- `CameraState`
- `RuntimeCameraPose`
- last evaluated position or rotation
- damping cache
- blend cache
- mutable channel state
- ViewRig private objects
- Sinan runtime object references
- Three camera or Object3D references

## Acceptance Matrix

- CameraShot without ViewRig extension behaves exactly as before.
- Unsupported solver falls back without breaking playback.
- Timeline scrub at the same time produces the same runtime pose.
- Preview exit restores through Sinan rules.
- CameraShot JSON round-trip contains only stable authoring fields.
- ViewRig core keeps passing boundary checks.
- No public `@viewrig/sinan` package or `packages/sinan` folder exists in ViewRig.

## Out Of Scope

- Real Sinan schema migration in this repository.
- Public adapter package.
- Replacing CameraShotPlayer or DirectorCameraSystem.
- Saving runtime camera pose into authoring JSON.
- Editor UI implementation details.
- Official npm release or GitHub release.
