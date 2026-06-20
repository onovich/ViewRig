# ViewRig 技术架构设计与开发计划

日期：2026-06-20  
状态：基于 Sinan 合作共识后的工程蓝图  
关联文档：

- `docs/ViewRig_视角_设计文档.md`
- `docs/ViewRig_Sinan_合作评估与研发计划.md`
- `docs/sinan-cooperation/rfc-004-sinan-camera-pose-shot-rig-boundary.md`
- `docs/sinan-cooperation/sinan-technical-advisory-2026-06-20.md`
- `docs/sinan-cooperation/sinan-business-letter-2026-06-20.md`

## 1. 当前项目阶段

当前仓库还处在设计与初始化阶段，尚未有 TypeScript package 代码。已有文档已经明确了产品方向、Sinan 合作边界和高层研发路线。下一步应进入 M0/M1 工程落地：

```txt
先固定公共 contract。
再建立可测试 core。
再用 deterministic trace 证明算法稳定。
最后再接 adapter / playground / Sinan POC。
```

ViewRig 的第一版不应先追求“完整相机生态”，而应先证明一条硬管线：

```txt
target trace + channel trace + world probe fixture + dt
  -> ViewRig core
  -> deterministic CameraState trace
```

## 2. 架构原则

### 2.1 Core 只做姿态求解

`@viewrig/core` 的唯一职责是根据目标、输入意图、虚拟机位、构图和世界约束，输出 `CameraState`。

core 不允许依赖：

- Three.js / Babylon.js / PlayCanvas。
- DOM / React / WebGPU。
- Rapier 或其他物理引擎。
- Sinan schema、Sinan editor store 或 Sinan runtime。
- 宿主引擎 scene node、entity store 或真实 camera object。

### 2.2 Adapter 才能接触宿主

所有宿主相关能力都必须放在 adapter：

- Three camera 写入在 `@viewrig/adapter-three`。
- Sinan `RuntimeCameraPose` 映射先放在 Sinan repo 内部 POC adapter。
- Physics / world query 通过 `WorldProbe` adapter 接入。
- Debug 可输出 draw commands，具体绘制由 renderer adapter 执行。

### 2.3 CameraState 是唯一中心契约

所有模块最终都服务于 `CameraState`：

```txt
Rig       -> 产生基础位置/姿态
Aim       -> 修正朝向
Composer  -> 修正屏幕构图
Constraint-> 修正世界约束
Blend     -> 修正跨机位过渡
Adapter   -> 应用最终状态
```

不得从 core 返回真实 camera、matrixWorld、Object3D、DOM event、Sinan CameraShot 或任何宿主私有对象。

### 2.4 Runtime state 不做事实源

ViewRig 内部 runtime state 只服务每帧求解，例如 damping cache、blend progress、scratch vectors、channel current/target value。它可以序列化为调试 trace，但不能成为宿主项目的 authoring source-of-truth。

对于 Sinan：

- CameraShot JSON 仍是 Sinan source-of-truth。
- ViewRig solver config 若需持久化，必须映射为 Sinan schema 扩展。
- `RuntimeCameraPose` / `CameraState` 只是每帧结果，不写回 CameraShot JSON。

## 3. 初始包结构

首批只建最小 monorepo，避免过早扩张：

```txt
packages/
  core/
  testing/
  adapter-three/
  debug/
examples/
  trace-fixtures/
  three-orbit-playground/
docs/
scripts/
```

### 3.1 包职责

`@viewrig/core`

- 公共类型：`CameraState`、`LensState`、`VirtualCamera`、`CameraBrain`、`ControlChannel`、`WorldProbe`。
- 小数学层：Vec2、Vec3、Quat、必要的 projection helpers。
- solver：rig、aim、composer、constraint、blend。
- 不含 renderer、DOM input、host adapter。

`@viewrig/testing`

- deterministic trace fixture。
- snapshot helpers。
- fake target、fake channel、fake WorldProbe。
- golden trace runner。
- allocation / reference stability guard 的基础工具。

`@viewrig/adapter-three`

- 把 `CameraState` 写入 Three camera。
- 可选 Three WorldProbe adapter。
- 不参与 solver 决策。

`@viewrig/debug`

- debug metadata 和 draw command 数据结构。
- 不直接绘制到具体 renderer。
- three debug renderer 可先放在 example 或 adapter 内部，稳定后再拆。

