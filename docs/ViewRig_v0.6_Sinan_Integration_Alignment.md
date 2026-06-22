# ViewRig v0.6 Sinan Integration Alignment

Date: 2026-06-22
Status: R12 Sinan alignment and boundary audit

## 1. Goal

v0.6 uses the example gallery as integration evidence for Sinan-facing camera
workflows without adding a public Sinan adapter package. The gallery labels make
POC alignment visible, but ownership remains unchanged.

## 2. POC-2 Mapping

POC-2 is represented by the gallery modes that consume gameplay target and
input-like values:

| Gallery mode | ViewRig preset | Example role | Sinan-side ownership |
| --- | --- | --- | --- |
| `thirdPerson` | `createThirdPersonGameplayPreset` | gameplay target follow | InputFlow, world target, runtime application |
| `orbit` | `createOrbitShowcasePreset` | object viewer | selected anchor, normalized look/zoom intent |
| `follow` | `createFollowShowcasePreset` | actor follow | actor/world snapshot and fallback policy |
| `firstPerson` | `createFirstPersonGameplayPreset` | eye anchor | raw input, pointer lock, player controller |

ViewRig receives normalized values, evaluates a preset, and returns
`CameraState`. A Sinan internal adapter may map that state to `RuntimeCameraPose`
inside the Sinan repository.

## 3. POC-3 Mapping

POC-3 is represented by the `railShot` gallery mode:

- ViewRig owns deterministic path sampling and `CameraState` output.
- The gallery exposes input scrub, time driver, duration, and railT tuning.
- Sinan still owns CameraShot JSON, Director, Timeline, preview, scrub UI,
  restore, save, undo, validation, and runtime pose application.

The v0.6 rail example is evidence that ViewRig can supply a solver path for a
CameraShot-like use case. It does not make ViewRig the authoring source of truth.

## 4. Boundary Audit

Confirmed v0.6 boundaries:

- no public `@viewrig/sinan`;
- no `packages/sinan`;
- no Sinan schema copied into `@viewrig/core`;
- no Sinan runtime, editor store, Director, Timeline, or CameraShotPlayer import;
- no DOM, Three, React, Rapier, Babylon, PlayCanvas, or host scene dependency in
  `@viewrig/core`;
- adapter-three remains a `CameraState` application layer only;
- example gallery UI state remains in `examples/three-orbit-playground`;
- runtime pose, channels, damping cache, and debug status are not persisted into
  Sinan authoring data.

## 5. Release Boundary Audit

The v0.6 work remains non-publishing:

- no npm publish;
- no Changesets version or publish;
- no package visibility change;
- no license change;
- no GitHub tag;
- no GitHub release;
- no public TypeDoc deploy.

## 6. R12 Validation

Required validation:

- `pnpm boundary:check`
- `pnpm docs:check`
- `git diff --check`

R12 status: PASS when required validation passes and the commit is pushed.
