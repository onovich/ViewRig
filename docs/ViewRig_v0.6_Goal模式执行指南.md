# ViewRig v0.6 Goal 模式执行指南

日期：2026-06-22
状态：给执行者使用的 v0.6 开发指令文档
阶段名称：Real Integration / Examples Hardening
总预算：16 轮会话
预算拆分：12 轮主线实现 + 3 轮缓冲修复 + 1 轮最终验收

## 0. 直接给执行者的 Goal Prompt

请在 Goal 模式下执行 ViewRig v0.6 阶段。上一阶段 v0.5 已由 planner/checker 复验 PASS，当前 `main` / `origin/main` 最新阶段完成提交为 `b134ff9 v0.5: add final validation report`，GitHub Actions run `27945486873` 对该提交为 success，`viewrig-api-docs` artifact 存在且未过期。

v0.5 已经完成 preset composition layer、third-person/orbit/follow/first-person/rail-shot presets、debug/tuning helpers、multi-mode playground、recipes、packed package consumer smoke 和 Sinan feedback alignment。v0.6 的目标是把这些产品能力放进更真实的 Three.js 集成和示例验证路径里，让 ViewRig 从“API 和 playground 可用”推进到“外部开发者能用示例和 smoke 复现常见相机体验”的状态。

本阶段必须完成：

- 建立 v0.6 integration hardening brief，明确真实集成证据、示例体验和 smoke 目标。
- 强化 `@viewrig/adapter-three` 与真实 Three camera/object 的集成证据，证明 `CameraState` 能稳定应用到宿主相机。
- 扩展或重构 `examples/three-orbit-playground` 为更完整的 example gallery，覆盖 third-person、orbit/follow、first-person、rail-shot 的真实可见路径。
- 增加 browser smoke / canvas signal / DOM state / debug overlay 验证，覆盖多模式、参数变化和无 console error。
- 更新 recipes、package README、docs index 和 consumer smoke，让用户能从文档、包产物和示例三条路径使用 v0.5 presets。
- 继续对齐 Sinan POC-2 / POC-3，只提供 integration evidence 和 internal adapter consumption notes，不创建 public Sinan adapter。

每一轮都必须完成 Debug 自检、架构自检、验证、提交、推送。验证失败、提交失败或推送失败时，不得进入下一轮。

## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `README.md`
- `Role.md`
- `docs/ViewRig_视角_设计文档.md`
- `docs/ViewRig_技术架构设计与开发计划.md`
- `docs/ViewRig_M0-M8_Final_Report.md`
- `docs/ViewRig_v0.4_Final_Report.md`
- `docs/ViewRig_v0.5_Goal模式执行指南.md`
- `docs/ViewRig_v0.5_Final_Report.md`
- `docs/ViewRig_v0.5_Product_Usability_Brief.md`
- `docs/ViewRig_v0.5_Preset_API_Design.md`
- `docs/ViewRig_v0.5_Playground_Usability.md`
- `docs/ViewRig_v0.5_Debug_Tuning.md`
- `docs/ViewRig_v0.5_Sinan_Feedback_Alignment.md`
- `docs/recipes/README.md`
- `docs/recipes/third-person-gameplay.md`
- `docs/recipes/orbit-showcase.md`
- `docs/recipes/first-person-gameplay.md`
- `docs/recipes/rail-camera-shot.md`
- `docs/recipes/debug-tuning.md`
- `docs/recipes/sinan-internal-adapter.md`
- `packages/core/src/presets/`
- `packages/adapter-three/src/`
- `examples/three-orbit-playground/`
- `scripts/package-consumer-smoke.mjs`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

上一阶段 PASS 证据：

- `docs/ViewRig_v0.5_Final_Report.md` 状态为 PASS。
- Planner/checker 已复验通过：install、build、typecheck、unit tests、adapter-three smoke、browser smoke、API check、TypeDoc、docs check、boundary check、package dry-run、consumer smoke、release dry-run、`Validate.cmd`、`ReleaseDryRun.cmd`、`git diff --check`。
- GitHub Actions run `27945486873` 对 `b134ff9` 为 success。
- `viewrig-api-docs` artifact id `7789339918` 存在，`expired=false`，`expires_at=2026-09-20T10:13:39Z`。

## 2. 本阶段要完成什么

v0.6 聚焦“真实集成证据”和“可运行示例硬化”：

