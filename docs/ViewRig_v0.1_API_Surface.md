# ViewRig v0.1 API Surface

日期：2026-06-20  
状态：R47 API/docs hardening snapshot

## 1. Packages

当前 v0.1 workspace 包：

- `@viewrig/core`：宿主无关 camera pose solver、math、rig、composer、constraints、path、debug data。
- `@viewrig/testing`：golden trace runner、fake channel/target/world probe fixtures。
- `@viewrig/adapter-three`：structural Three-like camera writer。

当前不发布：

- `@viewrig/sinan`
- `@viewrig/debug-three`
- Babylon / PlayCanvas adapters
- raw input package

## 2. Core Public Modules

`@viewrig/core` 当前 public exports：

- brain：`VirtualCamera`、`CameraBrain`、activation、blend、channel inheritance。
- channels：`ControlChannel`、`YawPitchChannel`、`ZoomChannel`、`ShoulderChannel`。
- conventions：coordinate convention、screen space contract。
- composer：`RectNdc`、`ScreenZoneComposer`、screen zone debug commands。
- constraints：distance/yaw-pitch clamps、confiner 2D/3D、collision、occlusion。
- debug：renderer-agnostic debug draw command model。
- math：Vec2、Vec3、Quat、damping、projection helpers。
- path：`CameraPath`、`ProjectableCameraPath`、`PathSample`、`PolylinePath`.
- pose：RuntimeCameraPose-compatible mapper.
- rigs：fixed pose、follow、first-person、orbit、rail、third-person.
- state：`CameraState`、`LensState`、snapshot types.
- world：`WorldProbe` and safe fallback helpers.

The central runtime output remains `CameraState`.

## 3. Adapter Surface

`@viewrig/adapter-three` exposes a structural adapter:

```ts
applyThreeCameraState(camera: ThreeCameraLike, state: CameraState): void
```

It writes position, quaternion, lens fields, and calls `updateProjectionMatrix` when available. It does not evaluate rigs, duplicate solver behavior, or import Three directly.

## 4. Testing Surface

`@viewrig/testing` exposes:

- `runGoldenTrace`
- fake target
- fake channel
- fake WorldProbe

Trace coverage currently includes fixed pose, blend, orbit, FPS/TPS switching, target NDC projection, polyline path sampling, rail rig, and WorldProbe fallback behavior.

## 5. Validation Commands

Primary local validation:

```powershell
pnpm typecheck
pnpm test
pnpm test:browser
pnpm docs:check
pnpm boundary:check
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
git diff --check
```

`Validate.cmd` currently runs docsCheck and boundary check through `.codex/project-ops-workflow.json`.

## 6. Boundary Guarantees

- Core does not import Three, DOM, React, Sinan, Rapier, Babylon, PlayCanvas, or host scene graph APIs.
- Adapters consume `CameraState`; they do not own solver semantics.
- Sinan integration remains a repo-internal POC design, not a public ViewRig package.
- Runtime state and per-frame `CameraState` do not become authoring source-of-truth.
- CameraShot optional solver mode is a Sinan schema extension proposal, not a ViewRig-controlled CameraShot replacement.

## 7. v0.2 Candidates

- Public API extractor / TypeDoc.
- Real Playwright package-based browser smoke if dependency installation is stable.
- Debug renderer package after debug command model settles.
- Additional adapters after the structural Three adapter proves the contract.
- Spline path implementation after `CameraPath` and `RailRig` remain stable through more traces.
