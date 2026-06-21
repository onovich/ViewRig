# ViewRig v0.2 Goal 模式执行指南

日期：2026-06-21  
状态：给后续执行者使用的 v0.2 开发指令文档  
总轮次预算：16 轮  
预算拆分：12 轮主线实现 + 3 轮缓冲修复 + 1 轮最终验收  

## 0. 直接给执行者的 Goal Prompt

请在 Goal 模式下执行 ViewRig v0.2 阶段。上一大 Goal M0-M8 已 PASS，当前 `main` / `origin/main` 最新提交为 `7416eb5 final: complete m0 m8 goal validation`。v0.2 的目标不是重写 v0.1 core，而是把 v0.1 推向更接近可发布、可验证、可接入宿主的工程状态。

本阶段必须完成：

- 接入 API Extractor / TypeDoc，形成公共 API 稳定性和文档生成流程。
- 强化真实 browser smoke：优先引入 Playwright；如环境阻塞，保留清晰 fallback 和证据。
- 强化 adapter-three：从 structural writer 走向真实 Three integration smoke。
- 抽出或明确 debug renderer 包边界，避免 example 层 debug 逻辑扩散。
- 完成 package dry-run / release readiness，不执行真实 npm publish。
- 推进 Sinan POC-2 / POC-3 的本仓配套设计与契约验证，不把 Sinan adapter 发布为 ViewRig 公共包。

每一轮都必须完成 Debug 自检、架构自检、验证、提交、推送。验证失败、提交失败或推送失败时，不得进入下一轮。

## 1. 必读上下文

执行前必须阅读：

- `README.md`
- `AGENTS.md`
- `docs/ViewRig_M0-M8_Final_Report.md`
- `docs/ViewRig_v0.1_API_Surface.md`
- `docs/ViewRig_技术架构设计与开发计划.md`
- `docs/ViewRig_M0-M8_Goal模式执行指南.md`
- `docs/sinan-cooperation/rfc-004-sinan-camera-pose-shot-rig-boundary.md`
- `docs/sinan-cooperation/viewrig-sinan-internal-poc-adapter-2026-06-20.md`
- `docs/sinan-cooperation/viewrig-camera-shot-optional-solver-mode-2026-06-20.md`
- `docs/codex-git-workflow.md`
- `docs/codex-ops-workflow.md`

上一阶段 PASS 证据：

- `docs/ViewRig_M0-M8_Final_Report.md` 状态为 PASS。
- final validation 已通过：`pnpm build`、`pnpm typecheck`、`pnpm test`、`pnpm test:browser`、`pnpm docs:check`、`pnpm boundary:check`、`Validate.cmd`、`git diff --check`。
- `@viewrig/core` 无 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或宿主 scene graph 依赖。

## 2. 本阶段要完成什么

v0.2 需要把 v0.1 的“能跑、能测”推进到“能审 API、能生成文档、能真实 smoke、能 dry-run 发布”：

- API Extractor：生成 API report 或等价 public API guard。
- TypeDoc：生成文档，至少覆盖 core/testing/adapter-three 的 public exports。
- Playwright：真实浏览器 smoke，验证 playground 和 adapter behavior。
- Three integration：使用真实 Three dependency 做 adapter smoke，而不污染 core。
- Debug renderer：明确 debug data 与 debug renderer 的包/示例边界。
- Release readiness：pack dry-run、package metadata、files/exports 检查。
- Sinan POC：补充 POC-2 Showcase Follow/Orbit 与 POC-3 CameraShot Enhancement 的执行契约。

## 3. 本阶段不做什么

v0.2 不做：

- 不发布真实 npm package。
- 不创建公共 `@viewrig/sinan` package。
- 不把 Sinan schema 或 editor store 引入 core。
- 不重写 v0.1 core architecture。
- 不新增 Babylon / PlayCanvas adapter。
- 不做完整 spline/path editor。
- 不做 raw input framework。
- 不做真实 GitHub release 或真实 tag，除非用户另行明确要求。

## 4. 每轮固定工作流

每轮开始：

