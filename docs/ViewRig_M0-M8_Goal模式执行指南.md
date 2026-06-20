# ViewRig M0-M8 Goal 模式执行指南

日期：2026-06-20  
状态：给后续执行者使用的 M0-M8 大 Goal 开发指令文档  
总轮次预算：48 轮  
预算拆分：43 轮主线实现 + 4 轮全局缓冲 + 1 轮最终验收  

## 0. 直接给执行者的 Goal Prompt

请在 Goal 模式下执行 ViewRig M0-M8 大目标。目标是在 48 轮内，把当前设计文档仓库推进到一个可验证的 v0.1 相机姿态求解库基础：完成 monorepo、core/testing、坐标契约、deterministic trace、CameraBrain/blend、follow/orbit、first/third person、composer/debug data、WorldProbe constraints、adapter-three playground、Sinan POC adapter 设计、Rail/CameraShot enhancement 方案。

每一轮都必须：

- 先阅读本指南和相关文档。
- 明确本轮目标和非目标。
- 完成本轮最小可验证改动。
- 运行本轮相关验证。
- 做 Debug 自检和架构自检。
- 验证通过后提交并推送。
- 记录 commit hash、push 结果、是否消耗缓冲轮。
- 如果验证、提交或推送失败，不得进入下一轮。

架构红线：

- `@viewrig/core` 不依赖 Three、DOM、React、Sinan、Rapier 或任何宿主 engine/editor store。
- `CameraState` 是 core 的唯一中心输出。
- runtime state 不做宿主项目 source-of-truth。
- Sinan 保留 CameraShot / DirectorCameraSystem / Timeline / editor command ownership。
- 不把 Sinan adapter 作为 ViewRig 公共包提前发布。

## 1. 必读上下文

执行前必须阅读：

- `README.md`
- `AGENTS.md`
- `docs/ViewRig_视角_设计文档.md`
- `docs/ViewRig_Sinan_合作评估与研发计划.md`
- `docs/ViewRig_技术架构设计与开发计划.md`
- `docs/sinan-cooperation/rfc-004-sinan-camera-pose-shot-rig-boundary.md`
- `docs/sinan-cooperation/sinan-technical-advisory-2026-06-20.md`
- `docs/sinan-cooperation/sinan-business-letter-2026-06-20.md`
- `docs/codex-git-workflow.md`
- `docs/codex-ops-workflow.md`

当前已接受的阶段：设计和架构规划阶段。  
当前 PASS 证据：docsCheck 已通过，README 和规划文档已无 UTF-8 BOM。  
下一阶段：M0 Repository And Contract Foundation。  

## 2. 本大目标要完成什么

M0-M8 的总目标是完成 ViewRig v0.1 的工程基础和第一条宿主接入路径：

- 建立 pnpm workspace 和 TypeScript/Vitest 工程。
- 实现 `@viewrig/core` 与 `@viewrig/testing`。
- 明确坐标约定、公共类型、WorldProbe、ControlChannel。
- 建立 deterministic golden trace 测试体系。
- 实现 CameraBrain、VirtualCamera、cut/blend/matchThenBlend。
- 实现 Follow/Orbit/FirstPerson/ThirdPerson MVP。
- 实现 ScreenZoneComposer、debug metadata、WorldProbe constraints。
- 实现 adapter-three 和 Three playground smoke。
- 输出 Sinan POC adapter 设计，并保持 Sinan source-of-truth 边界。
- 实现 RailRig / CameraPath / CameraShot enhancement 设计闭环。

## 3. 本大目标不做什么

M0-M8 内明确不做：

- 不做完整 raw input framework。
- 不发布公共 `@viewrig/sinan` 包。
- 不实现 Babylon / PlayCanvas adapter。
- 不做 CJS dual package。
- 不做完整 Cinemachine-like 生态。
- 不做影视镜头编辑器。
- 不做 concave mesh / navmesh confiner。
- 不让 ViewRig 接管 Sinan CameraShotPlayer 或 DirectorCameraSystem。
- 不把 runtime rig state 保存为 Sinan JSON。

## 4. 架构边界

### 4.1 Source Of Truth

ViewRig source-of-truth：

- Public API contracts。
- Solver config。
- Deterministic trace fixtures。
- CameraState output semantics。

