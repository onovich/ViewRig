# ViewRig M8 Validation Report

日期：2026-06-20  
阶段：M8 Rail And CameraShot Enhancement  
状态：PASS

## 1. 完成范围

- R39：实现 `CameraPath` interface、`ProjectableCameraPath` 和 `PathSample` snapshot contract。
- R40：实现 `PolylinePath` 和 deterministic path sampling trace。
- R41：实现 `RailRig` fixed/time/input driver。
- R42：实现 targetProjection driver、path projection 和端点回归。
- R43：输出 Sinan CameraShot optional solver mode 对齐草案，并收口 M8 验证矩阵。

## 2. Commit 记录

- R39：`9b09901` - `m8: add camera path contract`
- R40：`31b5b39` - `m8: add polyline path sampling`
- R41：`1dcfc76` - `m8: add rail rig drivers`
- R42：`48f3c91` - `m8: add rail target projection`
- R43：本报告所在提交 - `m8: document camera shot solver mode`

## 3. 验证矩阵

- `pnpm typecheck`：PASS
- `pnpm test`：PASS
- `pnpm docs:check`：PASS
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`：PASS
- `git diff --check`：PASS

当前测试统计：54 个 test files、111 个 tests 通过。

## 4. 架构确认

- `CameraPath`、`PolylinePath`、`RailRig` 都在 `@viewrig/core` 内保持宿主无关。
- `RailRig` 输出 `CameraState`，不写真实 camera。
- targetProjection 只消费 `Vec3Like` target 和 projectable path contract。
- Sinan CameraShot optional solver mode 仍是 Sinan schema extension，不让 ViewRig 接管 CameraShotPlayer 或 DirectorCameraSystem。
- Runtime channel state 和每帧 `CameraState` 不写回 CameraShot JSON。

## 5. 下一阶段

进入全局缓冲和最终验收：

- R44：修复前序 Phase 遗留失败或强化 trace。
- R45：修复 tooling/browser smoke/Windows path 问题。
- R46：修复 Sinan contract / adapter 边界问题。
- R47：API/docs hardening 和回归补漏。
- R48：最终验收，全仓验证、文档索引、最终报告和 release dry-run 草案。