暂缓独立包：

- `@viewrig/input`：先不做 raw input framework。
- `@viewrig/path`：Rail 进入 M7 前可先作为 core internal module。
- `@viewrig/adapter-babylon` / `adapter-playcanvas`：等 core contract 稳定。
- `@viewrig/sinan`：等 Sinan POC 稳定后再评估。

## 4. Core 内部分层

建议目录：

```txt
packages/core/src/
  state/
    CameraState.ts
    LensState.ts
    DebugState.ts
  conventions/
    CoordinateConvention.ts
    ScreenSpace.ts
  math/
    Vec2.ts
    Vec3.ts
    Quat.ts
    Mat4.ts
    Damping.ts
    Projection.ts
  target/
    CameraTarget.ts
    TargetSample.ts
  channels/
    ControlChannel.ts
    ChannelStore.ts
    YawPitchChannel.ts
    ZoomChannel.ts
  brain/
    CameraBrain.ts
    VirtualCamera.ts
    Activation.ts
    Blend.ts
  rigs/
    FixedRig.ts
    FollowRig.ts
    OrbitRig.ts
    FirstPersonRig.ts
    ThirdPersonRig.ts
  aims/
    FixedAim.ts
    LookAtAim.ts
    YawPitchAim.ts
  composer/
    RectNdc.ts
    ScreenZoneComposer.ts
  constraints/
    DistanceClamp.ts
    YawPitchClamp.ts
    Confiner2D.ts
    Confiner3D.ts
    CollisionConstraint.ts
  world/
    WorldProbe.ts
  index.ts
```

依赖方向：

```txt
state/math/conventions
  <- target/channels/world
  <- rigs/aims/composer/constraints
  <- brain
  <- public index
```

约束：

- `state` 和 `math` 不 import 高层模块。
- `rigs` 不 import adapter。
- `brain` 可以组合 rig/aim/composer/constraint，但不能知道宿主引擎。
- `index.ts` 暴露稳定公共 API，internal helper 不默认导出。

## 5. 核心公共 Contract 草案

### 5.1 CameraState

```ts
export interface CameraState {
  readonly position: Vec3Snapshot;
  readonly rotation: QuatSnapshot;
  readonly up: Vec3Snapshot;
  readonly lens: LensState;
  readonly time: number;
  readonly debug?: CameraDebugState;
}

export interface LensState {
  readonly projection: "perspective" | "orthographic";
  readonly fov?: number;
  readonly orthographicSize?: number;
  readonly near?: number;
  readonly far?: number;
}
```

设计要点：

- 对外输出 snapshot，避免用户持有内部 mutable scratch。
- `fov` 单位固定为 degree，M0 文档和测试必须写清。
- `rotation` 优先作为最终朝向；`target` 可以作为 debug 或 adapter helper，但不应替代 rotation。

### 5.2 CoordinateConvention

M0 必须定稿默认约定：

```ts
export interface CoordinateConvention {
  readonly handedness: "right-handed" | "left-handed";
  readonly upAxis: "x" | "y" | "z";
  readonly forwardAxis: "+x" | "-x" | "+y" | "-y" | "+z" | "-z";
  readonly fovUnit: "degree";
  readonly ndcRange: "-1..1";
}
```

建议默认：

```txt
right-handed
up = +Y
forward = -Z
NDC x/y = -1..1
fov = degree
```

如果宿主使用不同约定，由 adapter 转换，不让每个 core solver 自己猜。

### 5.3 ControlChannel

```ts
export interface ControlChannel<TValue> {
  readonly id: string;
  readonly value: TValue;
  readonly target?: TValue;
  update(dt: number): void;
  set(value: TValue): void;
  add(delta: Partial<TValue>): void;
  snapshot(): TValue;
}
```

首批 channel：

- `YawPitchChannel`
- `ZoomChannel`
- `ScalarChannel` 或内部通用 channel

不做 raw input：

- 不处理 key binding。
- 不读 DOM events。
- 不处理 gamepad polling。
- 不处理 InputFlow 的 intent ownership。

### 5.4 WorldProbe

