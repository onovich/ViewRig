# ViewRig v0.5 Goal 模式执行指南

日期：2026-06-22
状态：给执行者使用的 v0.5 开发指令文档
阶段名称：Product Usability / Camera Experience Hardening
总预算：16 轮会话
预算拆分：12 轮主线实现 + 3 轮缓冲修复 + 1 轮最终验收

## 0. 直接给执行者的 Goal Prompt

请在 Goal 模式下执行 ViewRig v0.5 阶段。上一阶段 v0.4 已由 planner/checker 验收 PASS，当前 `main` / `origin/main` 最新验收记录提交为 `170a14b workflow: record v0.4 check result`。v0.4 已把真实发布前的 release decision gates、consumer tarball smoke、CI evidence 和 Sinan feedback gate 建好，但 owner 决策明确：下一阶段不做真实发布，转向产品能力研发。

v0.5 的目标是让 ViewRig 从“算法、测试和发布门禁都成立”推进到“开发者拿来就能调出常见游戏相机”的状态。重点是 presets、recipes、playground usability、debug/tuning 和真实消费路径，而不是 npm publish。

本阶段必须完成：

- 设计并实现面向用户的 core presets / helpers，让 third-person、orbit、first-person、rail 等常见相机用更少代码组合出来。
- 保持 presets 只是 core 纯数据组合层，不引入 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或 host scene graph。
- 增强 playground，让使用者能看到常见相机模式、参数调整、debug/tuning 信息和基础交互反馈。
- 增加 recipes / tutorial 文档，把现有低层 API 串成可复制的用户工作流。
- 增加 preset golden traces、browser smoke、consumer smoke 和 API/doc guards，证明新入口可测试、可打包、可消费。
- 将 Sinan POC-2 / POC-3 反馈作为约束输入，验证新 presets 不破坏 Sinan source-of-truth 边界。

每一轮都必须完成 Debug 自检、架构自检、验证、提交、推送。验证失败、提交失败或推送失败时，不得进入下一轮。

## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `README.md`
- `Role.md`
- `docs/ViewRig_视角_设计文档.md`
- `docs/ViewRig_技术架构设计与开发计划.md`
- `docs/ViewRig_M0-M8_Final_Report.md`
- `docs/ViewRig_v0.4_Goal模式执行指南.md`
- `docs/ViewRig_v0.4_Final_Report.md`
- `docs/ViewRig_v0.4_Release_Decision_Register.md`
- `docs/ViewRig_v0.4_Consumer_Smoke.md`
- `docs/ViewRig_v0.4_Sinan_Feedback_Gate.md`
- `docs/ViewRig_v0.3_Sinan_POC_Handoff.md`
- `docs/sinan-cooperation/viewrig-sinan-poc-2-follow-orbit-contract-2026-06-21.md`
- `docs/sinan-cooperation/viewrig-sinan-poc-3-camera-shot-enhancement-contract-2026-06-21.md`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

上一阶段 PASS 证据：

- `docs/ViewRig_v0.4_Final_Report.md` 状态为 PASS。
- Planner/checker 复验通过：install、build、typecheck、unit tests、adapter-three smoke、browser smoke、API check、TypeDoc、docs check、boundary check、package dry-run、consumer smoke、release dry-run、`Validate.cmd`、`ReleaseDryRun.cmd`。
- GitHub Actions `27941864060` 对 `170a14b` 为 success，`viewrig-api-docs` artifact 存在且未过期。
- owner 已明确同意 v0.5 走产品能力研发路线，暂缓真实发布。

## 2. 本阶段要完成什么

v0.5 聚焦“可用性”和“相机体验硬化”：

