# ViewRig v0.5 Product Usability Brief

Date: 2026-06-22
Status: R1 inventory and execution brief
Phase: ViewRig v0.5 Product Usability / Camera Experience Hardening

## 1. Purpose

v0.5 moves ViewRig from release-candidate governance into developer usability. The
goal is to make common game camera setups easier to compose without changing the
core architecture or starting a public release phase.

The main product question for this phase is:

> Can a game developer create a useful third-person, orbit/follow, first-person,
> or rail/camera-shot camera with a small, documented preset entry point, then
> inspect and tune it in a playground and consumer smoke?

## 2. Current Inventory

### Core API

- `@viewrig/core` already exports deterministic evaluators for `FollowRig`,
  `OrbitRig`, `FirstPersonRig`, `ThirdPersonRig`, `RailRig`, fixed poses,
  composers, constraints, channels, paths, debug draw commands, and
  `CameraState`.
- The current APIs are intentionally low-level. They expose solver ingredients
  directly, but they do not yet provide product-shaped presets for common
  camera roles.
- `CameraState` remains the runtime output contract. Engine adapters consume it;
  core does not own real engine cameras.

### Examples And Playground

- `examples/three-orbit-playground` provides a lightweight orbit-style canvas
  playground with yaw, pitch, distance, pose JSON, and a debug overlay toggle.
- The browser smoke verifies that the playground builds, renders a nonblank
  canvas, reacts to controls, and changes the canvas when debug overlay is
  toggled.
- The playground is currently orbit-first and does not yet demonstrate
  third-person, follow, first-person, or rail/camera-shot workflows.

### Docs

- v0.4 completed release decision gates, consumer smoke, RC evidence, and final
  PASS reporting.
- The root README links the v0.5 guide, but no v0.5 product usability brief,
  preset API design, recipes, or playground usability notes exist yet.
- Existing Sinan cooperation docs define internal adapter contracts only. They
  do not authorize a public `@viewrig/sinan` package.

### Consumer Smoke

- `scripts/package-consumer-smoke.mjs` packs `@viewrig/core`,
  `@viewrig/testing`, and `@viewrig/adapter-three`, installs the tarballs into a
  temporary external project, imports public exports, evaluates a fixed pose,
  and applies it to a Three camera.
- The consumer smoke does not yet exercise v0.5 preset exports because those
  exports do not exist yet.

## 3. Usability Gaps

The main v0.5 gaps are not missing solvers. They are missing entry points,
recipes, and tuning surfaces:

- A third-person developer must currently assemble target, look, shoulder,
  composer, constraints, and debug IDs by hand.
- Orbit and follow behavior exists, but there is no shared showcase preset or
  Sinan POC-2 mapping note that ties normalized intent to a repeatable public
  core API shape.
- First-person and rail/camera-shot behavior exists as low-level evaluators,
  but there is no camera-role preset or recipe that explains deterministic
  scrub, time driver, and fallback expectations.
- Debug data is available in pieces, but there is no preset-level summary that
  a playground, UI, or smoke test can inspect consistently.
- The playground does not yet offer mode switching, comparable tuning controls,
  or a preset-backed example path.
- The packed-package smoke is ready for public API verification, but it still
  covers only a minimal fixed-pose path.

## 4. v0.5 Product Shape

v0.5 should add a `presets` composition layer in `@viewrig/core`.

Presets should:

- call existing evaluators and helpers instead of duplicating solver semantics;
- accept plain data and existing control channels;
- return `CameraState` through explicit evaluate functions or small preset
  descriptors;
- expose stable debug/tuning summaries for playgrounds and consumer smoke;
- stay engine-agnostic and free of DOM, React, Three, Sinan, Rapier, Babylon,
  PlayCanvas, and host scene graph types;
- remain compatible with API Extractor and TypeDoc governance.

Presets should not:

- create a second camera framework beside `CameraBrain` and `VirtualCamera`;
- store host runtime objects or authoring JSON;
- move playground UI concepts into core;
- publish or imply public release stability;
- create a Sinan package or make Sinan schemas source-of-truth inside ViewRig.

## 5. Preset Candidates

| Preset | Product job | Existing core base | v0.5 notes |
| --- | --- | --- | --- |
| Third-person gameplay | Shoulder/follow camera for a player target | `evaluateThirdPersonRig`, `YawPitchChannel`, `ShoulderChannel`, composers, constraints | First priority for ergonomics and tuning |
| Orbit showcase | Inspect a player, object, or scene anchor | `evaluateOrbitRig`, `ZoomChannel`, debug draw data | Must align with Sinan POC-2 normalized input mapping |
| Follow showcase | Follow actor or anchor without orbit semantics | `evaluateFollowRig` | Useful as a simple fallback and Sinan adapter mode |
| First-person | Eye-anchor camera with inherited look | `evaluateFirstPersonRig` | Keep raw input outside core |
| Rail/camera-shot | Deterministic path camera or shot preview | `evaluateRailRig`, `CameraPath`, `PolylinePath` | Must align with Sinan POC-3 scrub/fallback contract |

## 6. Playground Direction

The playground should become a product usability surface, not just a renderer
smoke fixture.

Required direction:

- mode switch for at least orbit and third-person during the main playground
  rounds;
- comparable controls for yaw, pitch, distance, shoulder, damping/composer where
  available, and debug overlay;
- visible debug/tuning state that smoke tests can assert;
- nonblank canvas and console-clean browser smoke after mode switches;
- no dependency from `@viewrig/core` back to playground UI code.

## 7. Sinan Alignment

Sinan remains an internal adapter consumer, not a public ViewRig package in this
phase.

POC-2 constraints:

- Sinan samples InputFlow and world data before invoking ViewRig.
- ViewRig receives normalized intent/channel values and returns `CameraState`.
- Sinan maps `CameraState` to `RuntimeCameraPose` and owns runtime application.

POC-3 constraints:

- Sinan owns CameraShot JSON, playback, preview, scrub, restore, save, undo, and
  validation behavior.
- ViewRig can provide deterministic solver output for a supplied shot/scrub
  context.
- Runtime pose, damping cache, channel state, and host objects must not be
  serialized into Sinan authoring data.

## 8. Validation Direction

Each later v0.5 round should preserve these checks:

- unit or golden trace coverage for every new preset entry point;
- API Extractor check/report update whenever public exports change;
- docs check and boundary check when docs or core exports change;
- browser smoke for playground behavior;
- packed-package consumer smoke for preset imports and evaluation;
- release dry-run only as a non-publishing guard.

## 9. R1 Decision

R1 does not add runtime code. It records that v0.5 should focus on a small core
preset layer, recipe docs, playground tuning, and consumer smoke coverage while
preserving all v0.4 release boundaries.

R1 status: PASS when `pnpm docs:check` and `git diff --check` pass.
