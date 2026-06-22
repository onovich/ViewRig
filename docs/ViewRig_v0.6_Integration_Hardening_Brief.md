# ViewRig v0.6 Integration Hardening Brief

Date: 2026-06-22
Status: R1 inventory and execution brief
Phase: ViewRig v0.6 Real Integration / Examples Hardening

## 1. Purpose

v0.6 moves ViewRig from product-shaped presets into reproducible integration
evidence. v0.5 proved that common camera roles can be expressed through
engine-agnostic preset helpers, recipes, playground controls, and packed-package
consumer smoke. v0.6 should prove that those roles can be applied through the
Three adapter and example workflow without turning examples or adapters into a
second solver.

The phase question is:

Can an external developer follow the docs, run the example gallery, inspect the
browser smoke, and verify that v0.5 presets produce `CameraState` values that
`@viewrig/adapter-three` applies to a real Three camera?

## 2. Current Inventory

### Core Presets

- `@viewrig/core` exposes v0.5 presets for third-person gameplay, orbit,
  follow, first-person, and rail/camera-shot workflows.
- Presets are composition helpers over existing rigs, channels, composers,
  constraints, paths, and debug/tuning summaries.
- Core still outputs `CameraState` and does not import Three, DOM, React,
  Sinan, Rapier, Babylon, PlayCanvas, or a host scene graph.

### Adapter-Three

- `@viewrig/adapter-three` applies `CameraState` to Three-compatible cameras.
- Existing tests include real Three camera coverage for position, quaternion,
  perspective lens values, near/far values, and projection matrix updates.
- v0.6 should extend the evidence so preset-generated states flow into the same
  adapter path and so lens/application behavior is documented as integration
  evidence rather than inferred from structural tests.

### Example Playground

- `examples/three-orbit-playground` currently provides a browser-smoked canvas
  playground with orbit and third-person modes, tuning controls, pose JSON, and
  debug overlay state.
- The current source computes example poses directly in the playground. It is
  useful smoke evidence, but it is not yet a gallery over the v0.5 preset
  workflows.
- v0.6 should turn this into a small gallery covering third-person, orbit,
  follow, first-person, and rail/camera-shot visible paths.

### Browser Smoke

- `pnpm test:browser` builds the playground, starts a local HTTP smoke server,
  loads the page in Chromium or a system Chromium channel, verifies a nonblank
  canvas, checks DOM state, changes tuning values, toggles debug overlay, and
  fails on console, request, page, or HTTP errors.
- v0.6 should expand the smoke matrix across every gallery mode and verify that
  mode switching, pose changes, tuning changes, overlay state, and canvas signal
  remain stable.

### Consumer Smoke

- `scripts/package-consumer-smoke.mjs` already packs core, testing, and
  adapter-three, installs them into a temporary external project, imports public
  exports, evaluates preset states, and applies a fixed state to a Three camera.
- v0.6 should connect those two halves by applying a preset-generated
  `CameraState` through `@viewrig/adapter-three` inside the packed consumer
  fixture.

### Docs And Recipes

- v0.5 recipes explain third-person, orbit, first-person, rail/camera-shot,
  debug/tuning, and Sinan internal-adapter usage.
- v0.6 should align the root README, package READMEs, recipes, and new example
  gallery docs around the same user path: create or evaluate a preset, receive a
  `CameraState`, then apply it through the adapter.

### Sinan Alignment

- Sinan remains an internal adapter consumer and source-of-truth owner for its
  authoring data.
- v0.6 examples can demonstrate follow/orbit and rail/camera-shot concepts that
  map to POC-2 and POC-3, but this repository must not add public
  `@viewrig/sinan`, `packages/sinan`, or Sinan schema ownership.

## 3. Integration Gaps

- Adapter evidence should show preset-generated states flowing into real Three
  cameras, not only hand-written fixed states.
- The example currently has direct pose formulas. The gallery should make the
  preset/evaluate/apply path visible and reusable.
- Browser smoke covers two modes. The v0.6 gallery target needs smoke coverage
  for third-person, orbit, follow, first-person, and rail/camera-shot paths.
- Consumer smoke imports presets and adapter-three, but it should execute the
  minimal external workflow that combines them.
- Recipes and package docs need a consistent "preset to Three camera" story
  instead of separate API, playground, and package narratives.
- Sinan docs need a v0.6 note that examples are integration evidence only and do
  not take over CameraShot, Director, Timeline, InputFlow, or RuntimeCameraPose
  ownership.

## 4. v0.6 Hardening Targets

| Target | Acceptance evidence |
| --- | --- |
| Adapter-three apply path | Real Three camera tests and docs cover position, quaternion/look direction, lens values, near/far, projection updates, and preset-generated states. |
| Example gallery | Browser example exposes third-person, orbit, follow, first-person, and rail/camera-shot modes with shared gallery data and a shared evaluation/apply path. |
| Browser smoke matrix | Smoke verifies all gallery modes, nonblank canvas signal, mode switching, tuning changes, debug overlay state, and no console/request/page/HTTP errors. |
| Packed consumer path | External tarball consumer imports core presets and adapter-three and applies at least one preset-generated `CameraState` to a Three camera. |
| Docs alignment | Root README, package README, recipes, and v0.6 gallery docs describe the same minimal workflow. |
| Sinan boundary | v0.6 docs map example coverage to POC-2/POC-3 while keeping Sinan adapter work internal and non-public. |

## 5. Execution Boundaries

v0.6 must not:

- publish to npm;
- run Changesets version or publish;
- change package visibility or license;
- create a GitHub tag or release;
- deploy TypeDoc publicly;
- add public `@viewrig/sinan` or `packages/sinan`;
- add Three, DOM, React, Sinan, Rapier, Babylon, PlayCanvas, or host scene graph
  dependencies to `@viewrig/core`;
- move example UI state into core;
- make adapter-three own gameplay, solver, rig, composer, constraint, or input
  semantics.

## 6. Validation Lanes

Each round should select the smallest validation lane that proves the change:

- docs-only rounds: `pnpm docs:check` and `git diff --check`;
- adapter rounds: `pnpm --filter @viewrig/adapter-three test`,
  `pnpm boundary:check`, and `git diff --check`;
- example/browser rounds: `pnpm --dir examples/three-orbit-playground build`,
  `pnpm test:browser`, and `git diff --check`;
- public API rounds: `pnpm test`, `pnpm api:check`, `pnpm docs:api`, and
  `pnpm docs:check`;
- package rounds: `pnpm package:dry-run`, `pnpm package:consumer-smoke`, and
  `pnpm release:dry-run`;
- final round: the full v0.6 guide matrix plus wrapper validation, GitHub
  Actions success, and `viewrig-api-docs` artifact inspection.

## 7. R1 Decision

R1 does not change runtime behavior. It records that v0.6 should harden the
real integration path around the existing v0.5 preset layer, adapter-three,
example gallery, browser smoke, packed consumer smoke, and docs alignment while
preserving all release and engine-boundary constraints.

R1 status: PASS when `pnpm docs:check` and `git diff --check` pass.