- Usability inventory：梳理当前 core API 对外使用路径，识别 presets、recipes、playground 和 debug/tuning 的缺口。
- Preset layer：新增 `packages/core/src/presets/` 或等价结构，提供组合 helpers，而不是重写 solver。
- Third-person preset：让常见第三人称跟随、越肩、碰撞/距离/构图配置可以用一个稳定入口创建。
- Orbit/follow preset：让展示、角色观察、Showcase follow/orbit POC 更容易配置。
- First-person / rail preset：提供轻量入口和 trace，覆盖第一人称视角和叙事/轨道镜头。
- Debug/tuning data：让 preset 输出或 companion helper 能清楚暴露 active camera id、mode、channel values、composer zone、constraint result、rail t、blend progress 等调参信息。
- Playground usability：把 `examples/three-orbit-playground` 推进到更像产品体验的 multi-mode playground，至少覆盖 orbit 和 third-person；若范围允许，加入 first-person 或 rail tab。
- Recipes：补齐“第三人称相机”“orbit 展示相机”“第一人称相机”“rail/camera shot”“Sinan 内部 adapter 消费 ViewRig”的用户文档。
- Consumer path：更新 `package:consumer-smoke` 或新增 fixture，证明新 presets 能从 packed package 被外部项目导入和运行。
- API governance：API Extractor reports 必须反映新 public surface；避免暴露不成熟 internal helper。

## 3. 本阶段不做什么

v0.5 不做：

- 不执行真实 `npm publish`。
- 不运行 `changeset version` 或 `changeset publish`。
- 不创建 GitHub tag 或 GitHub release。
- 不改变 package visibility。
- 不改变 license，不新增 `LICENSE`。
- 不启用 TypeDoc public deploy。
- 不创建 public `@viewrig/sinan`。
- 不新增 `packages/sinan`。
- 不创建完整 raw input framework，例如 DOM pointer lock/gamepad/touch binding 包。
- 不实现 Babylon / PlayCanvas adapter。
- 不做完整 cinematic editor、timeline editor 或 visual node editor。
- 不把 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 引入 `@viewrig/core`。
- 不把 playground UI 逻辑倒灌进 core。
- 不承诺 public API stable；v0.5 仍允许 API 通过 API report 审查后演进。

如果实现 preset 时发现需要改变底层 solver contract，必须先用最小 trace 证明必要性，并在本轮架构自检中说明为何不是 helper 层问题。

## 4. 每轮固定工作流

每轮开始：

1. 运行或检查 `git status --short --branch`。
2. 阅读本轮涉及的源文件、测试、docs 和上一轮报告。
3. 明确本轮做什么、不做什么。
4. 如发现无关用户改动或 untracked 文件，保留并避开。

每轮实现：

1. 优先复用现有 solver、channels、constraints、composer、debug draw 和 testing fixtures。
2. 新增 preset 只能组合 core 公共/内部模块，不能复制 solver 语义。
3. 新增 playground 功能必须有可重复 smoke 验证；避免只靠人工截图。
4. 新增 docs 要和实际 API/commands 一致。
5. 不提交 generated docs、dist、node_modules、临时 consumer smoke 项目或浏览器构建产物。

每轮回复必须包含：

- 本轮目标
- 本轮完成内容
- Debug 自检
- 架构自检
- 已运行验证命令与结果
- commit hash 和 push 结果
- 下一轮目标
- 是否消耗缓冲轮

推进规则：

- 验证失败：不得提交推送，不得进入下一轮。
- 验证通过但提交失败：不得进入下一轮。
- 提交成功但推送失败：不得进入下一轮。
- 推送成功：记录 commit hash 和远端分支，然后进入下一轮。

## 5. 每轮通过后提交推送工作流