```ts
export interface WorldProbe {
  raycast?(ray: RayLike, maxDistance: number, mask?: LayerMask): HitLike | null;
  spherecast?(ray: RayLike, radius: number, maxDistance: number, mask?: LayerMask): HitLike | null;
  containsPoint?(volumeId: string, point: Vec3Like): boolean;
  closestPoint?(volumeId: string, point: Vec3Like): Vec3Like;
}
```

规则：

- core 只依赖接口。
- adapter 决定如何调用 Three / Rapier / Sinan PhysicsProbe。
- 没有 probe 时 constraint 必须有安全 fallback。

### 5.5 VirtualCamera

```ts
export interface VirtualCamera {
  readonly id: string;
  readonly priority?: number;
  readonly enabled?: boolean;
  readonly target?: CameraTarget;
  readonly rig: CameraRig;
  readonly aim?: CameraAim;
  readonly composer?: ScreenComposer;
  readonly constraints?: readonly CameraConstraint[];
  readonly lens?: LensState | LensController;
}
```

`VirtualCamera` 不是真实相机，不持有宿主 engine camera。

## 6. Runtime 数据流

基础流程：

```txt
Host target/input/world
  -> adapter or test fixture
  -> TargetSample / ControlChannel / WorldProbe
  -> CameraBrain.update(dt)
  -> selected VirtualCamera.evaluate(ctx)
  -> Rig
  -> Aim
  -> Composer
  -> Constraints
  -> Brain blend
  -> CameraState
  -> host adapter
```

Sinan POC 流程：

```txt
Sinan World + InputFlow + optional CameraShot intent
  -> Sinan POC adapter builds ViewRig inputs
  -> ViewRig core outputs CameraState
  -> adapter maps CameraState to RuntimeCameraPose
  -> WebRuntime.setCameraPose
```

## 7. 测试架构

### 7.1 Core 正确性靠 golden trace

核心测试输入：

```txt
target trace
channel trace
dt trace
world probe fixture
solver config
```

核心测试输出：

```txt
CameraState trace
debug metadata trace
```

优势：

- 不依赖截图。
- 不依赖真实浏览器。
- 可 review、可 diff。
- 适合 Sinan POC 验证 RuntimeCameraPose。

### 7.2 浏览器 smoke 只验证 adapter

Playwright / browser smoke 用于验证：

- Three camera 确实收到 pose。
- playground 有可见相机变化。
- debug overlay 不遮挡/不崩。
- Sinan browser smoke 中 gameplay camera 可启停。

不要用截图来判断 core 数学正确性。

### 7.3 必要测试清单

M0/M1：

- coordinate convention conversion。
- half-life damping frame-rate independence。
- immutable public snapshot 不复用内部 scratch。
- golden trace runner 能稳定输出。

M2：

- `cut` immediate switch。
- `blend` continuity。
- `matchThenBlend` channel inheritance。

M3：

- yaw/pitch clamp。
- zoom clamp。
- follow/orbit trace。
- fixed target trace。

M4：

- target in dead zone no correction。
- target in soft zone damped correction。
- target outside hard zone immediate correction。

M5：

- no-probe fallback。
- fake probe collision。
- confiner inside no-op / outside projection。

## 8. 开发计划

### M0：Repository And Contract Foundation

目标：把项目从文档仓库推进到可开发 monorepo。

交付：

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `packages/core`
- `packages/testing`
- Vitest 基础配置。
- Coordinate Convention 文档。
- `CameraState` / `LensState` / `WorldProbe` / `ControlChannel` 类型草案。

验收：

- `pnpm install` 可运行。
- `pnpm typecheck` 可运行。
- `pnpm test` 至少跑通 contract tests。
- core 无宿主依赖。

### M1：Math And Trace Core

目标：建立确定性求解基础。

交付：

- Vec2 / Vec3 / Quat 基础操作。
- half-life damping。
- snapshot helpers。
- golden trace runner。
- fake target/channel/probe fixture。
- Fixed pose solver spike。

验收：

- 给定固定 target trace 和 dt trace，输出稳定 CameraState trace。
- 不依赖 Three 或浏览器。

### M2：CameraBrain And Blend

目标：建立虚拟机位调度。

交付：

- `VirtualCamera`
- `CameraBrain`
- activation policy。
- `cut`
- `blend`
- `matchThenBlend`
- channel inheritance。

验收：

- 两个 virtual camera 之间切换有 deterministic trace。
- 继承 yaw/pitch/zoom 后不跳角。