Sinan source-of-truth：

- CameraShot JSON。
- CameraShot schema。
- DirectorCameraSystem。
- Timeline camera track。
- editor command/save/undo。
- preview/scrub/restore rules。

### 4.2 Package Boundary

`@viewrig/core`：

- 只依赖 TypeScript 标准能力和自身模块。
- 输出 `CameraState`。
- 可包含 math、channels、brain、rigs、composer、constraints。

`@viewrig/testing`：

- golden trace runner。
- fake target/channel/probe。
- snapshot helpers。

`@viewrig/adapter-three`：

- 写入 Three camera。
- 不参与 solver 决策。

`@viewrig/debug`：

- 输出 debug metadata / draw commands。
- 不直接绑定 renderer。

Sinan adapter：

- M0-M8 内只写设计和 POC 接入说明。
- 如需代码，先放 Sinan repo 内部，不进入 ViewRig 公共 packages。

## 5. 每轮固定工作流

每轮开始：

1. `git status --short --branch`
2. 阅读本指南当前轮目标。
3. 检查是否有未提交用户改动；不要覆盖或误提交无关改动。
4. 明确本轮最小可验证切片。

每轮执行中：

1. 优先小步实现。
2. 每改一个公共 contract，同步测试和文档。
3. 每引入依赖，确认它不进入 core 禁区。
4. 每新增文件，确认 UTF-8 无 BOM。

每轮结束必须回复并记录：

- 本轮目标。
- 本轮完成内容。
- Debug 自检。
- 架构自检。
- 已运行验证命令与结果。
- commit hash 和 push 结果。
- 下一轮目标。
- 是否消耗缓冲轮。

推进规则：

- 验证失败：不得提交推送，不得进入下一轮。
- 验证通过但提交失败：不得进入下一轮。
- 提交成功但推送失败：不得进入下一轮。
- 推送成功：记录 commit hash 和远端分支，再进入下一轮。

## 6. 每轮提交推送工作流

