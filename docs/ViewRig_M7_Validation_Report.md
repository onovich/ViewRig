# ViewRig M7 Validation Report

日期：2026-06-20  
阶段：M7 Adapter And Showcase  
状态：PASS

## 1. 完成范围

- R33：创建 `@viewrig/adapter-three`，用 structural Three camera contract 写入 `CameraState`。
- R34：创建 `examples/three-orbit-playground` 静态 orbit playground。
- R35：增加 playground smoke 脚本和仓库级 `pnpm test:browser` 入口，浏览器验证 yaw 修改后 pose 可见变化。
- R36：增加 debug overlay 最小渲染，浏览器验证 overlay on/off 与 pose 更新同时可用。
- R37：输出 Sinan repo 内部 POC adapter 设计说明。
- R38：收口 M7 验证矩阵和文档索引。

## 2. Commit 记录

- R33：`057751e` - `m7: add structural three adapter`
- R34：`7317e0a` - `m7: add orbit playground scaffold`
- R35：`4446fcc` - `m7: add orbit playground smoke`
- R36：`c50f334` - `m7: add playground debug overlay`
- R37：`815f71c` - `m7: document sinan internal adapter poc`
- R38：本报告所在提交 - `m7: document adapter showcase validation`

## 3. 验证矩阵

- `pnpm --dir examples/three-orbit-playground build`：PASS
- `pnpm test:browser`：PASS
- `pnpm typecheck`：PASS
- `pnpm test`：PASS
- `pnpm docs:check`：PASS
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`：PASS
- `git diff --check`：PASS

Browser smoke 证据：

- R35：in-app browser 打开 `http://127.0.0.1:4173/`，`#yaw/#pitch/#distance/#pose` 均唯一存在，yaw 改为 `-90` 后 pose 文本变化，canvas 存在。
- R36：in-app browser 验证 `#debugOverlay` 和 `#debugState` 唯一存在，overlay 可从 `debug:on live:orbit` 切到 `debug:off` 再切回 on，yaw 改为 `120` 后 pose 文本变化。

## 4. 架构确认

- `@viewrig/core` 仍无 Three、DOM、React、Sinan、Rapier 或宿主 scene graph 依赖。
- `@viewrig/adapter-three` 只消费 `CameraState`，不复制 solver、blend、rig、composer 或 constraint 语义。
- Playground debug overlay 是 example 内部 canvas 渲染，不改变 core debug data source-of-truth。
- Browser smoke 入口在 root script 中统一为 `pnpm test:browser`。
- Sinan adapter 仍定义为 Sinan repo 内部 POC，不在 ViewRig 公共 packages 中发布。

## 5. 下一阶段

进入 M8 Rail And CameraShot Enhancement：

- R39：实现 `CameraPath` interface 和 `PathSample`。
- R40：实现 `PolylinePath` 和 path sampling trace。
- R41：实现 `RailRig` fixed/time/input driver。
- R42：实现 targetProjection driver 和端点回归。
- R43：输出 CameraShot optional solver mode 对齐草案并收口 M8。