### M3：Follow / Orbit POC Core

目标：服务 Sinan 第一条 gameplay camera POC。

交付：

- `YawPitchChannel`
- `ZoomChannel`
- `FixedRig`
- `FollowRig`
- `OrbitRig`
- RuntimeCameraPose-compatible mapper 草案。

验收：

- 输入 target pose + yaw/pitch/distance，输出可映射到 RuntimeCameraPose 的 `CameraState`。
- follow/orbit golden trace 稳定。
- 不触碰 Three.Camera。

### M4：First / Third Person MVP

目标：补齐游戏相机基本手感。

交付：

- `FirstPersonRig`
- `ThirdPersonRig` 最小版。
- shoulder offset。
- pitch/yaw clamp。
- position/rotation half-life。

验收：

- 第一/第三人称 trace 可切换。
- channel inheritance 防止跳角。

### M5：Screen Composer And Debug Data

目标：实现构图控制和可视化数据。

交付：

- `ScreenZoneComposer`
- RectNdc。
- projection helper。
- debug metadata：target NDC、zone rect、live camera id、blend progress。
- debug draw command model。

验收：

- dead/soft/hard zone 行为有测试。
- debug data 不依赖 renderer。

### M6：WorldProbe Constraints

目标：完成世界约束接口闭环。

交付：

- DistanceClamp。
- YawPitchClamp。
- Confiner2D / Confiner3D 最小版。
- Collision / Occlusion 最小策略。
- fake WorldProbe tests。

验收：

- no-probe fallback 正常。
- fake probe 可驱动 collision/confiner trace。
- 为 Sinan PhysicsProbe adapter 留出接口。

### M7：Adapter And Showcase

目标：进入可视化和宿主接入。

交付：

- `@viewrig/adapter-three`。
- `examples/three-orbit-playground`。
- debug overlay 最小渲染。
- Sinan repo 内 POC adapter 设计说明。

验收：

- Three playground 可见相机变化。
- browser smoke 通过。
- Sinan POC-2 可接入 `WebRuntime.setCameraPose`。

### M8：Rail And CameraShot Enhancement

目标：在 core 稳定后接 CameraShot 增强场景。

交付：

- `CameraPath`。
- `RailRig`。
- `PolylinePath`。
- time / input / targetProjection driver。
- CameraShot optional solver mode 对齐草案。

验收：

- rail golden trace 稳定。
- Timeline scrub 可预测。
- ViewRig runtime state 不保存进 Sinan JSON。

## 9. Phase 轮次预算

这里的“1 轮会话”指一次可独立闭环的开发会话：明确本轮目标、完成实现或文档调整、运行相关验证、提交并推送。它不是自然日，也不是单次问答。

建议当前项目按 9 个 Phase 推进，总预算约 43 轮会话；考虑未知技术债、Windows/Node 工具链问题、Sinan contract 对齐和浏览器 smoke 调整，管理预算应按 48 轮预留。

| Phase | 名称 | 目标 | 预估轮次 | 轮次拆分 |
| --- | --- | --- | ---: | --- |
| M0 | Repository And Contract Foundation | 建立 monorepo、TypeScript/Vitest 基础、坐标契约和核心类型 | 4 | 2 实现 + 1 文档/契约校准 + 1 验证提交 |
| M1 | Math And Trace Core | 小数学层、half-life damping、golden trace runner、fixed pose spike | 5 | 3 实现 + 1 trace/fixture 调整 + 1 验证提交 |
| M2 | CameraBrain And Blend | VirtualCamera、CameraBrain、cut/blend/matchThenBlend、channel inheritance | 5 | 3 实现 + 1 边界/回归修复 + 1 验证提交 |
| M3 | Follow / Orbit POC Core | Follow/Orbit、YawPitch/Zoom channel、RuntimeCameraPose-compatible mapping | 4 | 2 实现 + 1 Sinan POC contract 对齐 + 1 验证提交 |
| M4 | First / Third Person MVP | FirstPerson/ThirdPerson、shoulder、yaw/pitch clamp、half-life 手感参数 | 5 | 3 实现 + 1 手感/trace 修复 + 1 验证提交 |
| M5 | Screen Composer And Debug Data | dead/soft/hard composer、projection helper、debug metadata/draw commands | 4 | 2 实现 + 1 debug/测试补齐 + 1 验证提交 |
| M6 | WorldProbe Constraints | fake WorldProbe、Distance/YawPitch clamp、confiner、collision/occlusion 最小闭环 | 5 | 3 实现 + 1 no-probe/fallback 修复 + 1 验证提交 |
| M7 | Adapter And Showcase | adapter-three、Three playground、browser smoke、Sinan POC adapter 设计 | 6 | 3 实现 + 1 UI/smoke + 1 Sinan 接入修正 + 1 验证提交 |
| M8 | Rail And CameraShot Enhancement | CameraPath、RailRig、path drivers、CameraShot optional solver mode 草案 | 5 | 3 实现 + 1 Timeline/scrub 对齐 + 1 验证提交 |

