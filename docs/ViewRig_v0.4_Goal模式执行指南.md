# ViewRig v0.4 Goal 模式执行指南

日期：2026-06-22
状态：给后续执行者使用的 v0.4 开发指令文档
阶段名称：Release Candidate Decision Gates / Consumer Readiness
总预算：16 轮会话
预算拆分：12 轮主线实现 + 3 轮缓冲修复 + 1 轮最终验收

## 0. 直接给执行者的 Goal Prompt

请在 Goal 模式下执行 ViewRig v0.4 阶段。上一阶段 v0.3 已 PASS，当前 `main` / `origin/main` 最新验收提交为 `ba3956f v0.3: add final validation report`。v0.3 已完成 CI、API governance、TypeDoc artifact、package dry-run、Changesets dry-run、browser smoke、Three smoke 和 Sinan POC handoff，但真实公开发布仍被 owner decision gate 阻塞。

v0.4 的目标不是直接发布 npm，也不是创建 GitHub release/tag，而是把 ViewRig 从“可内部 dry-run 的 release candidate”推进到“真实发布前可审批、可审计、可消费验证”的状态。

本阶段必须完成：

- 建立 release decision register，覆盖 license、package visibility、npm access、trusted publishing/provenance、Changesets version workflow、GitHub tag/release、TypeDoc publication policy。
- 在没有明确 owner approval 的情况下，保持 packages `private: true`、`license: "UNLICENSED"`、`publishConfig.access: "restricted"`，并把缺失决策记录为 PENDING，而不是擅自发布。
- 增加 tarball consumer smoke，证明 `@viewrig/core`、`@viewrig/testing`、`@viewrig/adapter-three` 的打包产物能被临时外部项目安装和导入。
- 将 package dry-run、release dry-run、API docs、CI artifact、consumer smoke 和 GitHub Actions evidence 形成一份可复用 RC evidence bundle。
- 继续保护核心架构边界：`@viewrig/core` 不引入 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或 host scene graph。
- 继续保持 Sinan handoff 为文档和 contract 层，不创建 public `@viewrig/sinan`，不新增 `packages/sinan`。

每一轮都必须完成 Debug 自检、架构自检、验证、提交、推送。验证失败、提交失败或推送失败时，不得进入下一轮。

## 1. 必读上下文

执行前必须阅读：

- `AGENTS.md`
- `README.md`
- `docs/ViewRig_视角_设计文档.md`
- `docs/ViewRig_技术架构设计与开发计划.md`
- `docs/ViewRig_v0.3_Goal模式执行指南.md`
- `docs/ViewRig_v0.3_Final_Report.md`
- `docs/ViewRig_v0.3_Release_Candidate_Checklist.md`
- `docs/ViewRig_v0.3_Package_Metadata_Audit.md`
- `docs/ViewRig_v0.3_Changesets_Dry_Run.md`
- `docs/ViewRig_v0.3_TypeDoc_Artifact_Policy.md`
- `docs/ViewRig_v0.3_Sinan_POC_Handoff.md`
- `.codex/project-ops-workflow.json`
- `.codex/project-git-workflow.json`

上一阶段 PASS 证据：

- `docs/ViewRig_v0.3_Final_Report.md` 状态为 PASS。
- 本地最终验收通过：`pnpm install --frozen-lockfile`、`pnpm api:check`、`pnpm docs:api`、`pnpm docs:check`、`pnpm build`、`pnpm typecheck`、`pnpm test`、`pnpm test:browser`、`pnpm --filter @viewrig/adapter-three test`、`pnpm package:dry-run`、`pnpm release:dry-run`、`Validate.cmd`、`ReleaseDryRun.cmd`。
- 最新远端 CI run 对 `ba3956f` 为 success，并上传 `viewrig-api-docs` artifact。
- packages 仍为 `private: true`、`UNLICENSED`、`publishConfig.access: "restricted"`，没有真实 npm publish、GitHub release 或 tag。

## 2. 本阶段要完成什么