优先使用本项目 wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "v0.5: round summary" -Paths path\to\file,other\file
```

如果只需要只读检查，可以使用：

```powershell
git diff --check
git diff --stat
git log -1 --oneline --decorate
git ls-remote origin refs/heads/main
```

不得 force-push。不得使用 destructive git command。不得 stage unrelated files。

## 6. Debug 自检模板

每轮都要回答：

- 当前改动是否能用最小 preset、recipe、trace、playground workflow 或 consumer smoke 解释？
- 如果失败，能否定位到 preset config、solver composition、channel inheritance、composer/constraint order、debug metadata、playground UI、browser smoke、package export 或 docs 中的一层？
- success、failure、empty、stale、incompatible、fallback 状态是否覆盖？
- 如果新增 playground UI，是否有可重复 smoke 或 canvas/pixel/DOM 状态验证？
- 如果新增 public helper，是否有 unit/golden trace 和 API report 守卫？
- 如果新增 debug/tuning 数据，是否避免变成 runtime source-of-truth？

## 7. 架构自检模板

每轮都要回答：

- `CameraState` 是否仍是 core 的运行时输出契约？
- `@viewrig/core` 是否仍无 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或 host scene graph 依赖？
- presets 是否只是组合层，而不是第二套 solver？
- playground 是否仍在 examples/adapter 边界内，没有影响 core engine-agnostic 设计？
- package exports、API docs、consumer smoke 是否没有倒逼暴露 internal helper？
- Sinan CameraShot / Director / Timeline source-of-truth 是否保持不变？
- 是否避免把真实发布、public adapter、input package 或 editor scope 拉进 v0.5？
- unrelated files、generated outputs、用户改动是否被保留且未误提交？

## 8. 分轮安排

### R1：Usability inventory and v0.5 product brief

目标：

- 审计当前 API、examples、docs、consumer smoke 和 Sinan feedback gate。
- 输出 v0.5 product usability brief：目标用户、首屏体验、必备 presets、recipes 和 smoke 验收。
- 更新 README 链接到 v0.5 guide 和 brief。

建议交付：

- `docs/ViewRig_v0.5_Product_Usability_Brief.md`
- README docs index 更新

验证：

- `pnpm docs:check`
- `git diff --check`

### R2：Preset architecture and API design

目标：

- 设计 preset layer 的目录、命名、config shape、debug/tuning output 和 export policy。
- 明确 presets 与 existing rigs/channels/composer/constraints 的关系。
- 不实现大规模 runtime 行为，只建立最小 API contract 和测试骨架。

建议交付：

- `docs/ViewRig_v0.5_Preset_API_Design.md`
- `packages/core/src/presets/` 初始结构
- API tests 或 type-level usage tests

验证：

- `pnpm test`
- `pnpm api:check`
- `pnpm docs:check`
- `git diff --check`

### R3：Third-person gameplay preset

目标：

- 实现第三人称 preset，组合 target、yaw/pitch、zoom/distance、shoulder、composer、distance/collision/confiner guard。
- 输出 deterministic trace，覆盖 default、over-shoulder、collision fallback、composer debug。

建议交付：

- `packages/core/src/presets/ThirdPersonPreset.ts`
- tests / golden traces
- docs recipe draft

验证：

- `pnpm test`
- `pnpm api:check`
- `pnpm docs:check`

### R4：Orbit and follow showcase presets

目标：

- 实现 orbit/follow presets，服务 Showcase、object viewer、character select 和 Sinan POC-2 follow/orbit 场景。
- 确认 input/channel state 不被写入 host authoring JSON。

建议交付：

- `packages/core/src/presets/OrbitPreset.ts`
- `packages/core/src/presets/FollowPreset.ts`
- tests / traces
- Sinan POC-2 mapping note 更新

验证：

- `pnpm test`
- `pnpm api:check`
- `pnpm boundary:check`

### R5：First-person and rail/camera-shot presets

目标：

- 实现 first-person preset 和 rail/camera-shot preset helper。
- 覆盖 first-person pitch clamp、eye offset、rail time/input/targetProjection driver 的 recipe-level入口。
- 对齐 Sinan POC-3 CameraShot optional solver mode，但不引入 Sinan package。

建议交付：

- `packages/core/src/presets/FirstPersonPreset.ts`
- `packages/core/src/presets/RailShotPreset.ts`
- tests / traces
- CameraShot recipe draft

验证：

- `pnpm test`
- `pnpm api:check`
- `pnpm boundary:check`

### R6：Debug and tuning helpers

目标：

- 增强 debug/tuning 数据模型，让 presets 能输出可读状态：mode、camera id、channels、composer zone、constraint result、rail t、blend progress。
- Debug/tuning 只能是诊断数据，不能成为 authoring source-of-truth。

建议交付：

- core debug helper 或 preset debug summary
- tests
- `docs/ViewRig_v0.5_Debug_Tuning.md`

验证：

- `pnpm test`
- `pnpm docs:check`
- `pnpm api:check`

### R7：Multi-mode playground foundation

目标：

- 将 `examples/three-orbit-playground` 扩展为 multi-mode playground 或新增同级 product playground。
- 至少支持 orbit 和 third-person mode。
- 保持 Three/DOM/UI 仅在 example 边界。

建议交付：

- playground source updates
- mode controls
- pose/debug state rendering
- smoke script 初步更新

验证：

- `pnpm --dir examples/three-orbit-playground build`
- `pnpm test:browser`
- `git diff --check`

### R8：Playground tuning controls and visual smoke

目标：

- 增加 tuning controls：distance、shoulder、damping、composer zone、debug toggle、mode switch。
- smoke 必须验证 DOM state、canvas nonblank、mode switching、debug overlay visible change 和 no console errors。

建议交付：

- playground controls
- smoke coverage
- `docs/ViewRig_v0.5_Playground_Usability.md`

验证：

- `pnpm test:browser`
- `pnpm docs:check`
- `git diff --check`

### R9：Recipes and tutorial docs

目标：

- 写面向用户的 recipes，而不是只写内部设计。
- 至少覆盖：third-person gameplay、orbit showcase、first-person、rail/camera-shot、debug/tuning、Sinan internal adapter consumption。

建议交付：

- `docs/recipes/third-person-camera.md`
- `docs/recipes/orbit-showcase-camera.md`
- `docs/recipes/first-person-camera.md`
- `docs/recipes/rail-camera-shot.md`
- `docs/recipes/debug-tuning.md`
- `docs/recipes/sinan-internal-adapter.md`

验证：

- `pnpm docs:check`
- `git diff --check`

### R10：Consumer smoke for presets

目标：

- 更新 `scripts/package-consumer-smoke.mjs`，从 packed package 导入并执行新增 presets。
- 验证 ESM imports、types/export map、basic preset workflow。

建议交付：

- consumer smoke updates
- package dry-run guard updates if needed
- docs note

验证：

- `pnpm package:consumer-smoke`
- `pnpm package:dry-run`
- `pnpm release:dry-run`

### R11：API docs and examples alignment

目标：

- 确认 TypeDoc 公开入口、README、package README 和 recipes 与新 presets 一致。
- 更新 package README 示例，但不承诺 stable public release tags。

建议交付：

- package README updates
- TypeDoc comments for presets where useful
- API report updates

验证：

- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm package:consumer-smoke`

