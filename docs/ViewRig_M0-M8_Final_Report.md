# ViewRig M0-M8 Final Report

日期：2026-06-20  
状态：PASS  
分支：`main`  
R48 commit：本报告所在提交

## 1. Goal 结果

- 总轮次：48
- 已完成 Phase：M0、M1、M2、M3、M4、M5、M6、M7、M8
- 未完成 Phase：无
- 消耗缓冲轮：4，R44-R47
- 远端分支：`origin/main`

## 2. 关键交付

Core：

- `CameraState`、`LensState`、`WorldProbe`、`ControlChannel`
- coordinate convention、screen space contract
- Vec2 / Vec3 / Quat / projection / half-life damping
- `VirtualCamera`、`CameraBrain`、cut、blend、matchThenBlend
- Follow / Orbit / FirstPerson / ThirdPerson / Rail rigs
- ScreenZoneComposer、debug draw data
- Distance / yaw-pitch clamps、confiner、collision、occlusion
- `CameraPath`、`PolylinePath`、target projection

Testing：

- golden trace runner
- fake target/channel/world probe
- deterministic traces for fixed pose、blend、orbit、FPS/TPS switch、target NDC、polyline path、RailRig

Adapters：

- `@viewrig/adapter-three` structural camera writer
- no direct Three dependency required for adapter tests

Examples：

- `examples/three-orbit-playground`
- static orbit canvas playground
- debug overlay
- `pnpm test:browser` build + smoke entry

Sinan POC：

- pose solver spike
- PhysicsProbe adapter contract
- Sinan internal POC adapter design
- CameraShot optional solver mode proposal

Docs：

- M0-M8 validation reports
- v0.1 API surface
- final report and release dry-run draft

## 3. 最终验证矩阵

R48 final validation commands：

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:browser`
- `pnpm docs:check`
- `pnpm boundary:check`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`
- `git diff --check`
- `git status --short --branch`

R48 actual PASS state：

- TypeScript build passes.
- 55 test files pass.
- 112 tests pass.
- playground build and smoke pass.
- docs check passes.
- boundary check passes.
- final worktree is clean after R48 commit.

## 4. 架构确认

- `@viewrig/core` 无 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或宿主 scene graph 依赖。
- `CameraState` 仍是核心运行时输出。
- Adapters 只应用 `CameraState`，不复制 solver 语义。
- Debug overlay 在 example 层，core 只提供 debug data。
- Sinan CameraShot / Director / Timeline source-of-truth 保持不变。
- Runtime state 不保存为 Sinan authoring JSON。
- `@viewrig/sinan` 未发布，Sinan adapter 仍是内部 POC 设计。

## 5. Release Dry-Run Draft

候选 tag：

```txt
v0.1.0-draft
```

当前不执行真实 tag、npm publish 或 GitHub release。原因：

- packages 仍为 `private: true`
- public API extractor / TypeDoc 尚未接入
- release provenance 和 changesets 尚未配置

真正 release 前建议步骤：

```powershell
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm test:browser
pnpm docs:check
pnpm boundary:check
git diff --check
git status --short --branch
```

之后再评估：

```powershell
pnpm --filter @viewrig/core pack --dry-run
pnpm --filter @viewrig/testing pack --dry-run
pnpm --filter @viewrig/adapter-three pack --dry-run
git tag v0.1.0-draft
```

这些步骤是草案，不在本轮自动执行 destructive 或 release 操作。

## 6. 风险和后续

剩余风险：

- Playwright 作为 npm dependency 尚未接入，当前 browser smoke 是 lightweight static/build smoke 加 in-app browser 验证记录。
- adapter-three 仍使用 structural type，后续需要真实 Three integration smoke。
- public API extractor、TypeDoc、changesets 和 release provenance 仍是 v0.2 工作。
- Rail path 目前只有 polyline，spline/path editor 不在 v0.1 范围内。

v0.2 建议：

- 接入 API Extractor / TypeDoc。
- 增加真实 Playwright browser smoke。
- 增加 debug renderer package。
- 增加真实 Three playground bundler smoke。
- 在 Sinan repo 内部推进 POC-2/POC-3。