v0.4 的核心是让“发布前还缺什么”从口头风险变成可执行门禁：

- Release decision register：每个发布决策都有 owner、状态、可选路径、默认安全姿态和验收标准。
- License gate：只有 owner 明确选择 license 时，才新增 `LICENSE` 并更新 manifest；否则保持 `UNLICENSED`。
- Package visibility gate：只有 owner 明确批准 public/restricted 策略时，才改变 `private` / `publishConfig.access`；否则继续阻止真实发布。
- Trusted publishing / provenance gate：形成 CI 需要的环境、权限、OIDC/npm 设置和验证步骤；不提交 token，不真实 publish。
- Changesets gate：提供 version workflow 的 dry-run 和 review 流程；不运行 `changeset version` / `changeset publish`，除非 owner 另行明确批准。
- GitHub release gate：提供 tag/release checklist 或安全 dry-run workflow；不创建 tag/release。
- TypeDoc publication gate：决定继续 artifact-only，还是准备 Pages 发布方案；未批准前不启用 Pages 部署。
- Consumer smoke：用本地 packed tarball 在临时外部项目中验证包可安装、可导入、基础 API 可运行。
- RC evidence bundle：汇总本地验证、CI run、artifact、package tarball、consumer smoke 和 release decision status。

## 3. 本阶段不做什么

v0.4 不做：

- 不执行真实 `npm publish`。
- 不运行 `changeset version` 或 `changeset publish`，除非用户在本阶段明确批准。
- 不创建真实 GitHub tag。
- 不创建真实 GitHub release。
- 不把 package 改为 public 或移除 `private: true`，除非 owner 明确批准。
- 不选择 license；只能执行 owner 已选择的 license。
- 不提交 npm token、GitHub secret、私有凭证或本机认证材料。
- 不创建 `@viewrig/sinan` public package。
- 不新增 `packages/sinan`。
- 不把 Sinan schema、editor store、CameraShotPlayer、DirectorCameraSystem 或 runtime adapter 引入 ViewRig core。
- 不把 TypeDoc HTML 直接提交进 git。

如果某一轮需要 owner decision 才能继续实现，执行者必须先把该决策记录为 PENDING，并询问用户。没有明确答复时，采用最安全默认值并继续完成不需要授权的部分；如果该轮核心目标完全依赖授权，则标记该轮 BLOCKED，不得伪造批准。

## 4. 每轮固定工作流

每轮开始：

1. 运行或检查 `git status --short --branch`，确认只处理本阶段相关文件。
2. 阅读本轮涉及的上一轮报告、相关 docs 和源文件。
3. 明确本轮目标、非目标和预计改动范围。

每轮实现：

1. 只修改与本轮目标直接相关的代码、脚本、CI 或文档。
2. 不 stage unrelated untracked files。
3. 不把 generated docs、package dist、playground dist、node_modules、临时 tarball 或 smoke temp project 提交进 git。
4. 新增脚本时优先让它们可重复、可在 CI 中运行、失败输出可定位。

每轮自检回复必须包含：

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

优先使用本项目已配置 wrapper：

```powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "v0.4: round summary" -Paths path\to\file,other\file
```

如果 wrapper 无法满足某个只读检查，可以使用 direct git read-only commands，例如：

```powershell
git diff --check
git log -1 --oneline --decorate
git ls-remote origin refs/heads/main
```

不得 force-push。不得使用 destructive git command。不得把无关用户改动纳入提交。

## 6. Debug 自检模板

每轮都要回答：

- 当前改动是否能用最小 release decision、tarball fixture、consumer smoke、CI job、package dry-run 或 docs artifact workflow 解释？
- 如果失败，能否定位到 decision gate、manifest metadata、pack output、external consumer install、ESM import、API report、TypeDoc、CI artifact、GitHub release checklist 或 Sinan contract 中的一层？
- success、failure、empty、stale、incompatible 状态是否覆盖？
- 如果新增 CLI/script，是否有清晰 exit code 和可读错误？
- 如果涉及 package 输出，是否验证了 export map、types、tarball contents 和外部消费路径？
- 如果涉及 docs/artifact，是否避免提交 generated output？

