# ViewRig / 视角

Engine-agnostic camera rigs for games.

ViewRig is a TypeScript camera pose solver and camera rig library for games. It
provides virtual cameras, first-person and third-person rigs, orbit cameras, rail
cameras, camera blending, dead zones, soft zones, hard limits, confiners, and
collision constraints without depending on a specific engine.

## 当前定位

ViewRig 的核心目标是提供一套纯 TypeScript 的相机姿态求解和 rig 算法数据管线，而不是替代宿主引擎的真实 Camera、导演系统或镜头事实源。多个 `VirtualCamera` 产出候选 `CameraState`，由 `CameraBrain` 选择、切换或混合，最终通过 Three.js、Babylon.js、PlayCanvas、Sinan 或自研引擎的 adapter 写入真实相机。

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

## API Docs

```powershell
pnpm api:check
pnpm docs:api
```

API reports live in `api-reports/`. TypeDoc HTML is generated into `generated-docs/api/workspace` and is intentionally ignored by git.

## MVP 路线

1. Contract Foundation：坐标约定、`CameraState`、`LensState`、`WorldProbe`、`ControlChannel`。
2. Deterministic Trace Core：小数学层、half-life damping、golden trace harness、fixed pose solver spike。
3. Brain And Blend：`VirtualCamera`、`CameraBrain`、`cut`、`blend`、`matchThenBlend`、channel inheritance。
4. Gameplay Rigs：`FollowRig`、`OrbitRig`、`FirstPersonRig`、`ThirdPersonRig`、`YawPitchChannel`、`ZoomChannel`。
5. Composer And Constraints：`ScreenZoneComposer`、dead / soft / hard、debug data、`WorldProbe` constraints。
6. Adapters And POCs：`@viewrig/adapter-three`、debug overlay、Sinan repo 内部 POC adapter。
7. Rail And CameraShot Enhancement：`CameraPath`、`RailRig`、path drivers、Sinan CameraShot optional solver mode。

## 文档

- [完整设计文档](docs/ViewRig_视角_设计文档.md)
- [Sinan 合作评估与研发计划](docs/ViewRig_Sinan_合作评估与研发计划.md)
- [技术架构设计与开发计划](docs/ViewRig_技术架构设计与开发计划.md)
- [Coordinate Convention](docs/ViewRig_Coordinate_Convention.md)
- [M0 Validation Report](docs/ViewRig_M0_Validation_Report.md)
- [M1 Validation Report](docs/ViewRig_M1_Validation_Report.md)
- [M2 Validation Report](docs/ViewRig_M2_Validation_Report.md)
- [M3 Validation Report](docs/ViewRig_M3_Validation_Report.md)
- [M4 Validation Report](docs/ViewRig_M4_Validation_Report.md)
- [Composer And Debug Data](docs/ViewRig_Composer_Debug_Data.md)
- [M5 Validation Report](docs/ViewRig_M5_Validation_Report.md)
- [M6 Validation Report](docs/ViewRig_M6_Validation_Report.md)
- [M7 Validation Report](docs/ViewRig_M7_Validation_Report.md)
- [Sinan Internal POC Adapter Design](docs/sinan-cooperation/viewrig-sinan-internal-poc-adapter-2026-06-20.md)
- [M8 Validation Report](docs/ViewRig_M8_Validation_Report.md)
- [v0.1 API Surface](docs/ViewRig_v0.1_API_Surface.md)
- [M0-M8 Final Report](docs/ViewRig_M0-M8_Final_Report.md)
- [Sinan CameraShot Optional Solver Mode](docs/sinan-cooperation/viewrig-camera-shot-optional-solver-mode-2026-06-20.md)
- [M0-M8 Goal 模式执行指南](docs/ViewRig_M0-M8_Goal模式执行指南.md)
- [v0.2 Goal 模式执行指南](docs/ViewRig_v0.2_Goal模式执行指南.md)