优先级建议：

- M0-M3 是第一阶段硬门槛，共 18 轮。完成后 ViewRig 才真正具备“纯 solver + deterministic trace + follow/orbit POC”的基础。
- M4-M6 是 v0.1 gameplay camera 完整性阶段，共 14 轮。完成后才适合宣称 FPS/TPS/composer/constraint MVP。
- M7-M8 是宿主可见价值阶段，共 11 轮。完成后再讨论 Sinan 官方 adapter 或更深合作。

每个 Phase 的最后一轮必须只做收口：

- 跑本 Phase 的 validation matrix。
- 更新 README / docs / changelog 或 TODO。
- 检查是否引入宿主依赖越界。
- 提交并推送。
- 记录 commit hash、push 结果和下一 Phase 风险。

## 10. 近期执行 Backlog

第一批开发任务建议按这个顺序执行：

1. 初始化 pnpm monorepo 和 TypeScript references。
2. 创建 `packages/core`、`packages/testing`。
3. 写 Coordinate Convention 文档和测试。
4. 实现 `CameraState`、`LensState`、snapshot 类型。
5. 实现 Vec2 / Vec3 / Quat 最小数学层。
6. 实现 half-life damping。
7. 实现 golden trace runner。
8. 实现 Fixed pose solver spike。
9. 实现 `ControlChannel` / `YawPitchChannel` / `ZoomChannel`。
10. 实现 `VirtualCamera` / `CameraBrain` / `cut`。

完成这 10 项后，再进入 blend、follow/orbit 和 Sinan POC mapping。

## 11. 暂不做事项

近期明确不做：

- 完整 `@viewrig/input`。
- Babylon / PlayCanvas adapter。
- `@viewrig/sinan` 公共包。
- CJS dual package。
- 完整 Cinemachine-like 生态。
- 影视镜头编辑器。
- concave mesh / navmesh confiner。
- 复杂 debug devtools。

这些不是否定，而是等待 core contract 和 trace harness 稳定后再进入。

## 12. 决策记录

### ADR-A：v0.x ESM-only

决定：v0.x 采用 ESM-only。  
原因：减少 dual package hazard，降低测试矩阵，符合现代 Web game 工程。

### ADR-B：Golden trace 优先于 screenshot

决定：core 正确性以 golden trace 为主，browser screenshot 只验证 adapter 和视觉 smoke。  
原因：相机数学和手感需要可 diff 的数值 trace，截图太脆弱。

### ADR-C：Sinan adapter 先不进入 ViewRig monorepo

决定：Sinan adapter 先放在 Sinan repo 内部做 POC。  
原因：Sinan schema 和 RuntimeCameraPose contract 仍在演进，过早发布 `@viewrig/sinan` 会固化不稳定边界。

### ADR-D：Input 只消费 intent/channel

决定：ViewRig core 不做 raw input system。  
原因：InputFlow 或宿主项目更适合处理 binding、context、device polling、replay；ViewRig 只需要 camera intent。

## 13. 成功标准

v0.1 成功标准：

- core 无宿主依赖。
- 坐标约定和 public contract 清晰。
- deterministic CameraState trace 可作为回归测试。
- CameraBrain 支持 cut/blend/matchThenBlend。
- Follow/Orbit/FirstPerson/ThirdPerson 基本可用。
- ScreenZoneComposer 可用。
- WorldProbe constraint 有最小闭环。
- Three playground 能可视化。
- Sinan pose solver spike 可运行且不替换 CameraShotPlayer。

最重要的是，ViewRig 必须保持自己的独立价值：它服务 Sinan，但不成为 Sinan-only 模块。