## 7. 架构自检模板

每轮都要回答：

- `CameraState` 是否仍是 core 的运行时输出契约？
- `@viewrig/core` 是否仍无 Three、DOM、React、Sinan、Rapier、Babylon、PlayCanvas 或 host scene graph 依赖？
- package/release tooling 是否没有倒逼 core 暴露 internal helper？
- adapter-three 是否仍只负责把 `CameraState` 应用到 Three-compatible camera？
- release decision、package metadata、CI workflow、consumer smoke 和 runtime source code 是否保持职责分离？
- Sinan CameraShot / Director / Timeline source-of-truth 是否保持不变？
- 是否避免把 v0.5 或真实 public release 范围提前拉入 v0.4？
- unrelated files、generated outputs、用户改动是否被保留且未误提交？

## 8. 分轮安排

### R1：v0.4 release decision register

目标：

- 审计 v0.3 final report、release candidate checklist 和 remaining blockers。
- 新增 v0.4 release decision register。
- 明确每个 decision 的状态：APPROVED、PENDING、REJECTED、DEFERRED。
- 将 README 链接到 v0.4 guide 和 decision register。

建议交付：

- `docs/ViewRig_v0.4_Release_Decision_Register.md`
- README docs index 更新

验证：

- `git diff --check`
- `pnpm docs:check`

### R2：license gate

目标：

- 建立 license decision gate。
- 如果 owner 已明确选择 license，则新增 `LICENSE` 并一致更新 root/package manifest。
- 如果 owner 未选择，则保持 `UNLICENSED`，记录 public release blocker。

建议交付：

- `docs/ViewRig_v0.4_License_Gate.md`
- 必要时更新 package dry-run 对 license posture 的检查说明

验证：

- `pnpm package:dry-run`
- `pnpm release:dry-run`
- `git diff --check`

### R3：package visibility and npm access gate

目标：

- 明确 private、restricted scoped、public scoped 三种姿态的差异和触发条件。
- 审计 `private`、`publishConfig.access`、exports、files、types、package README。
- 未获批准时保持当前 restricted private posture。

建议交付：

- `docs/ViewRig_v0.4_Package_Visibility_Gate.md`
- 必要的 dry-run guard 增强

验证：

- `pnpm package:dry-run`
- `pnpm release:dry-run`
- `pnpm api:check`

### R4：consumer smoke design

目标：

- 设计本地 tarball consumer smoke。
- 临时外部 consumer project 必须位于 ignored temp path 或系统 temp，不进入 git。
- smoke 至少验证 core/testing/adapter-three 可以从 pack tarball 安装、ESM import、读取基础 exports、运行最小 `CameraState` / adapter apply 示例。

建议交付：

- `docs/ViewRig_v0.4_Consumer_Smoke_Design.md`
- `scripts/package-consumer-smoke.mjs` 草案或实现第一版

验证：

- `pnpm build`
- `pnpm package:dry-run`
- consumer smoke script dry-run
- `git diff --check`

### R5：consumer smoke implementation and CI hook

目标：

- 完成本地 consumer smoke。
- 增加 package script，例如 `pnpm package:consumer-smoke`。
- 将 consumer smoke 接入 CI，确保不提交临时产物。

建议交付：

- `scripts/package-consumer-smoke.mjs`
- `package.json` script
- `.github/workflows/ci.yml` 更新
- `docs/ViewRig_v0.4_Consumer_Smoke.md`

验证：

- `pnpm package:consumer-smoke`
- `pnpm package:dry-run`
- `pnpm release:dry-run`
- `pnpm docs:check`

### R6：API maturity and release-tag policy

目标：

- 审计 API Extractor suppressions 和 public API report。
- 决定 v0.4 是否继续 suppress `ae-missing-release-tag`，或开始为明显稳定 API 添加 `@alpha` / `@beta` / `@public`。
- 不做大规模 API 重命名；只做 release governance 必要调整。