1. `git status --short --branch`
2. 阅读本指南对应轮次。
3. 检查是否有未提交用户改动；不得覆盖或误提交无关改动。
4. 明确本轮最小可验证切片。

每轮结束回复必须包含：

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

## 5. 每轮通过后提交推送工作流

优先使用项目 git wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "v0.2: round summary" -Paths path\to\file,other\file
```

每轮提交前必须确认没有无关 untracked/user changes。

## 6. Debug 自检

每轮必须回答：

- 当前改动是否能用最小 fixture、test、browser smoke 或 docs workflow 解释？
- 如果失败，能否定位到 API extraction、docs generation、browser smoke、adapter integration、package metadata、Sinan POC contract 或 release dry-run 中的一层？
- success、failure、empty、stale、incompatible 状态是否覆盖？
- 如果 UI/playground 变化，是否有可重复 browser smoke？
- 如果 package exports 或 public API 变化，是否更新 API docs/report？
- 是否存在 generated docs 或 build artifacts 被误提交的风险？

## 7. 架构自检

每轮必须回答：

- `@viewrig/core` 是否仍无 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或宿主 scene graph 依赖？
- API Extractor / TypeDoc 是否只审 public API，不倒逼暴露 internal helper？
- adapter-three 是否仍只应用 `CameraState`，没有复制 solver 语义？
- debug renderer 是否没有污染 core runtime？
- Sinan CameraShot / Director / Timeline source-of-truth 是否保持不变？
- 是否避免把 v0.3 范围提前拉入 v0.2？

## 8. 分轮安排

### R1：API Extractor 方案落地

目标：

- 引入 API Extractor 或最小等价 API report workflow。
- 为 `@viewrig/core` 建立 public API check。

验证：

- `pnpm install`
- `pnpm typecheck`
- API check script
- `pnpm test`

### R2：扩展 API Report 到 workspace 包

目标：

- 覆盖 `@viewrig/testing` 和 `@viewrig/adapter-three`。
- 明确哪些 exports 是 public、beta 或 internal。

验证：

- API check script
- `pnpm typecheck`
- `pnpm test`

### R3：TypeDoc 基础文档生成

目标：

- 引入 TypeDoc。
- 生成 core public docs。
- 确保 generated docs 输出位置不污染仓库，或明确纳入 docs policy。

验证：

- `pnpm docs:api` 或等价命令
- `pnpm docs:check`
- `git diff --check`

### R4：TypeDoc 覆盖 testing / adapter-three

目标：

- TypeDoc 覆盖 workspace public packages。
- README 加入 API docs 使用说明。

验证：

- docs generation
- `pnpm docs:check`
- `pnpm typecheck`

### R5：Playwright 真实 browser smoke

目标：

- 引入 Playwright。
- 为 `examples/three-orbit-playground` 建立真实 browser smoke。
- 如浏览器安装受限，记录 fallback 和本地可复现命令。

验证：

- `pnpm test:browser`
- Playwright smoke

### R6：真实 Three integration smoke

目标：

- adapter-three 使用真实 Three dependency 做 smoke 或 unit integration。
- core 仍不引入 Three。

验证：

- `pnpm boundary:check`
- `pnpm test`
- adapter-three integration smoke

### R7：Playground bundler smoke

目标：

- 让 playground 通过真实 bundler 或更接近真实 Web build 的方式验证。
- 保留现有 lightweight smoke 作为 fallback。

验证：

- playground build
- browser smoke
- `pnpm test:browser`

### R8：Debug Renderer 边界

目标：

- 明确 debug renderer 是新包、adapter 扩展，还是 example 内部模块。
- 如果抽包，创建最小 `@viewrig/debug-three` 或文档化 deferred decision。

验证：

- `pnpm boundary:check`
- `pnpm test`
- browser smoke 若 UI 有变化

### R9：Release Readiness / Pack Dry-Run

目标：

- 检查 package metadata、files、exports、private 状态。
- 增加 pack dry-run scripts。
- 不执行真实 publish。

验证：

- `pnpm build`
- package dry-run scripts
- `pnpm typecheck`

### R10：Changesets / Release Notes 草案

目标：

- 引入或设计 Changesets 流程。
- 输出 v0.2 release notes draft。
- 明确 npm provenance / trusted publishing 后续步骤。

验证：

- release notes docsCheck
- package scripts dry-run

### R11：Sinan POC-2 执行契约

目标：

- 完成 Showcase Follow/Orbit Camera POC 的本仓契约说明。
- 明确 Sinan InputFlow / World / WebRuntime.setCameraPose mapping。
- 不把 Sinan adapter 放入公共 packages。

验证：

- docsCheck
- boundary check

### R12：Sinan POC-3 执行契约

目标：

- 完成 CameraShot Enhancement POC 执行契约。
- 明确 Timeline scrub、restore、fallback、runtime state 不入 JSON。

验证：

- docsCheck
- boundary check

### R13：缓冲 1

目标：

- 修复 API Extractor / TypeDoc / public API report 遗留问题。

验证：

- 相关失败验证必须转 PASS。

### R14：缓冲 2

目标：

- 修复 Playwright / browser smoke / Windows 环境问题。

验证：

- `pnpm test:browser`
- 相关 smoke PASS 或有明确 fallback 证据。

### R15：缓冲 3

目标：

- 修复 release dry-run / package metadata / Sinan POC contract 遗留问题。

验证：

- package dry-run
- docsCheck
- boundary check

### R16：最终验收

目标：

- 更新 v0.2 final report。
- 跑完整 validation matrix。
- 确认工作区干净并推送。

验证：

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:browser`
- `pnpm docs:check`
- `pnpm boundary:check`
- API check
- TypeDoc generation
- package dry-run
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`
- `git diff --check`
- `git status --short --branch`

## 9. PASS 标准

v0.2 PASS 必须满足：

- API Extractor 或等价 API report workflow 可运行。
- TypeDoc 或等价 API docs workflow 可运行。
- Real browser smoke 接入；若 Playwright 环境阻塞，有明确 fallback 和复现说明。
- adapter-three 至少有一个真实 Three integration smoke。
- core boundary check 仍通过。
- Debug renderer/package 边界清楚，不污染 core。
- package dry-run 可执行或明确说明不可执行原因。
- Sinan POC-2 / POC-3 执行契约完成。
- README、API surface、final report 同步更新。
- 最终 validation matrix 全 PASS。
- 工作区干净，远端 main 已推送。

## 10. 最终报告模板

最终报告写入 `docs/ViewRig_v0.2_Final_Report.md`，格式：

```markdown
# ViewRig v0.2 Final Report

