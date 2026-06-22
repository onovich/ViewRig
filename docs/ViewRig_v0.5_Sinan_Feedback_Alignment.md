# ViewRig v0.5 Sinan Feedback Alignment

Date: 2026-06-22
Status: R12 alignment and boundary audit note

## 1. Goal

v0.5 added product usability presets, debug/tuning helpers, recipes, playground
tuning, and consumer smoke coverage. This document records how those additions
align with the existing Sinan POC-2 and POC-3 contracts.

## 2. Alignment Summary

| Sinan feedback area | ViewRig v0.5 response | Boundary |
| --- | --- | --- |
| Follow/orbit gameplay POC | `createOrbitShowcasePreset` and `createFollowShowcasePreset` provide reusable core-side shapes | Sinan still owns InputFlow, source selection, runtime application, and fallback |
| CameraShot preview/playback POC | `createRailShotPreset` provides deterministic path sampling and debug/tuning metadata | Sinan still owns CameraShot JSON, timeline, scrub, restore, save, undo, and validation |
| Camera tuning UX | `CameraPresetDebugSummary`, tuning controls, and helper snapshots provide renderer-agnostic metadata | Host UI decides how to render or persist user-facing controls |
| Debug overlay | presets return `DebugDrawCommand` values and metadata | Renderer-specific drawing stays outside `@viewrig/core` |
| Consumer confidence | packed-package smoke imports and executes preset APIs | No public Sinan package is created |

## 3. POC-2 Follow/Orbit Notes

Sinan can map normalized InputFlow values into ViewRig preset config:

- yaw/pitch -> `createYawPitchChannel`;
- zoom/distance -> `createZoomChannel` or numeric distance;
- target snapshot -> preset `target`;
- source selector -> choose orbit, follow, or existing Sinan camera path.

ViewRig returns `CameraPresetEvaluation`. Sinan may inspect `debug`, `tuning`,
and `draw`, but only `state` is a runtime camera output. Sinan applies the
runtime pose through its own runtime code.

## 4. POC-3 CameraShot Notes

For CameraShot preview or playback, Sinan can map a reviewed shot extension to
`createRailShotPreset`:

- path config -> `CameraPath`;
- fixed/time/input/targetProjection driver -> `RailRigDriver`;
- scrub time -> `preset.evaluate({ time })`;
- result state -> Sinan `RuntimeCameraPose`.

The preset does not authorize ViewRig to own CameraShot JSON or timeline state.
Runtime cache, last pose, damping state, channel values, and host object
references remain forbidden in authoring data.

## 5. Boundary Audit

Required boundary posture for v0.5:

- no `packages/sinan`;
- no public `@viewrig/sinan` package;
- no Sinan import in `packages/core/src`;
- no Three, DOM, React, Rapier, Babylon, PlayCanvas, or host scene graph import
  in `@viewrig/core`;
- no package visibility, license, npm publish, Changesets publish/version,
  GitHub tag/release, or public TypeDoc deploy.

The R12 validation command is `pnpm boundary:check`; final pass/fail evidence is
recorded in the v0.5 final report.

## 6. Stop Conditions

Stop and route back to planner/checker if any future work requires:

- adding a public Sinan package in this repository;
- changing Sinan CameraShot schema from the ViewRig repository;
- replacing Sinan CameraShotPlayer or DirectorCameraSystem;
- serializing ViewRig runtime state into Sinan authoring JSON;
- applying camera pose directly from ViewRig core to Sinan runtime;
- executing a real npm/GitHub release action.
