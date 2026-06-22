# ViewRig v0.3 Sinan POC Handoff

Status: R11 Sinan POC-2 / POC-3 handoff package.

Related:

- [ViewRig v0.4 Sinan Feedback Gate](ViewRig_v0.4_Sinan_Feedback_Gate.md)
- [Sinan POC-2 Follow Orbit Contract](sinan-cooperation/viewrig-sinan-poc-2-follow-orbit-contract-2026-06-21.md)
- [Sinan POC-3 CameraShot Enhancement Contract](sinan-cooperation/viewrig-sinan-poc-3-camera-shot-enhancement-contract-2026-06-21.md)
- [Sinan Internal POC Adapter Design](sinan-cooperation/viewrig-sinan-internal-poc-adapter-2026-06-20.md)

## Handoff Scope

This handoff is documentation only. It does not create a public `@viewrig/sinan` package, does not add a Sinan package folder, does not publish to npm, and does not move Sinan runtime or editor ownership into ViewRig.

Sinan implements any real adapter inside the Sinan repository. ViewRig provides public algorithms, `CameraState`, testing fixtures, adapter smoke policy, and boundary guidance.

## Source Of Truth

Sinan owns:

- CameraShot JSON and schema review
- CameraShotPlayer and DirectorCameraSystem
- Timeline camera tracks, preview, scrub, restore, save, undo, and editor validation
- InputFlow, world stores, runtime camera application, and `WebRuntime.setCameraPose`

ViewRig owns:

- engine-agnostic camera algorithms
- `CameraState` output
- `WorldProbe` and other pure contracts
- renderer-agnostic debug metadata and draw commands
- package API stability checks and trace fixtures

Runtime camera pose is per-frame output. It is not authoring source-of-truth and must not be serialized back into CameraShot JSON.

## POC-2 Follow / Orbit Checklist

Fixture expectations:

- deterministic target transform fixture with position and optional rotation
- deterministic yaw, pitch, zoom, and optional shoulder channel values
- no-probe fixture proving constraints fall back without physics
- optional probe fixture proving invalid hits are dropped before entering ViewRig core
- source selector fixture proving Sinan can enable and disable the ViewRig camera path

Acceptance:

- orbit yaw, pitch, and distance changes visibly change runtime camera pose
- follow mode tracks target movement without mutating editor viewport camera state
- disabling the ViewRig source restores the existing Sinan gameplay camera path
- no ViewRig runtime cache or channel state is written into Sinan JSON
- browser smoke or screenshot evidence captures at least one before/after camera pose change

Rollback:

- disable the Sinan source selector flag for the ViewRig camera source
- route runtime camera application back to the existing Sinan gameplay camera path
- keep CameraShotPlayer and DirectorCameraSystem fallback paths unchanged
- discard adapter-local ViewRig state instead of trying to restore from it

## POC-3 CameraShot Checklist

Fixture expectations:

- CameraShot fixture without a ViewRig extension
- CameraShot fixture with `viewRig.enabled === true`
- unsupported solver fixture
- deterministic timeline scrub fixture with shot id, scrub time, target snapshot, and optional channel values
- JSON round-trip fixture proving no runtime pose, damping cache, blend cache, or channel cache is persisted

Acceptance:

- CameraShot without ViewRig extension behaves exactly as current Sinan behavior
- unsupported or disabled solver falls back without breaking playback
- timeline scrub at the same time produces the same runtime pose
- preview exit restores through Sinan DirectorCameraSystem rules
- CameraShot JSON contains only stable authoring fields after schema review
- no public `@viewrig/sinan` package or `packages/sinan` folder exists in ViewRig

Rollback:

- set `viewRig.enabled` false or remove the reviewed extension field
- keep existing CameraShotPlayer behavior as the fallback
- emit validation warnings instead of partial runtime state when mapping fails
- restore preview and scrub state through Sinan ownership rules, not ViewRig caches

## ViewRig Validation Commands

Run these in the ViewRig repository before handing off a refreshed package or contract:

```powershell
pnpm docs:check
pnpm boundary:check
pnpm test
pnpm --filter @viewrig/adapter-three test
pnpm test:browser
pnpm release:dry-run
```

Expected result:

- docs links pass
- core boundary rejects host dependencies
- adapter and playground smoke stay green
- package and Changesets dry-runs do not publish or version packages

## Sinan-Side Validation Commands

Exact command names belong to the Sinan repository. The handoff expects Sinan to provide equivalent checks for:

- adapter mapper unit tests
- no-probe and invalid-probe fallback tests
- gameplay camera source selector tests
- director preview restore tests
- timeline scrub determinism tests
- CameraShot JSON round-trip tests
- browser smoke or screenshot smoke for runtime camera pose changes

## Stop Conditions

Stop the POC and fall back to current Sinan camera behavior if:

- the adapter needs ViewRig core to import Sinan, Three, DOM, physics, or editor stores
- POC-3 requires replacing CameraShotPlayer or DirectorCameraSystem
- runtime `CameraState` or `RuntimeCameraPose` must be serialized as authoring data
- schema migration is required before Sinan owner review
- a real npm package, release tag, or GitHub release is needed