### R12：Sinan feedback alignment and release boundary audit

目标：

- 检查 v0.5 presets 是否支持 Sinan POC-2/POC-3 的 internal adapter consumption。
- 更新 Sinan feedback gate 或 handoff notes 的 v0.5 link。
- 确认没有 public `@viewrig/sinan`、`packages/sinan`、Sinan schema ownership。

建议交付：

- `docs/ViewRig_v0.5_Sinan_Feedback_Alignment.md`
- Sinan docs link updates
- boundary audit report

验证：

- `pnpm boundary:check`
- `pnpm docs:check`
- `git diff --check`

### R13：缓冲 - API / preset / trace 修复

目标：

- 修复 R1-R12 中 preset API、trace、API Extractor、TypeDoc 遗留问题。
- 不扩大 scope。

验证：

- 相关失败命令必须转 PASS
- `pnpm test`
- `pnpm api:check`
- `pnpm docs:api`

### R14：缓冲 - playground / browser smoke 修复

目标：

- 修复 playground UI、browser smoke、canvas/debug/tuning 验证中的问题。
- 不新增大型 UI/devtools。

验证：

- `pnpm test:browser`
- `pnpm docs:check`
- `git diff --check`

### R15：缓冲 - package / consumer / docs 修复

目标：

- 修复 package dry-run、consumer smoke、recipe docs、README/package README alignment。
- 确认仍无真实发布行为。