- Integration brief：梳理 v0.5 presets 到 Three adapter、example gallery、browser smoke、consumer smoke、docs 的真实使用路径。
- Adapter-three evidence：补足真实 Three camera/object 应用 `CameraState` 的测试或 smoke，覆盖 position、quaternion/look direction、lens/FOV、near/far、update matrix 等关键行为。
- Example gallery：让现有 `examples/three-orbit-playground` 或同级 example 能稳定展示 third-person、orbit/follow、first-person、rail-shot，多模式切换不靠文档想象。
- Visual/debug verification：browser smoke 必须验证 canvas nonblank、mode switching、pose/debug text 变化、tuning controls 生效、overlay 可见变化和 no console errors。
- Example ergonomics：保留轻量、无外部资产、可重复构建；避免为了视觉效果引入大资产或复杂 UI。
- Consumer path：packed consumer smoke 应覆盖 core preset 与 adapter-three apply path 的最小组合，证明外部项目可以安装包后跑通。
- Docs/recipes alignment：recipes 和 package README 应指向真实 example workflow，不只列 API。
- Sinan alignment：说明 v0.6 示例如何映射 POC-2 follow/orbit 和 POC-3 rail/camera-shot optional solver mode，仍保持 Sinan source-of-truth。

## 3. 本阶段不做什么

v0.6 不做：

- 不执行真实 `npm publish`。
- 不运行 `changeset version` 或 `changeset publish`。
- 不创建 GitHub tag 或 GitHub release。
- 不改变 package visibility。
- 不改变 license，不新增 `LICENSE`。
- 不启用 TypeDoc public deploy。
- 不创建 public `@viewrig/sinan`。
- 不新增 `packages/sinan`。
- 不实现 Babylon / PlayCanvas / Unity adapter。
- 不创建完整 raw input framework，例如 DOM pointer lock、gamepad、touch binding 包。
- 不创建 cinematic editor、timeline editor、visual node editor 或 asset pipeline。
- 不引入外部模型、贴图、音频或不可重复下载资产。
- 不把 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 引入 `@viewrig/core`。
- 不把 example UI 状态变成 core runtime source-of-truth。

如果真实集成 smoke 暴露 adapter 或 preset contract 问题，优先用最小 fixture 修复并写入 trace；不得通过扩大 release scope、添加 public Sinan package 或绕过 smoke 来收尾。

## 4. 每轮固定工作流

每轮开始：

1. 运行或检查 `git status --short --branch`。
2. 阅读本轮涉及的源文件、测试、docs 和上一轮报告。
3. 明确本轮做什么、不做什么。
4. 如发现无关用户改动或 untracked 文件，保留并避开。

每轮实现：