优先使用项目 git wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "phase: round summary" -Paths path\to\file,other\file
```

如果 staging policy 是 all changes，仍必须先检查 status，确认没有无关 untracked/user changes 被误纳入。

每轮提交信息建议：

```txt
m0: scaffold workspace contract foundation
m1: add deterministic trace runner
m2: implement camera brain cut flow
m3: add follow orbit pose solver
m4: add third person rig trace coverage
m5: add screen zone composer debug data
m6: add world probe constraint fixtures
m7: add three adapter playground smoke
m8: add rail rig camera shot enhancement
```

## 7. Debug 自检模板

每轮都必须回答：

- 当前改动能否用最小 fixture、trace 或用户工作流解释？
- 如果失败，能否定位到 contract、math、trace、brain、rig、composer、constraint、adapter、tooling、browser smoke 或 Sinan mapping 中的一层？
- success、failure、empty、stale、incompatible 状态是否有覆盖？
- 如果 UI/playground 变化，是否添加了可重复 smoke？
- 如果 state/trace/config 变化，是否覆盖 export/import/validate/migration 边界？
- 是否存在 public snapshot 引用内部 mutable scratch 的风险？

## 8. 架构自检模板

每轮都必须回答：

- `CameraState` 是否仍是 core 中心输出？
- core 是否仍无 Three、DOM、React、Sinan、Rapier、宿主 scene graph 依赖？
- 宿主 adapter 是否避免复制 core solver 语义？
- capability/config、binding/mapping、runtime state、debug metadata 是否仍分离？
- 是否把后续 Phase 范围提前拉进当前轮？
- Sinan CameraShot / Director / Timeline source-of-truth 是否保持不变？
- 是否留下无关文件、生成产物或用户改动未处理？

## 9. 分轮安排

### M0：Repository And Contract Foundation

预算：4 轮。

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R1 | 初始化 pnpm workspace、根 `package.json`、`pnpm-workspace.yaml`、基础 scripts | `pnpm --version`、`pnpm install`、docsCheck |
| R2 | 创建 `packages/core`、`packages/testing`、TypeScript references、Vitest 基础 | `pnpm typecheck`、`pnpm test` |
| R3 | 写 Coordinate Convention 文档与 contract tests | `pnpm test -- --run`、`git diff --check` |
| R4 | 定义 `CameraState`、`LensState`、`WorldProbe`、`ControlChannel` 草案并收口 M0 | `pnpm typecheck`、`pnpm test`、docsCheck |

### M1：Math And Trace Core

预算：5 轮。

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R5 | 实现 Vec2 / Vec3 snapshot 和基础运算 | `pnpm test` |
| R6 | 实现 Quat / rotation helper 最小集 | `pnpm test` |
| R7 | 实现 half-life damping 和帧率无关测试 | `pnpm test` |
| R8 | 实现 golden trace runner、fake target/channel/probe fixture | `pnpm test` |
| R9 | Fixed pose solver spike，输出 deterministic CameraState trace | `pnpm typecheck`、`pnpm test` |

### M2：CameraBrain And Blend

预算：5 轮。

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R10 | 实现 `VirtualCamera` 和 evaluate pipeline skeleton | `pnpm test` |
| R11 | 实现 `CameraBrain` add/remove/activate/update | `pnpm test` |
| R12 | 实现 `cut` 和基本 activation policy | `pnpm test` |
| R13 | 实现 `blend` 和连续性 trace | `pnpm test` |
| R14 | 实现 `matchThenBlend` 与 channel inheritance，收口 M2 | `pnpm typecheck`、`pnpm test` |

### M3：Follow / Orbit POC Core

预算：4 轮。

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R15 | 实现 `YawPitchChannel` / `ZoomChannel` | `pnpm test` |
| R16 | 实现 `FollowRig` 最小 pose solver | `pnpm test` |
| R17 | 实现 `OrbitRig` 与 target/yaw/pitch/distance trace | `pnpm test` |
| R18 | 输出 RuntimeCameraPose-compatible mapper 草案和 Sinan POC-1 说明 | `pnpm typecheck`、`pnpm test`、docsCheck |

### M4：First / Third Person MVP

预算：5 轮。

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R19 | 实现 `FirstPersonRig` 最小版 | `pnpm test` |
| R20 | 实现 `ThirdPersonRig` pivot/distance 最小版 | `pnpm test` |
| R21 | 增加 shoulder offset 和 shoulder channel 方案 | `pnpm test` |
| R22 | 增加 yaw/pitch clamp 与 half-life 平滑 | `pnpm test` |
| R23 | FPS/TPS 切换 trace 和跳角回归，收口 M4 | `pnpm typecheck`、`pnpm test` |

### M5：Screen Composer And Debug Data

预算：4 轮。

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R24 | 实现 RectNdc、projection helper、target NDC trace | `pnpm test` |
| R25 | 实现 dead/soft/hard `ScreenZoneComposer` | `pnpm test` |
| R26 | 增加 debug metadata / draw command model | `pnpm test` |
| R27 | 完成 composer 行为文档和 debug data 收口 | `pnpm typecheck`、`pnpm test`、docsCheck |

### M6：WorldProbe Constraints

预算：5 轮。

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R28 | 实现 fake WorldProbe 和 no-probe fallback tests | `pnpm test` |
| R29 | 实现 DistanceClamp / YawPitchClamp | `pnpm test` |
| R30 | 实现 Confiner2D / Confiner3D 最小版 | `pnpm test` |
| R31 | 实现 Collision / Occlusion 最小策略 | `pnpm test` |
| R32 | 对齐 Sinan PhysicsProbe adapter contract 说明并收口 M6 | `pnpm typecheck`、`pnpm test`、docsCheck |

### M7：Adapter And Showcase

预算：6 轮。

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R33 | 创建 `@viewrig/adapter-three`，实现 CameraState 写入 Three camera | `pnpm typecheck`、`pnpm test` |
| R34 | 创建 `examples/three-orbit-playground` | `pnpm build` 或对应 example build |
| R35 | 增加 Playwright/browser smoke，确认 pose 变化可见 | browser smoke |
| R36 | 增加 debug overlay 最小渲染 | browser smoke |
| R37 | 输出 Sinan repo 内部 POC adapter 设计说明 | docsCheck |
| R38 | 收口 M7：adapter/playground/smoke 文档和验证矩阵 | `pnpm typecheck`、`pnpm test`、browser smoke、docsCheck |

### M8：Rail And CameraShot Enhancement

预算：5 轮。

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R39 | 实现 `CameraPath` interface 和 PathSample | `pnpm test` |
| R40 | 实现 `PolylinePath` 和 path sampling trace | `pnpm test` |
| R41 | 实现 `RailRig` fixed/time/input driver | `pnpm test` |
| R42 | 实现 targetProjection driver 和端点回归 | `pnpm test` |
| R43 | 输出 CameraShot optional solver mode 对齐草案，收口 M8 | `pnpm typecheck`、`pnpm test`、docsCheck |

### 全局缓冲和最终验收

| 轮次 | 目标 | 必须验证 |
| --- | --- | --- |
| R44 | 全局缓冲 1：修复前序 Phase 遗留失败或强化 trace | 相关失败验证必须转 PASS |
| R45 | 全局缓冲 2：修复 tooling/browser smoke/Windows path 问题 | 相关失败验证必须转 PASS |
| R46 | 全局缓冲 3：修复 Sinan contract / adapter 边界问题 | docsCheck、相关 tests |
| R47 | 全局缓冲 4：API/docs hardening、回归补漏 | full validation |
| R48 | 最终验收：全仓验证、文档索引、最终报告、tag/release-dry-run 草案 | full validation、git status clean、push 成功 |

## 10. Validation Matrix

通用文档验证：

```powershell
git diff --check
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
```

M0 起新增工程验证后，优先使用 repo scripts：

```powershell
pnpm install
pnpm typecheck
pnpm test
```

当 build script 出现后：

```powershell
pnpm build
```

当 browser smoke 出现后：

```powershell
pnpm test:browser
```

每个 Phase 最后一轮必须运行：

- `git diff --check`
- docsCheck
- `pnpm typecheck`
- `pnpm test`
- 该 Phase 特有 smoke / build / browser 验证

R48 最终验收必须运行：

- 全部 repo validation scripts。
- full tests。
- browser smoke。
- docsCheck。
- `git status --short --branch` 确认干净。
- 远端分支推送成功。

## 11. PASS 标准

大 Goal 完成时必须满足：

- M0-M8 全部完成并推送。
- `@viewrig/core` 无宿主依赖。
- `CameraState`、`LensState`、`WorldProbe`、`ControlChannel` public contract 明确。
- 坐标约定有文档和测试。
- golden trace harness 可稳定输出 deterministic CameraState trace。
- CameraBrain 支持 cut/blend/matchThenBlend。
- Follow/Orbit/FirstPerson/ThirdPerson MVP 可用并有 trace 覆盖。
- ScreenZoneComposer 和 debug metadata 可用。
- WorldProbe constraints 有 fake probe / no-probe fallback 测试。
- adapter-three 和 Three playground 可运行。
- Sinan POC adapter 设计清楚，且不替换 CameraShotPlayer / DirectorCameraSystem。
- RailRig / CameraPath / CameraShot enhancement 方案完成。
- README、架构文档、Sinan 对齐文档保持同步。
- 最终工作区干净，远端 main 已包含全部成果。

## 12. 最终报告模板

最终回复必须包含：

```markdown
## Goal 结果

- 总轮次：
- 已完成 Phase：
- 未完成 Phase：
- 消耗缓冲轮：
- 最终 commit：
- 远端分支：

## 关键交付

- core：
- testing：
- adapters：
- examples：
- Sinan POC：
- docs：

## 验证结果

- pnpm install：
- pnpm typecheck：
- pnpm test：
- pnpm build：
- browser smoke：
- docsCheck：
- git diff --check：

## 架构确认

- core 宿主依赖：
- CameraState contract：
- runtime state/source-of-truth：
- Sinan 边界：

## 风险和后续

- 剩余风险：
- v0.2 建议：
```

## 13. 中止条件

遇到以下情况必须停止并报告，不得强行推进：

- core 必须引入宿主依赖才能继续。
- Sinan contract 与 ViewRig 独立性发生冲突。
- TypeScript/Vitest/pnpm 工具链连续 3 轮无法恢复。
- browser smoke 需要重构当前 Phase 范围外的大量 UI/tooling。
- 远端 push 连续失败且无法确认是否权限或网络问题。
- 用户明确改变 Phase 边界或合作目标。
