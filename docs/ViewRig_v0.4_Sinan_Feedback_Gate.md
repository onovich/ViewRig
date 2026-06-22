# ViewRig v0.4 Sinan Feedback Gate

Status: R12 Sinan feedback and public adapter guard.

## Decision

Sinan integration remains a docs/contract handoff for v0.4.

The following remain out of scope:

- public `@viewrig/sinan`
- `packages/sinan`
- Sinan schema ownership inside ViewRig
- Sinan runtime or editor stores inside ViewRig core
- Sinan-specific physics, DirectorCameraSystem, timeline, or gameplay camera ownership inside ViewRig packages

## Current Boundary

ViewRig owns:

- engine-agnostic camera algorithms
- `CameraState`
- public core package contracts
- testing fixtures and golden trace helpers
- `adapter-three` as a thin `CameraState` application adapter
- documentation for Sinan-side POC expectations

Sinan owns:

- real Sinan adapter implementation
- Sinan schema and migration policy
- Sinan runtime source selection
- Sinan editor UI and preview lifecycle
- Sinan physics/world query integration
- Sinan-side validation command names and acceptance criteria

## Feedback Intake

Sinan feedback may be accepted into ViewRig as:

- documentation updates
- public contract clarification
- engine-agnostic test fixtures
- `CameraState` or rig API feedback that benefits non-Sinan consumers too
- adapter boundary notes

Sinan feedback must not be accepted into ViewRig as:

- public Sinan package creation
- Sinan-specific runtime ownership
- schema migration code
- editor state storage
- package dependencies on Sinan runtime modules

## Current Guards

`pnpm boundary:check` fails if:

- `packages/sinan` exists
- any package manifest is named `@viewrig/sinan`
- core imports host dependencies such as Sinan, Three, React, Rapier, Babylon, or PlayCanvas
- adapter-three imports core through private filesystem paths instead of public `@viewrig/core`

## Follow-Up Link

The v0.3 handoff remains the current Sinan technical handoff:

- `docs/ViewRig_v0.3_Sinan_POC_Handoff.md`

This R12 gate is the release-governance wrapper around that handoff.

## Validation

R12 validation commands:

- `pnpm docs:check`
- `pnpm boundary:check`
- `git diff --check`

Architecture self-check: this gate keeps ViewRig core independent and confirms Sinan remains external to ViewRig packages until a future owner-approved adapter phase.