建议交付：

- `docs/ViewRig_v0.4_API_Maturity_Policy.md`
- 必要时更新 API docs comments 或 API Extractor config

验证：

- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`
- `pnpm test`

### R7：Changesets version workflow gate

目标：

- 增加 release-plan / changeset status 的 review 流程。
- 可新增 dry-run script，但不得运行 mutating `changeset version` 或 `changeset publish`。
- 明确何时允许创建 real changeset 文件。

建议交付：

- `docs/ViewRig_v0.4_Changesets_Version_Gate.md`
- 必要的 non-mutating script，例如 `changeset:status`

验证：

- `pnpm changeset:dry-run`
- `pnpm release:dry-run`
- `git diff --check`

### R8：trusted publishing and provenance gate

目标：

- 明确 npm trusted publishing / provenance 所需 GitHub environment、permissions、npm package mapping 和 CI 条件。
- 不提交 secret，不真实 publish。
- 如果新增 workflow，只能是 manual dry-run 或 documentation-only；不能包含可自动发布路径。

建议交付：

- `docs/ViewRig_v0.4_Trusted_Publishing_Gate.md`
- 必要时更新 CI permissions 注释或 release workflow 草案

验证：

- `pnpm release:dry-run`
- `pnpm docs:check`
- `git diff --check`

### R9：GitHub tag/release gate

目标：

- 定义 tag naming、release notes source、artifact checklist、rollback 和 approval policy。
- 不创建真实 tag/release。
- 可新增 release checklist template。

建议交付：

- `docs/ViewRig_v0.4_GitHub_Release_Gate.md`
- `docs/ViewRig_v0.4_Release_Notes_Template.md`

验证：

- `pnpm docs:check`
- `git diff --check`

### R10：TypeDoc publication gate

目标：

- 决定 TypeDoc 继续 artifact-only，还是准备 Pages 发布方案。
- 未获批准时，继续 artifact-only。
- 如果准备 Pages，必须保持为未启用或 manual approval gate，不能默认部署。

建议交付：

- `docs/ViewRig_v0.4_TypeDoc_Publication_Gate.md`
- 必要时更新 `.github/workflows/ci.yml` artifact metadata

验证：

- `pnpm docs:api`
- `pnpm docs:check`
- `git diff --check`

### R11：RC evidence bundle

目标：

- 汇总本地验证、CI run、artifact、package tarball、consumer smoke、release decision status。
- 提供一条可重复的 evidence collection 流程。
- 如果新增脚本，必须只读或写入 ignored temp，不污染 git。

建议交付：

- `docs/ViewRig_v0.4_RC_Evidence_Bundle.md`
- 可选 `scripts/rc-evidence.mjs`

验证：

- `pnpm package:consumer-smoke`
- `pnpm release:dry-run`
- `pnpm docs:check`
- `git diff --check`

### R12：Sinan handoff feedback and public adapter guard

目标：

- 将 Sinan handoff 的反馈入口和 stop conditions 纳入 v0.4 release gate。
- 明确何种 Sinan feedback 只影响 docs，何种 feedback 会阻塞 public release。
- 继续不创建 `@viewrig/sinan` 和 `packages/sinan`。

建议交付：

- `docs/ViewRig_v0.4_Sinan_Feedback_Gate.md`
- 必要时更新 `docs/ViewRig_v0.3_Sinan_POC_Handoff.md` 的后续链接

验证：

- `pnpm docs:check`
- `pnpm boundary:check`
- `git diff --check`

### R13：缓冲 - CI / API / docs 修复

目标：

- 修复 R1-R12 中 CI、API Extractor、TypeDoc、docs guard 的遗留问题。
- 不扩展 v0.4 scope。

验证：

- 相关失败命令必须转 PASS
- `pnpm api:check`
- `pnpm docs:api`
- `pnpm docs:check`

### R14：缓冲 - package / consumer smoke / release dry-run 修复

目标：

- 修复 package dry-run、consumer smoke、Changesets dry-run、release dry-run 遗留问题。
- 不执行真实 release。

验证：

- `pnpm package:consumer-smoke`
- `pnpm package:dry-run`
- `pnpm release:dry-run`

### R15：缓冲 - release decision / Sinan / evidence 修复

目标：

- 修复 release decision register、Sinan feedback gate、RC evidence bundle 的遗漏。
- 确认未批准事项全部仍是 PENDING / DEFERRED，而不是被静默实现。

验证：

- `pnpm docs:check`
- `pnpm boundary:check`
- `git diff --check`

### R16：最终验收

目标：

- 跑完整 v0.4 validation matrix。
- 写入 `docs/ViewRig_v0.4_Final_Report.md`。
- README 链接 final report。
- 确认本地 clean、远端 push 成功、CI run 成功。

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

v0.4 PASS 必须满足：

- v0.3 remaining release-level work 已被拆成清晰 decision gates。
- 未获 owner approval 的事项保持安全默认值，并在 decision register 中标为 PENDING / DEFERRED。
- 没有真实 npm publish、GitHub tag、GitHub release 或 package visibility change。
- tarball consumer smoke 已接入本地验证和 CI。
- package dry-run、consumer smoke、release dry-run 能共同证明 package 产物可审计、可安装、可导入。
- trusted publishing/provenance、Changesets version workflow、GitHub release、TypeDoc publication 都有可执行 gate。
- Sinan handoff feedback 被纳入 release gate，但 ViewRig 仍不接管 Sinan source-of-truth。
- `@viewrig/core` 仍保持 engine-agnostic。
- README、docs、final report 同步更新。
- 最终 validation matrix 全 PASS。
- final commit 已 push 到 `origin/main`，GitHub Actions 成功。

## 10. 最终报告模板

最终报告写入 `docs/ViewRig_v0.4_Final_Report.md`，格式：

```markdown
# ViewRig v0.4 Final Report