验证：

- `pnpm package:dry-run`
- `pnpm package:consumer-smoke`
- `pnpm release:dry-run`
- `pnpm docs:check`

### R16：最终验收

目标：

- 跑完整 v0.5 validation matrix。
- 写入 `docs/ViewRig_v0.5_Final_Report.md`。
- README 链接 final report。
- 确认本地 clean、push 成功、GitHub Actions 成功、artifact 存在。

最终验证：

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter @viewrig/adapter-three test`
- `pnpm test:browser`
- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm boundary:check`
- `pnpm package:dry-run`
- `pnpm package:consumer-smoke`
- `pnpm release:dry-run`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd`
- `git diff --check`
- `git status --short --branch`
- GitHub Actions latest run for final commit is success
- `viewrig-api-docs` artifact exists and is not expired

## 9. PASS 标准

v0.5 PASS 必须满足：

- 至少 third-person、orbit/follow、first-person、rail/camera-shot 中的核心 presets 有可测试入口。
- Presets 复用既有 solvers，不形成第二套 camera semantics。
- Preset workflows 有 unit/golden trace coverage。
- Playground 能展示多模式和 tuning/debug workflow，并有 browser smoke 覆盖。
- Recipes 能让用户复制最小工作流，而不是只读 API 列表。
- `package:consumer-smoke` 验证 packed package 可以导入和执行新 presets。
- API Extractor、TypeDoc、docs guard、boundary check 全 PASS。
- `@viewrig/core` 仍 engine-agnostic。
- Sinan 仍是 docs/contract handoff，不新增 public adapter。
- 没有 npm publish、package visibility change、license change、GitHub tag/release 或 TypeDoc public deploy。
- README、package README、recipes、final report 同步更新。
- final commit 已 push 到 `origin/main`，GitHub Actions 成功。

## 10. 最终报告模板

最终报告写入 `docs/ViewRig_v0.5_Final_Report.md`，格式：

```markdown
# ViewRig v0.5 Final Report

Date: 2026-xx-xx
Status: PASS / BLOCKED
Branch: `main`
Final commit: `<hash> <message>`

## 1. Goal Result

- Total rounds:
- Main rounds:
- Buffer rounds:
- Final validation:
- Unfinished v0.5 scope items:
- Remote branch:

## 2. Key Deliverables

- Presets:
- Debug/tuning:
- Playground:
- Recipes:
- Consumer smoke:
- API/docs:
- Sinan alignment:

## 3. Validation Result

- install:
- build:
- typecheck:
- unit tests:
- adapter-three smoke:
- browser smoke:
- API check:
- API docs:
- docs check:
- boundary check:
- package dry-run:
- consumer smoke:
- release dry-run:
- wrapper validation:
- GitHub Actions:
- artifact inspection:
- git status:

## 4. Architecture Confirmation

- core boundary:
- preset composition boundary:
- playground/example boundary:
- package/release boundary:
- Sinan source-of-truth:
- generated output policy:

## 5. Remaining Work

- product polish:
- release decisions:
- future adapters:
- docs/examples:

## 6. Conclusion

State whether v0.5 is PASS or BLOCKED and whether ViewRig is ready for another product-hardening phase or an owner-approved release execution phase.
```

## 11. BLOCKED 条件

立即标记 BLOCKED，而不是绕过：

- Presets 需要 core 引入 host engine、DOM、Sinan 或 physics dependency。
- Presets 复制 solver 语义，导致与 existing rigs/constraints/composer 分叉。
- Playground smoke 无法稳定验证核心用户 workflow。
- Consumer smoke 发现 package 产物无法导入新 presets，且缓冲轮内无法修复。
- API Extractor 发现 public API 被无意扩张，且无法在缓冲轮内收敛。
- v0.5 实现需要真实 release、license change、package visibility change 或 tag/release。
- Sinan POC 需要 ViewRig 接管 CameraShotPlayer / DirectorCameraSystem。
- 用户改变范围为真实发布或新 adapter；此时必须停止并生成新的 goal guide。