1. 优先复用 v0.5 presets、existing rigs、adapter-three、playground smoke 和 package smoke。
2. 新增 example 只能消费 public package/API，不把 example-specific code 倒灌进 core。
3. 新增 smoke 必须可重复，避免只靠人工截图或一次性本地观察。
4. 新增 docs 要和实际 API、scripts、examples 一致。
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
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "v0.6: round summary" -Paths path\to\file,other\file
```

只读检查可使用：

```powershell
git diff --check
git diff --stat
git log -1 --oneline --decorate
git ls-remote origin refs/heads/main
```

不得 force-push。不得使用 destructive git command。不得 stage unrelated files。

## 6. Debug 自检模板

每轮都要回答：

- 当前改动是否能用最小 example mode、preset fixture、adapter smoke、browser workflow 或 consumer smoke 解释？
- 如果失败，能否定位到 preset config、adapter-three apply、Three camera state、example UI、browser smoke、package export 或 docs 中的一层？
- success、failure、empty、stale、incompatible、fallback 状态是否覆盖？
- UI 或 canvas 改动是否有可重复 smoke 验证，而不是只靠主观观察？
- public helper 或 package export 变化是否有 unit/golden trace、API report 和 consumer smoke 守卫？
- debug/tuning 数据是否仍只是诊断数据，没有变成 authoring source-of-truth？

## 7. 架构自检模板

每轮都要回答：

- `CameraState` 是否仍是 core 的运行时输出契约？
- `@viewrig/core` 是否仍无 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或 host scene graph 依赖？
- adapter-three 是否只负责把 `CameraState` 应用到 Three-compatible camera，没有复制 solver 语义？
- examples 是否仍在 example/adapter 边界内，没有影响 core engine-agnostic 设计？
- package exports、API docs、consumer smoke 是否没有倒逼暴露 internal helper？
- Sinan CameraShot / Director / Timeline source-of-truth 是否保持不变？
- 是否避免把真实发布、public adapter、input package 或 editor scope 拉进 v0.6？
- unrelated files、generated outputs、用户改动是否被保留且未误提交？

## 8. 分轮安排

### R1：Integration hardening inventory and brief

目标：

- 审计 v0.5 presets、adapter-three、example、browser smoke、consumer smoke 和 recipes。
- 输出 v0.6 integration hardening brief，定义真实 Three 集成证据和 example gallery 验收标准。
- 更新 README 链接到 v0.6 guide 和 brief。

建议交付：

- `docs/ViewRig_v0.6_Integration_Hardening_Brief.md`
- README docs index 更新

验证：

- `pnpm docs:check`
- `git diff --check`

### R2：Adapter-three real camera apply audit

目标：

- 审计 adapter-three 对 `CameraState` 的真实应用行为。
- 补足 position、orientation、lens/FOV、near/far、matrix update 等最小测试或 fixture。
- 不复制 core solver，只验证 apply contract。

建议交付：

- adapter-three tests / fixtures
- `docs/ViewRig_v0.6_Adapter_Three_Integration.md`

验证：

- `pnpm --filter @viewrig/adapter-three test`
- `pnpm boundary:check`
- `git diff --check`

### R3：Shared example gallery architecture

目标：

- 为 `examples/three-orbit-playground` 建立清晰的 mode/gallery data structure。
- 复用 v0.5 presets，减少手写分支和重复 solver glue。
- 保持 lightweight fallback 可构建。

建议交付：

- example gallery mode data
- shared preset evaluation/apply path
- minimal smoke hooks

验证：

- `pnpm --dir examples/three-orbit-playground build`
- `pnpm test:browser`
- `git diff --check`

### R4：Third-person real integration scene

目标：

- 提供 third-person gameplay scene，能展示 target movement、shoulder/distance/tuning、debug summary。
- smoke 覆盖 pose/debug text 随控件变化。

验证：

- `pnpm test`
- `pnpm test:browser`
- `pnpm docs:check`

### R5：Orbit/follow real integration scene

目标：

- 提供 orbit/follow showcase scene，覆盖 object viewer / actor follow 路径。
- 对齐 Sinan POC-2 follow/orbit usage，不把 InputFlow 或 source selector 做进 ViewRig。

验证：

- `pnpm test`
- `pnpm test:browser`
- `pnpm boundary:check`

### R6：First-person real integration scene

目标：

- 提供 first-person scene，覆盖 eye offset、pitch clamp、look tuning 和 camera apply path。
- smoke 覆盖 first-person mode 切换和 pose变化。

验证：

- `pnpm test`
- `pnpm test:browser`
- `pnpm api:check`

### R7：Rail/camera-shot real integration scene

目标：

- 提供 rail/camera-shot scene，覆盖 railT、duration、scrub/time driver、debug/tuning metadata。
- 对齐 Sinan POC-3 optional solver mode，但不接管 Sinan CameraShot schema。

验证：

- `pnpm test`
- `pnpm test:browser`
- `pnpm boundary:check`

### R8：Example controls and debug overlay polish

目标：

- 统一 mode switch、tuning controls、debug overlay、pose readout 和 error/fallback 状态。
- 保证文本不溢出、控件不互相遮挡、canvas 尺寸稳定。

验证：

- `pnpm test:browser`
- `pnpm docs:check`
- `git diff --check`

### R9：Browser smoke matrix hardening

目标：

- Browser smoke 覆盖所有 v0.6 gallery modes。
- 验证 canvas nonblank、mode switching、tuning value change、overlay visible change、no console errors。
- 记录 smoke 设计。

建议交付：

- updated smoke script
- `docs/ViewRig_v0.6_Browser_Smoke.md`

验证：

- `pnpm test:browser`
- `git diff --check`

### R10：Consumer smoke for core + adapter-three path

目标：

- 更新 `scripts/package-consumer-smoke.mjs`，让 packed consumer 导入 core presets 和 adapter-three，并执行最小 apply path。
- 不要求外部消费者启动真实浏览器。

验证：

- `pnpm package:consumer-smoke`
- `pnpm package:dry-run`
- `pnpm release:dry-run`

### R11：Docs and recipes alignment

目标：

- 更新 package README、recipes、README docs index，指向真实 example workflow。
- 增加“从 preset 到 Three camera”的最小步骤说明。

建议交付：

- updated `packages/core/README.md`
- updated `docs/recipes/*.md`
- `docs/ViewRig_v0.6_Example_Gallery.md`

验证：

- `pnpm docs:check`
- `pnpm docs:api`
- `git diff --check`

### R12：Sinan alignment and release boundary audit

目标：

- 更新 Sinan alignment，说明 v0.6 示例如何帮助 POC-2/POC-3 内部消费。
- 明确仍无 public `@viewrig/sinan`、`packages/sinan`、真实 release action。

建议交付：

- `docs/ViewRig_v0.6_Sinan_Integration_Alignment.md`
- release boundary audit notes

验证：

- `pnpm boundary:check`
- `pnpm docs:check`
- `git diff --check`

### R13：缓冲 - adapter/example/browser flake 修复

目标：

- 修复 R1-R12 中 adapter apply、example mode、browser smoke flake 或 canvas signal 问题。

验证：

- 相关失败命令必须转 PASS
- `pnpm --filter @viewrig/adapter-three test`
- `pnpm test:browser`

### R14：缓冲 - API/docs/package 修复

目标：

- 修复 API Extractor、TypeDoc、docs guard、package dry-run、consumer smoke 遗留问题。

验证：

- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm package:consumer-smoke`

### R15：缓冲 - CI/release boundary 修复

目标：

- 修复 CI-only failure、artifact generation、release dry-run 或 boundary audit 问题。
- 确认仍无真实发布行为。

验证：

- `pnpm release:dry-run`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd`

### R16：最终验收

目标：

- 跑完整 v0.6 validation matrix。
- 写入 `docs/ViewRig_v0.6_Final_Report.md`。
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

v0.6 PASS 必须满足：

- adapter-three 有真实 camera apply evidence，覆盖核心 `CameraState` 应用行为。
- Example gallery 至少可运行展示 third-person、orbit/follow、first-person、rail-shot 的真实可见路径。
- Browser smoke 覆盖所有主要 gallery modes、canvas signal、DOM/debug state、tuning changes 和 no console errors。
- Packed consumer smoke 覆盖 core preset 与 adapter-three 最小消费路径。
- Recipes、package README、README docs index 与实际 scripts/examples/API 对齐。
- API Extractor、TypeDoc、docs guard、boundary check 全 PASS。
- `@viewrig/core` 仍 engine-agnostic。
- Sinan 仍是 docs/contract handoff，不新增 public adapter。
- 没有 npm publish、package visibility change、license change、GitHub tag/release 或 TypeDoc public deploy。
- final commit 已 push 到 `origin/main`，GitHub Actions 成功。

## 10. 最终报告模板

最终报告写入 `docs/ViewRig_v0.6_Final_Report.md`，格式：

```markdown
# ViewRig v0.6 Final Report

Date: 2026-xx-xx
Status: PASS / BLOCKED
Branch: `main`
Final commit: `<hash> <message>`

## 1. Goal Result

- Total rounds:
- Main rounds:
- Buffer rounds:
- Final validation:
- Unfinished v0.6 scope items:
- Remote branch:

## 2. Key Deliverables

- Adapter-three integration:
- Example gallery:
- Browser smoke:
- Consumer smoke:
- Docs/recipes:
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
- adapter boundary:
- example boundary:
- package/release boundary:
- Sinan source-of-truth:
- generated output policy:

## 5. Remaining Work

- product polish:
- release decisions:
- future adapters:
- docs/examples:

## 6. Conclusion

State whether v0.6 is PASS or BLOCKED and whether ViewRig is ready for an owner-approved release execution phase, another product-hardening phase, or a future adapter phase.
```

## 11. BLOCKED 条件

立即标记 BLOCKED，而不是绕过：

- Real integration smoke 需要 core 引入 Three、DOM、Sinan 或 physics dependency。
- adapter-three 复制 solver 语义，导致与 core rigs/constraints/composer 分叉。
- Example gallery 无法稳定构建或 browser smoke 无法稳定验证核心用户 workflow。
- Consumer smoke 发现 package 产物无法导入 core presets 或 adapter-three，且缓冲轮内无法修复。
- API Extractor 发现 public API 被无意扩张，且无法在缓冲轮内收敛。
- v0.6 实现需要真实 release、license change、package visibility change 或 tag/release。
- Sinan POC 需要 ViewRig 接管 CameraShotPlayer / DirectorCameraSystem。
- 用户改变范围为真实发布、新 public adapter 或完整 editor；此时必须停止并生成新的 goal guide。
