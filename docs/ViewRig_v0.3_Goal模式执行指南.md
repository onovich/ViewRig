# ViewRig v0.3 Goal 模式执行指南

日期：2026-06-22  
状态：给后续执行者使用的 v0.3 开发指令文档  
阶段名称：Release Engineering / CI Hardening  
总轮次预算：16 轮  
预算拆分：12 轮主线实现 + 3 轮缓冲修复 + 1 轮最终验收  

## 0. 直接给执行者的 Goal Prompt

请在 Goal 模式下执行 ViewRig v0.3 阶段。上一阶段 v0.2 已 PASS，当前 `main` / `origin/main` 最新验收提交为 `69334d0 v0.2: add final validation report`。v0.3 的目标是把 ViewRig 从“本地 release readiness”推进到“CI 可复现、release 流程可审计、公共 API/文档/包内容可持续守护”的状态。

本阶段必须完成：

- 建立 GitHub Actions 或等价 CI 工作流，覆盖 install、build、typecheck、unit tests、browser smoke、API/docs checks、package dry-run。
- 固化 Playwright 浏览器安装和缓存策略，降低 CI/browser smoke 漂移。
- 从 v0.2 lightweight API report 评估并接入正式 API Extractor，或形成明确的保留/替代决策和迁移边界。
- 完成 TypeDoc 输出策略：本地生成、CI 校验、可选 Pages artifact，但不默认部署。
- 接入 Changesets dry-run / release notes 生成流程，不执行真实 npm publish。
- 完善 package metadata、LICENSE、README/package files、exports、pack 内容审计。
- 强化真实 Three playground / adapter smoke，确保 `adapter-three` 不只停留在 structural writer。
- 输出 Sinan POC handoff package：POC-2 / POC-3 的 fixtures、validation checklist 和集成边界。

每一轮都必须完成 Debug 自检、架构自检、验证、提交、推送。验证失败、提交失败或推送失败时，不得进入下一轮。

## 1. 必读上下文

执行前必须阅读：

- `README.md`
- `AGENTS.md`
- `docs/ViewRig_M0-M8_Final_Report.md`
- `docs/ViewRig_v0.1_API_Surface.md`
- `docs/ViewRig_v0.2_Final_Report.md`
- `docs/ViewRig_v0.2_Goal模式执行指南.md`
- `docs/ViewRig_v0.2_Changesets_And_Provenance.md`
- `docs/ViewRig_v0.2_Package_Dry_Run.md`
- `docs/ViewRig_v0.2_Browser_Smoke.md`
- `docs/ViewRig_v0.2_API_Docs_Workflow.md`
- `docs/ViewRig_v0.2_Three_Integration_Smoke.md`
- `docs/sinan-cooperation/viewrig-sinan-poc-2-follow-orbit-contract-2026-06-21.md`
- `docs/sinan-cooperation/viewrig-sinan-poc-3-camera-shot-enhancement-contract-2026-06-21.md`
- `docs/codex-git-workflow.md`
- `docs/codex-ops-workflow.md`

上一阶段 PASS 证据：

- `docs/ViewRig_v0.2_Final_Report.md` 状态为 complete / PASS。
- final validation 已通过：`pnpm install --frozen-lockfile`、`pnpm api:check`、`pnpm docs:api`、`pnpm docs:check`、`pnpm build`、`pnpm typecheck`、`pnpm test`、`pnpm test:browser`、`pnpm --filter @viewrig/adapter-three test`、`pnpm release:dry-run`、`Validate.cmd`、`ReleaseDryRun.cmd`。
- packages 仍为 `private: true`，没有真实 npm publish、GitHub release 或 tag。

## 2. 本阶段要完成什么

v0.3 的核心是让 v0.2 的本地能力变成团队/CI 可重复的工程流程：

- CI workflow：最少一个主验证 workflow，必要时拆 API/docs/browser smoke。
- Browser policy：Playwright Chromium install/cache/system fallback 策略写进 CI 和文档。
- API governance：正式 API Extractor 或明确保留 lightweight API report 的决策。
- Docs governance：TypeDoc 输出、校验、artifact 策略。
- Release governance：Changesets dry-run、release notes、provenance/trusted publishing plan。
- Package governance：pack dry-run、package metadata、LICENSE、files/exports 审计。
- Adapter governance：真实 Three smoke 与 playground smoke 继续守住 core 边界。
- Sinan handoff：POC-2 / POC-3 不进入 ViewRig 公共 adapter，但能让 Sinan repo 执行者按 checklist 接入。

