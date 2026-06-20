# ViewRig M0 Validation Report

日期：2026-06-20  
阶段：M0 Repository And Contract Foundation  
状态：PASS

## 1. 完成范围

- R1：初始化 pnpm workspace、根 `package.json`、`pnpm-workspace.yaml`、基础 scripts 和 lockfile。
- R2：创建 `packages/core`、`packages/testing`、TypeScript project references 与 Vitest 基础。
- R3：新增 coordinate convention 文档、默认坐标 contract 和 NDC contract tests。
- R4：新增 `CameraState`、`LensState`、`WorldProbe`、`ControlChannel` 草案和 contract tests。

## 2. Commit 记录

- R1：`bef146a` - `m0: scaffold workspace and goal baseline`
- R2：`6ca09a2` - `m0: add workspace packages and test foundation`
- R3：`03755e5` - `m0: add coordinate convention contracts`
- R4：本报告所在提交 - `m0: define camera contracts and close m0`

## 3. 验证矩阵

- `pnpm --version`：PASS，`11.8.0`
- `pnpm install`：PASS，首轮 registry 下载失败后使用 lockfile-only + offline install 完成并固定 lockfile。
- `pnpm typecheck`：PASS
- `pnpm test`：PASS
- `pnpm test -- --run`：PASS
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`：PASS
- `pnpm docs:check`：PASS
- `git diff --check`：PASS

## 4. 架构确认

- `@viewrig/core` 未引入 Three、DOM、React、Sinan、Rapier 或宿主 scene graph 依赖。
- `CameraState` 是 core 当前中心输出 contract。
- Public vector/quaternion helpers 返回 snapshot，不复用输入 mutable object。
- `WorldProbe` 只是可选方法接口，没有物理引擎 hard dependency。
- `ControlChannel` 只定义输入 intent/state 边界，不处理 raw input binding。

## 5. 下一阶段

进入 M1 Math And Trace Core：

- R5：实现 Vec2 / Vec3 snapshot 和基础运算。
- R6：实现 Quat / rotation helper 最小集。
- R7：实现 half-life damping 和帧率无关测试。
- R8：实现 golden trace runner、fake target/channel/probe fixture。
- R9：Fixed pose solver spike，输出 deterministic CameraState trace。