Date: 2026-xx-xx
Status: PASS / BLOCKED
Branch: `main`
Final commit: `<hash> <message>`

## 1. Goal Result

- Total rounds:
- Main rounds:
- Buffer rounds:
- Final validation:
- Unfinished v0.4 scope items:
- Remote branch:

## 2. Key Deliverables

- Release decision register:
- License gate:
- Package visibility gate:
- Consumer smoke:
- API maturity:
- Changesets gate:
- Trusted publishing/provenance:
- GitHub release gate:
- TypeDoc publication gate:
- Sinan feedback gate:
- RC evidence bundle:

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

## 4. Decision Status

- License:
- Package visibility:
- npm access:
- trusted publishing/provenance:
- Changesets version workflow:
- GitHub tag/release:
- TypeDoc publication:
- Sinan public adapter:

## 5. Architecture Confirmation

- core boundary:
- adapter boundary:
- package/release boundary:
- Sinan source-of-truth:
- generated output policy:

## 6. Remaining Blockers

- owner approval needed:
- external account/secret setup:
- public release tasks:

## 7. Conclusion

State whether v0.4 is PASS or BLOCKED and whether ViewRig is ready for a real owner-approved public release execution phase.
```

## 11. BLOCKED 条件

立即标记 BLOCKED，而不是绕过：

- 真实 publish、tag、release、package visibility change 或 license change 需要 owner approval，但用户拒绝或不提供。
- consumer smoke 发现 package 产物无法被外部项目安装或导入，且无法在缓冲轮内修复。
- CI 无法通过，而且失败不是外部服务短暂故障。
- 发布 gate 需要 secret/token，而执行者试图提交或打印 secret。
- v0.4 实现要求 core 引入 host engine、DOM、Sinan 或 physics dependency。
- Sinan POC 需要 ViewRig 接管 CameraShotPlayer / DirectorCameraSystem。
- 用户改变 v0.4 范围为真实发布；此时必须先生成新的 release execution guide 或获得明确范围更新。