## 3. 本阶段不做什么

v0.3 不做：

- 不执行真实 `npm publish`。
- 不创建真实 GitHub release。
- 不创建真实 release tag，除非用户另行明确批准。
- 不把 packages 改成 public 发布状态，除非本阶段明确获得用户确认。
- 不创建公共 `@viewrig/sinan` package。
- 不把 Sinan schema、editor store 或 runtime adapter 引入 `@viewrig/core`。
- 不新增 Babylon / PlayCanvas adapter。
- 不做完整 spline editor、raw input framework 或 cinematic editor。

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
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "v0.3: round summary" -Paths path\to\file,other\file
```

每轮提交前必须确认没有无关 untracked/user changes。生成的文档、dist、coverage、generated docs、browser output 必须符合 `.gitignore` / docs policy，不得误提交。

## 6. Debug 自检

每轮必须回答：

- 当前改动是否能用最小 CI job、fixture、browser smoke、package dry-run 或 Sinan checklist 解释？
- 如果失败，能否定位到 dependency install、CI runner、browser install/cache、API report、TypeDoc、package metadata、release dry-run、Three smoke 或 Sinan contract 中的一层？
- success、failure、empty、stale、incompatible 状态是否覆盖？
- 如果 CI workflow 变化，是否有本地等价命令？
- 如果 package exports 或 public API 变化，是否更新 API docs/report？
- 是否存在 generated artifacts 被误提交的风险？

## 7. 架构自检

每轮必须回答：

- `@viewrig/core` 是否仍无 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或宿主 scene graph 依赖？
- CI / docs / release 工具是否没有倒逼 core 暴露 internal helper？
- adapter-three 是否仍只应用 `CameraState`，没有复制 solver 语义？
- debug / playground 逻辑是否没有污染 core runtime？
- Sinan CameraShot / Director / Timeline source-of-truth 是否保持不变？
- 是否避免把 v0.4 范围提前拉入 v0.3？

## 8. 分轮安排

### R1：CI 需求审计与 workflow skeleton

目标：

- 审计 v0.2 final validation matrix。
- 新增 GitHub Actions 或等价 CI workflow skeleton。
- CI 至少包含 checkout、Node/pnpm setup、frozen install。

验证：

- 本地等价命令：`pnpm install --frozen-lockfile`
- workflow syntax check 或人工 YAML review
- `pnpm docs:check`

### R2：CI build / typecheck / unit test

目标：

- CI 加入 `pnpm build`、`pnpm typecheck`、`pnpm test`。
- 文档说明本地与 CI 验证等价关系。

验证：

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`

### R3：CI API / docs / boundary checks

目标：

- CI 加入 `pnpm api:check`、`pnpm docs:api`、`pnpm docs:check`、`pnpm boundary:check`。
- 明确 generated docs artifact / ignore 策略。

验证：

- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm boundary:check`

### R4：CI browser smoke policy

目标：

- CI 加入 `pnpm test:browser`。
- 固化 Playwright Chromium install/cache/system fallback 策略。
- 记录 Windows/local 与 CI 差异。

验证：

- `pnpm exec playwright install chromium`（如本机已有可说明）
- `pnpm test:browser`

### R5：API Extractor 正式化决策

目标：

- 评估是否引入 `@microsoft/api-extractor`。
- 若引入，建立 core/testing/adapter-three API Extractor config。
- 若保留 lightweight report，输出原因、迁移门槛和兼容计划。

验证：

- API check script
- `pnpm typecheck`
- `pnpm test`

### R6：TypeDoc 输出策略与 artifact policy

目标：

- 明确 TypeDoc 输出是本地生成、CI artifact，还是未来 Pages source。
- 如需要，新增 docs workflow artifact 说明。

验证：

- `pnpm docs:api`
- `pnpm docs:check`
- `git diff --check`

### R7：Changesets dry-run

目标：

- 引入或模拟 Changesets dry-run workflow。
- 输出 release notes 生成和 versioning 策略。
- packages 仍保持 private，除非用户明确批准改变。

验证：

- changeset dry-run 或 release notes dry-run
- `pnpm release:dry-run`

### R8：Package metadata / LICENSE / exports audit

目标：

- 补齐或确认 LICENSE、repository、homepage、bugs、README/package files、exports、types、sideEffects。
- 保持 package dry-run 只包含预期产物。

验证：

- `pnpm package:dry-run`
- `pnpm release:dry-run`
- `pnpm docs:check`

### R9：Three adapter real integration hardening

目标：

- 强化真实 Three integration smoke。
- 覆盖 perspective / orthographic / projection update / missing optional fields。

验证：

- `pnpm --filter @viewrig/adapter-three test`
- `pnpm boundary:check`

### R10：Playground smoke hardening

目标：

- 强化 playground smoke 对 canvas、pose JSON、debug overlay、console error 的检查。
- 确认 browser smoke 在 CI/headless 策略下可运行。

验证：

- `pnpm test:browser`

### R11：Sinan POC handoff package

目标：

- 输出 Sinan POC-2 / POC-3 handoff checklist。
- 包含 fixture expectations、validation commands、failure rollback、source-of-truth 边界。

验证：

- `pnpm docs:check`
- `pnpm boundary:check`

### R12：Release candidate audit

目标：

- 汇总 v0.3 release readiness。
- 输出 v0.3 release candidate checklist。
- 不创建真实 tag/release/publish。

验证：

- `pnpm release:dry-run`
- `pnpm api:check`
- `pnpm docs:api`

### R13：缓冲 1

目标：

- 修复 CI/API/docs 相关遗留问题。

验证：

- 相关失败验证必须转 PASS。

### R14：缓冲 2

目标：

- 修复 browser smoke / Playwright / Three integration 遗留问题。

验证：

- `pnpm test:browser`
- `pnpm --filter @viewrig/adapter-three test`

### R15：缓冲 3

目标：

- 修复 package dry-run / Changesets / release governance / Sinan handoff 遗留问题。

验证：

- `pnpm release:dry-run`
- `pnpm docs:check`
- `pnpm boundary:check`

### R16：最终验收

目标：

- 写入 `docs/ViewRig_v0.3_Final_Report.md`。
- 跑完整 validation matrix。
- 确认工作区干净并推送。

验证：

- `pnpm install --frozen-lockfile`
- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:browser`
- `pnpm --filter @viewrig/adapter-three test`
- `pnpm package:dry-run`
- `pnpm release:dry-run`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\ReleaseDryRun.cmd`
- `git diff --check`
- `git status --short --branch`

## 9. PASS 标准

v0.3 PASS 必须满足：

- CI workflow 覆盖 install/build/typecheck/test/API/docs/boundary/browser smoke/package dry-run 或有明确拆分。
- Browser smoke 在本地和 CI 策略下都有可复现路径。
- API governance 明确：正式 API Extractor 或保留 lightweight report 的可审计决策。
- TypeDoc 输出和 artifact policy 明确。
- Changesets / release notes / provenance / trusted publishing plan 更接近真实发布，但未执行真实 publish。
- Package metadata、LICENSE、exports、files、pack 内容通过审计。
- adapter-three 有更完整真实 Three integration smoke。
- Sinan POC handoff package 完成，仍不发布 `@viewrig/sinan`。
- README、API surface、release docs、final report 同步更新。
- 最终 validation matrix 全 PASS。
- 工作区干净，远端 main 已推送。

## 10. 最终报告模板

最终报告写入 `docs/ViewRig_v0.3_Final_Report.md`，格式：

```markdown
# ViewRig v0.3 Final Report

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

- CI：
- Browser smoke：
- API governance：
- TypeDoc/docs：
- Changesets/release governance：
- Package metadata：
- Three adapter：
- Sinan handoff：

## 3. 验证结果

- pnpm install --frozen-lockfile：
- pnpm api:check：
- pnpm docs:api：
- pnpm docs:check：
- pnpm build：
- pnpm typecheck：
- pnpm test：
- pnpm test:browser：
- adapter-three tests：
- package dry-run：
- release dry-run：
- Validate.cmd：
- ReleaseDryRun.cmd：
- git diff --check：

## 4. 架构确认

- core host dependency：
- adapter boundary：
- debug/playground boundary：
- Sinan source-of-truth：
- generated artifacts policy：
- release safety：

## 5. 风险和后续

- 剩余风险：
- v0.4 建议：
```

## 11. 中止条件

遇到以下情况必须停止并报告：

- CI 需要真实 secret、publish token 或 release 权限才能继续。
- Changesets adoption 需要把 packages 改成 public，但用户尚未批准。
- Playwright 在 CI/local 连续 3 轮无法恢复，且没有可接受 fallback。
- Three integration 需要把 Three 引入 core。
- Sinan POC 需要 ViewRig 接管 CameraShotPlayer / DirectorCameraSystem。
- 用户改变 v0.3 范围或发布策略。
