# ViewRig Composer And Debug Data

日期：2026-06-20  
状态：M5 behavior draft

## 1. Screen Zone 行为

ViewRig 的 `ScreenZoneComposer` 使用三层 NDC 区域：

- `dead`：目标在区域内时不需要修正。
- `soft`：目标离开 dead 但仍在 soft 内，输出修正目标点到 dead 边界。
- `hard`：目标离开 soft 但仍在 hard 内，输出修正目标点到 soft 边界。
- `outside`：目标离开 hard，输出修正目标点到 hard 边界。
- `behind`：目标在 camera 后方，target/correction 都为 `null`。

当前 M5 只固定判定与 debug data，不在 core 内直接移动或旋转真实 camera。

## 2. Debug Draw Commands

`createScreenZoneDebugCommands` 输出 renderer-agnostic draw command：

- `rectNdc` for hard / soft / dead。
- `pointNdc` for target。
- `pointNdc` for correction target。

这些命令可以由 Three、Babylon、PlayCanvas 或 Sinan 内部 overlay adapter 绘制。core 不依赖任何 renderer。

## 3. 后续

后续 M6/M7 可以把 composer result 附着到 `CameraState.debug.metadata` 或 playground overlay，但 `ScreenZoneComposer` 的 source-of-truth 仍是纯数据结果。
