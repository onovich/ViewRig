# ViewRig / 视角

Engine-agnostic camera rigs for games.

ViewRig is a TypeScript camera rig library for games. It provides virtual cameras,
first-person and third-person rigs, orbit cameras, rail cameras, camera blending,
dead zones, soft zones, hard limits, confiners, and collision constraints without
depending on a specific engine.

## 当前定位

ViewRig 的核心目标是提供一套纯 TypeScript 的相机控制数据管线，而不是替代渲染引擎自带的真实 Camera。多个 `VirtualCamera` 产出候选 `CameraState`，由 `CameraBrain` 选择、切换或混合，最终通过 Three.js、Babylon.js、PlayCanvas 或自研引擎的 adapter 写入真实相机。

第一版重点覆盖 Web 游戏和跨引擎项目中最常见的视角需求：

- 第一人称、第三人称、越肩、环绕、固定和轨道相机。
- `cut`、`blend`、`matchThenBlend` 等机位过渡。
- `dead / soft / hard` 三层屏幕构图区域。
- `confiner`、`collision`、`occlusion` 等独立世界约束。
- 低分配、可测试、ESM first、适合 tree-shaking 的核心包。

## 核心心智模型

- `CameraBrain` 负责哪个视角生效，以及怎么过渡。
- `VirtualCamera` 负责描述某个机位想要的画面。
- `Rig` 负责相机大概在哪里。
- `Aim` 负责相机看向哪里。
- `Composer` 负责目标在屏幕里怎么摆。
- `Constraint` 负责相机不能违反哪些世界规则。
- `ControlChannel` 负责输入状态和跨机位继承。
- `WorldProbe` 负责把外部世界查询能力接入 core。
- `Adapter` 负责把最终 `CameraState` 写进具体引擎。

## 技术方向

- TypeScript strict + ESM first。
- pnpm workspaces monorepo。
- TypeScript Project References + `tsc -b`。
- Vitest / Playwright 覆盖 core、adapter 和 playground。
- API Extractor / TypeDoc 管理公共 API 稳定性和文档。
- Changesets + npm provenance / trusted publishing 管理发布。

## MVP 路线

1. Core 状态系统：`CameraState`、`LensState`、`CameraTarget`、`CameraBrain`、`VirtualCamera`、`Blend`、`ChannelStore`、half-life damping。
2. 基础 Rig：`FixedRig`、`FirstPersonRig`、`ThirdPersonRig`、`OrbitRig`、`YawPitchChannel`、`ZoomChannel`。
3. 构图：`ScreenZoneComposer`、dead / soft / hard、projection helper、debug zone overlay。
4. 约束：`Confiner2D`、`Confiner3D`、`OcclusionConstraint`、`CollisionConstraint`、`WorldProbe` adapters。
5. 轨道：`CameraPath`、`RailRig`、`PolylinePath`、`SplinePath`、多种 driver。
6. 生态包：`@viewrig/input`、`@viewrig/adapter-three`、`@viewrig/adapter-babylon`、`@viewrig/debug`、examples、docs。

## 文档

- [完整设计文档](docs/ViewRig_视角_设计文档.md)
