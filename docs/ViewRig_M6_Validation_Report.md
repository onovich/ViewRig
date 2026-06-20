# ViewRig M6 Validation Report

日期：2026-06-20  
阶段：M6 WorldProbe Constraints  
状态：PASS

## 1. 完成范围

- R28：实现 WorldProbe safe fallback helpers，并补 fake WorldProbe fallback tests。
- R29：实现 DistanceClamp / YawPitchClamp。
- R30：实现 Confiner2D / Confiner3D AABB 最小版。
- R31：实现 Collision / Occlusion 最小 pull-forward 策略。
- R32：输出 Sinan PhysicsProbe adapter contract 说明并收口 M6。

## 2. Commit 记录

- R28：`7878a34` - `m6: add world probe fallbacks`
- R29：`86ad243` - `m6: add distance yaw pitch clamps`
- R30：`c7660c4` - `m6: add minimal confiners`
- R31：`2bb5075` - `m6: add collision occlusion constraints`
- R32：本报告所在提交 - `m6: document sinan physics probe contract`

## 3. 验证矩阵

- `pnpm typecheck`：PASS
- `pnpm test`：PASS
- `C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd`：PASS
- `pnpm docs:check`：PASS
- `git diff --check`：PASS

## 4. 架构确认

- `WorldProbe` 仍是接口，不是物理系统。
- 无 probe 时 constraint safe fallback 可 no-op。
- Collision/Occlusion/Confiner 不 import physics engine。
- Sinan PhysicsProbe adapter 策略保持在 Sinan repo 内部。

## 5. 下一阶段

进入 M7 Adapter And Showcase：

- R33：创建 `@viewrig/adapter-three`，实现 CameraState 写入 Three camera。
- R34：创建 `examples/three-orbit-playground`。
- R35：增加 Playwright/browser smoke，确认 pose 变化可见。
- R36：增加 debug overlay 最小渲染。
- R37：输出 Sinan repo 内部 POC adapter 设计说明。
- R38：收口 M7：adapter/playground/smoke 文档和验证矩阵。