日期：
状态：PASS / BLOCKED
分支：
最终 commit：

## 1. Goal 结果

- 总轮次：
- 主线轮：
- 缓冲轮：
- 未完成项：
- 远端分支：

## 2. 关键交付

- API Extractor / API report：
- TypeDoc / API docs：
- Browser smoke：
- Three integration：
- Debug renderer：
- Release readiness：
- Sinan POC：

## 3. 验证结果

- pnpm install --frozen-lockfile：
- pnpm build：
- pnpm typecheck：
- pnpm test：
- pnpm test:browser：
- pnpm docs:check：
- pnpm boundary:check：
- API check：
- TypeDoc generation：
- pack dry-run：
- Validate.cmd：
- git diff --check：

## 4. 架构确认

- core host dependency：
- adapter boundary：
- debug boundary：
- Sinan source-of-truth：
- generated artifacts policy：

## 5. 风险和后续

- 剩余风险：
- v0.3 建议：
```

## 11. 中止条件

遇到以下情况必须停止并报告：

- API Extractor / TypeDoc 要求破坏 public API 边界才能继续。
- Playwright 或 browser install 连续 3 轮无法恢复，且没有可接受 fallback。
- adapter-three integration 需要把 Three 引入 core。
- Sinan POC 需要 ViewRig 接管 CameraShotPlayer / DirectorCameraSystem。
- package dry-run 暴露需要真实 publish credentials 才能继续。
- 用户改变 v0.2 范围或发布策略。
