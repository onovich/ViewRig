# ViewRig / 视角

**引擎无关的游戏相机控制库完整设计文档**  
版本：v0.1 设计草案  
日期：2026-06-18  
定位：Engine-agnostic camera rigs for games.

---

## 0. 摘要

ViewRig / 视角 是一套面向 Web 游戏和跨引擎游戏项目的相机控制库。它的目标不是替代渲染引擎的 Camera，也不是绑定 Three.js、Babylon.js、PlayCanvas 或某个自研引擎，而是提供一套可复用的 **虚拟相机管线**：多个 Virtual Camera 产出候选 CameraState，由 CameraBrain 选择、混合并输出最终 CameraState，再由引擎适配器写入真实相机。

它对标 Cinemachine 的核心思想，但故意保持更小的概念集。Cinemachine 的官方文档描述了 Virtual Camera 不创建新的真实相机，而是驱动一个 Unity Camera；Brain 会在多个 Virtual Camera 之间选择、切换或混合 [R1]。ViewRig 保留这个高价值模型，但去掉 Unity GameObject 和 Component 依赖，把核心设计为纯 TypeScript 数据管线。

第一版应该支持：

- 第一人称视角控制和旋转。
- 第三人称视角控制、环绕、越肩和碰撞避让。
- 轨道相机、固定相机和机位过渡。
- dead zone、soft zone、hard limit 的屏幕构图。
- confiner、collision、occlusion 等世界约束。
- 可接入多种 Web 游戏引擎。

---

## 1. 命名

### 1.1 项目名

- 中文名：视角
- 英文名：ViewRig
- npm scope：`@viewrig`
- 核心包：`@viewrig/core`
- 英文定位：Engine-agnostic camera rigs for games.
- 中文定位：引擎无关的游戏相机视角控制库。

### 1.2 命名原则

- 中文名使用常用词，不用“镜”，不使用生僻字。
- 英文名使用纯英文，不使用拼音和英文混搭。
- 品牌名短，API 名保持专业。
- 对外品牌是 ViewRig / 视角；内部概念仍使用 `CameraBrain`、`VirtualCamera`、`CameraRig`、`CameraState`、`ScreenComposer`、`CameraConfiner` 等通用术语。

### 1.3 README 开场建议

```md
# ViewRig / 视角

Engine-agnostic camera rigs for games.

ViewRig is a TypeScript camera rig library for games. It provides virtual cameras,
first-person and third-person rigs, orbit cameras, rail cameras, camera blending,
dead zones, soft zones, hard limits, confiners and collision constraints without
depending on a specific engine.
```

---

## 2. 总体目标

### 2.1 目标

ViewRig 的目标是提供一套稳定、可测试、易调参数的相机控制核心：

1. **引擎无关**：核心不依赖 Three.js、Babylon.js、PlayCanvas、WebGPU、DOM 或物理引擎。
2. **多视角统一模型**：第一人称、第三人称、轨道、固定、过场都通过 VirtualCamera + Rig + Extensions 表达。
3. **切换顺滑**：支持 cut、blend、matchThenBlend，并能继承 yaw、pitch、zoom、shoulder 等状态。
4. **构图可控**：支持 dead zone、soft zone、hard limit，用统一的 ScreenComposer 处理。
5. **约束清晰**：confiner、collision、occlusion 分开建模。
6. **适合 Web 端**：低分配、tree-shaking、ESM、可在浏览器和 Node 测试环境运行。
7. **可扩展**：用户可以自定义 Rig、Aim、Composer、Constraint、WorldProbe、Adapter。

### 2.2 非目标

第一版不做这些事情：

- 不做完整影视镜头编辑器。
- 不内置复杂物理引擎。
- 不绑定 ECS 框架。
- 不在 core 里直接读 DOM input。
- 不把每种相机都做成一个大而全的 Controller。
- 不要求用户使用特定坐标系或特定场景树。
- 不承诺第一版实现 concave mesh confiner、navmesh confiner 或复杂遮挡求解。

---

## 3. 推荐技术栈

### 3.1 结论

我建议采用以下技术栈：

- **语言：TypeScript strict。** Web 游戏引擎接入成本低，类型可作为 API 文档的一部分。
- **模块格式：ESM first。** 便于现代 bundler tree-shaking；必要时提供 CJS 兼容产物。
- **Monorepo：pnpm workspaces。** 多包管理清晰，workspace 协议适合包之间本地依赖 [R4]。
- **构建：TypeScript Project References + `tsc -b`。** 保证类型输出、增量构建和包之间分层 [R3]。
- **Demo / Playground：Vite。** 用于 Web 示例、调参页面、文档演示；Vite 的 library mode 也可用于 browser-oriented library bundle [R5]。
- **单元测试：Vitest。** 测 core、数学、blend、constraint、composer。
- **浏览器测试：Vitest Browser Mode 或 Playwright。** Browser Mode 可在真实浏览器运行测试 [R6]；Playwright 可覆盖 Chromium、Firefox、WebKit [R7]。
- **API 审查：API Extractor。** 用于 API report、`.d.ts` rollup 和公共 API 稳定性检查 [R8]。
- **API 文档：TypeDoc。** 从 TypeScript 注释生成 HTML 或 JSON 文档 [R9]。
- **版本发布：Changesets。** 适合多包仓库的版本、changelog、发布流程 [R11]。
- **npm 发布安全：npm provenance / trusted publishing。** 增加供应链可追溯性 [R10]。

### 3.2 为什么第一版不建议 Rust/WASM

Rust/WASM 可以作为未来优化项，但不建议第一版以 WASM 为核心。原因：

- 相机控制的主要成本通常不是标量数学，而是场景 raycast / spherecast、目标采样、引擎通信和用户输入。
- WASM 与 JS 之间频繁传输小对象会增加复杂度。
- Web 游戏引擎的用户更容易直接消费 TypeScript API。
- 调参、调试、断点、文档和 adapter 开发在 TypeScript 中更顺畅。

只有在后期出现明确性能瓶颈时，才考虑把高成本模块拆到 WASM，例如复杂路径投影、复杂体积求最近点、批量遮挡评估等。

### 3.3 构建策略

核心包建议采用“**不强行大 bundle**”的策略：

- `@viewrig/core` 输出 ESM，尽量保持模块结构，便于 tree-shaking。
- `@viewrig/core` 只依赖最小运行时，不依赖渲染引擎。
- declarations 由 TypeScript 生成，再用 API Extractor 做 API report 和可选 `.d.ts` rollup。
- Vite 用于 playground、examples、docs，以及需要 CDN/UMD/IIFE 时的分发包。Vite 官方文档说明 library mode 面向 browser-oriented libraries；如果是非浏览器库或高级构建流程，建议使用更底层工具 [R5]。因此 core 不必一开始就被 Vite 强绑定。

推荐产物：

```txt
dist/
  index.js          ESM
  index.d.ts        Type declarations
  package.json      exports map
```

可选产物：

```txt
dist/
  viewrig.global.js  仅用于 CDN / demo，不作为主分发形式
```

### 3.4 坐标和数学层

建议 core 内部自带极小数学层，而不是直接依赖 Three.js 或 Babylon.js 的向量类。

公共 API 接收结构化类型：

```ts
export type Vec3Like = readonly [number, number, number] | { x: number; y: number; z: number };
export type QuatLike = readonly [number, number, number, number] | { x: number; y: number; z: number; w: number };
```

内部实现使用可复用的 mutable 对象或 typed array scratch，避免每帧分配：

```ts
class Vec3 {
  x = 0;
  y = 0;
  z = 0;

  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
}
```

原则：

- public API 友好，内部实现低分配。
- 适配器负责把 `CameraState` 转成 Three.js / Babylon.js / PlayCanvas 的类型。
- core 不暴露引擎对象。

---

## 4. 总体架构

### 4.1 架构风格

ViewRig 采用 **Ports and Adapters** 架构，也可以理解为小型 Clean Architecture：

```txt
外部输入 / 引擎 / 物理 / DOM
          ↓
       Adapter
          ↓
       Ports
          ↓
      ViewRig Core
          ↓
     CameraState
          ↓
       Adapter
          ↓
      Engine Camera
```

核心原则：

- Core 只计算 `CameraState`。
- Adapter 才能接触具体引擎。
- Input 模块只产生 ControlChannel，不直接改相机。
- WorldProbe 是接口，不是内置物理系统。
- Debug 是额外包，不污染 runtime core。

### 4.2 包结构

推荐 monorepo：

```txt
viewrig/
  packages/
    core/
    input/
    path/
    adapter-three/
    adapter-babylon/
    adapter-playcanvas/
    debug/
    devtools/
  examples/
    third-person-three/
    first-person-babylon/
    rail-camera-playground/
  docs/
  scripts/
  pnpm-workspace.yaml
```

包依赖规则：

```txt
@viewrig/core
  不依赖任何引擎、DOM、React、物理库。

@viewrig/input
  依赖 core 的 Channel 类型，可以接 DOM / Pointer Lock / Gamepad。

@viewrig/path
  依赖 core 的 Vec3 / Quat 类型，可提供 spline、polyline、arc 等路径工具。

@viewrig/adapter-three
@viewrig/adapter-babylon
@viewrig/adapter-playcanvas
  依赖 core 和对应引擎。

@viewrig/debug
  依赖 core，可选依赖渲染引擎 adapter。
```

### 4.3 核心运行管线

```txt
Input Device
  ↓
Input Adapter
  ↓
ControlChannel Store
  ↓
CameraBrain.update(dt)
  ↓
VirtualCamera.evaluate(ctx)
  ↓
Rig / Body：求基础位置
  ↓
Aim：求基础朝向
  ↓
Composer：屏幕构图修正
  ↓
Constraints：confiner / collision / occlusion / limits
  ↓
Noise / Impulse / Recoil
  ↓
Lens
  ↓
Brain Blend
  ↓
CameraState
  ↓
Engine Adapter.apply(camera, state)
```

### 4.4 数据流设计

`CameraBrain` 每帧不直接改真实相机，而是输出一个不可变或逻辑不可变的 `CameraState`：

```ts
export interface CameraState {
  position: Vec3;
  rotation: Quat;
  lens: LensState;
  up: Vec3;
  time: number;
  debug?: CameraDebugState;
}

export interface LensState {
  projection: "perspective" | "orthographic";
  fov?: number;
  orthographicSize?: number;
  near?: number;
  far?: number;
}
```

引擎适配器只负责写入：

```ts
export interface CameraSink<TCamera = unknown> {
  apply(camera: TCamera, state: CameraState): void;
}
```

---

## 5. 核心概念

### 5.1 CameraBrain

`CameraBrain` 是调度器，不是相机控制器。职责：

- 管理 VirtualCamera 列表。
- 根据 active id、priority 或自定义 selector 选择当前机位。
- 在机位之间执行 cut / blend / matchThenBlend。
- 持有 ChannelStore 和全局上下文。
- 输出最终 CameraState。

```ts
export class CameraBrain {
  add(camera: VirtualCamera): void;
  remove(id: string): void;
  activate(id: string, options?: ActivationOptions): void;
  update(dt: number): CameraState;
  get output(): CameraState;
}
```

### 5.2 VirtualCamera

VirtualCamera 是一个“视角配置”，不等于真实相机。

```ts
export interface VirtualCamera {
  id: string;
  priority?: number;
  enabled?: boolean;

  target?: CameraTarget;
  rig: CameraRig;
  aim?: CameraAim;
  composer?: ScreenComposer;
  constraints?: CameraConstraint[];
  noise?: CameraNoise[];
  lens?: LensState | LensController;

  onActivate?: ActivationPolicy;
}
```

它的职责是产出 “这个机位想要的 CameraState”。最终是否采用它，由 Brain 决定。

### 5.3 CameraRig

Rig 负责“相机大概在哪里”。

```ts
export interface CameraRig<TConfig = unknown, TRuntime = unknown> {
  type: string;
  config: TConfig;
  createRuntime?(): TRuntime;
  evaluate(ctx: RigContext, runtime: TRuntime): CameraState;
}
```

第一版内置：

```txt
FixedRig
FirstPersonRig
ThirdPersonRig
OrbitRig
RailRig
```

Cinemachine 的 Position Control 中也有 Follow、Orbital Follow、Third Person Follow、Position Composer、Spline Dolly 等位置控制概念 [R2][R12]。ViewRig 保留这些高频模式，但让它们都符合统一 Rig 接口。

### 5.4 Aim

Aim 负责“相机看向哪里”。

```ts
export interface CameraAim {
  type: string;
  evaluate(state: CameraState, ctx: AimContext): CameraState;
}
```

第一版内置：

```txt
FixedAim
LookAtAim
YawPitchAim
PathTangentAim
ScreenComposerAim
```

### 5.5 Composer

Composer 负责“目标在屏幕里怎么摆”。第一版只保留一个核心 composer：

```ts
export interface ScreenZoneComposer {
  mode: "aim" | "body" | "both";
  dead: RectNdc;
  soft: RectNdc;
  hard: RectNdc;
  screenBias?: Vec2;
  dampingHalfLife?: Vec2;
  maxCorrectionSpeed?: Vec2;
}
```

Cinemachine 的官方文档中 dead zone、soft zone、screen 和 damping 用于构图区域控制 [R1]。ViewRig 把它抽象为 dead / soft / hard 三层区域：

```txt
目标在 dead 内：不修正。
目标超出 dead 但仍在 soft 内：带 damping 修正。
目标超出 soft 但仍在 hard 内：快速修正。
目标超出 hard：立即修正，不允许继续越界。
```

### 5.6 Constraint

Constraint 负责“最终 CameraState 不能违反哪些世界规则”。

```ts
export interface CameraConstraint {
  type: string;
  apply(state: CameraState, ctx: CameraContext): CameraState;
}
```

第一版内置：

```txt
Confiner2D
Confiner3D
OcclusionConstraint
CollisionConstraint
DistanceClamp
YawPitchClamp
LensClamp
```

### 5.7 WorldProbe

`WorldProbe` 是 core 与外部世界交互的端口。

```ts
export interface WorldProbe {
  raycast?(ray: Ray, maxDistance: number, mask?: LayerMask): Hit | null;
  spherecast?(ray: Ray, radius: number, maxDistance: number, mask?: LayerMask): Hit | null;
  closestPoint?(volumeId: string, point: Vec3): Vec3;
  containsPoint?(volumeId: string, point: Vec3): boolean;
}
```

Three.js、Babylon.js、PlayCanvas、自研引擎、物理引擎，都只需要实现这个接口。

---

## 6. 关键设计：ControlChannel

### 6.1 为什么需要 Channel

第一人称和第三人称切换时，最重要的是继承视角状态：yaw、pitch、zoom、shoulder side、rail t。不要把这些状态藏在真实相机 transform 里。

```ts
const look = brain.channels.yawPitch("playerLook", {
  sensitivity: [0.002, 0.002],
  minPitch: -75,
  maxPitch: 80,
});
```

第一人称、第三人称和瞄准机位可以共享同一个 look channel：

```ts
firstPersonRig({ look });
thirdPersonRig({ look });
aimRig({ look });
```

这样从第三人称切到第一人称时，不会突然跳角。

### 6.2 Channel 类型

第一版内置：

```txt
YawPitchChannel
ZoomChannel
ShoulderChannel
RailChannel
ScalarChannel
Vec2Channel
ImpulseChannel
```

Channel 需要支持：

- 输入累计。
- clamp。
- damping。
- state inheritance。
- serialization。
- reset / recenter。

```ts
export interface ControlChannel<TValue> {
  id: string;
  value: TValue;
  target?: TValue;
  update(dt: number): void;
  set(value: TValue): void;
  add(delta: Partial<TValue>): void;
}
```

---

## 7. Rig 设计

### 7.1 FirstPersonRig

第一人称视角应绑定到角色的 eye anchor，但 yaw/pitch 不应完全依赖角色模型 transform。

推荐拆分：

```txt
PlayerRoot yaw：角色身体水平旋转。
ViewPitch pitch：只影响视角上下旋转。
EyeAnchor：相机位置来源。
```

配置：

```ts
rigs.firstPerson({
  target: playerTarget,
  look,
  eyeOffset: [0, 1.65, 0],
  minPitch: -89,
  maxPitch: 89,
  positionHalfLife: 0,
  rotationHalfLife: 0,
});
```

第一人称默认不使用 ScreenComposer。只有锁定目标、辅助瞄准、交互聚焦时才启用轻量 composer。

### 7.2 ThirdPersonRig

第三人称是第一版最关键的手感模块。

```ts
rigs.thirdPerson({
  target: playerTarget,
  look,
  mode: "orbit", // or "shooter"
  pivotOffset: [0, 1.45, 0],
  shoulderOffset: [0.45, 0.05, 0],
  distance: 4.0,
  minDistance: 0.7,
  maxDistance: 6.0,
  minPitch: -40,
  maxPitch: 75,
  positionHalfLife: 0.12,
  rotationHalfLife: 0.06,
});
```

需要内置两种模式：

```txt
orbit：相机围绕角色转，角色不一定立即跟随相机朝向。
shooter：相机朝向和瞄准方向强绑定，适合越肩射击。
```

细节要求：

- pivot 不等于角色脚底位置。
- shoulder offset 独立，可左右肩切换。
- distance 是期望距离，collision 可以临时缩短。
- yaw/pitch 存在 look channel 中。
- 进入瞄准机位时继承 yaw/pitch 和 shoulder side。

### 7.3 OrbitRig

OrbitRig 用于观察物体、角色选择、boss 战或自由展示。

```ts
rigs.orbit({
  target,
  look,
  radius: 5,
  minRadius: 2,
  maxRadius: 10,
  pivotOffset: [0, 1, 0],
  zoomChannel: zoom,
  dampingHalfLife: 0.1,
});
```

与 ThirdPersonRig 的区别：OrbitRig 更中性，不假设目标是玩家角色。

### 7.4 RailRig

RailRig 使用抽象路径接口，不绑定具体 spline 实现：

```ts
export interface CameraPath {
  sample(t: number): PathSample;
  closestParam?(point: Vec3): number;
  length?(): number;
}

export interface PathSample {
  position: Vec3;
  tangent: Vec3;
  normal?: Vec3;
  rotation?: Quat;
}
```

驱动方式：

```txt
fixedT：固定轨道点。
time：按时间播放。
input：玩家输入控制 t。
targetProjection：把目标投影到轨道最近点。
distanceAlong：按路径长度推进。
```

配置：

```ts
rigs.rail({
  path,
  driver: {
    type: "targetProjection",
    target: playerTarget,
    lookAhead: 0.2,
    dampingHalfLife: 0.15,
  },
  offset: [0, 1.5, 0],
  aim: "lookAtTarget",
});
```

### 7.5 FixedRig

FixedRig 用于固定机位、对话、房间相机、过场镜头。

```ts
rigs.fixed({
  position: [0, 3, -6],
  rotation: quatFromEuler(-15, 0, 0),
});
```

FixedRig 仍可搭配 LookAtAim、ScreenComposer 和 Confiner。

---

## 8. Dead / Soft / Hard Zone

### 8.1 坐标系

建议使用 NDC 风格屏幕坐标：

```txt
x: -1 左边，0 中心，+1 右边
y: -1 下边，0 中心，+1 上边
```

```ts
export interface RectNdc {
  center: Vec2;
  size: Vec2;
}
```

### 8.2 行为模型

```ts
function applyScreenComposer(state, target, composer, dt) {
  const p = projectToNdc(state, target.position);

  if (inside(p, composer.dead)) return state;

  if (!inside(p, composer.hard)) {
    return correctImmediately(state, target, composer.hard, composer.mode);
  }

  const desired = clampToRect(p, composer.dead);
  const correction = computeScreenCorrection(state, target, desired, composer.mode);

  return applyDampedCorrection(state, correction, composer.dampingHalfLife, dt);
}
```

### 8.3 Composer 模式

- `aim`：不移动相机，只调整旋转。适用于第三人称、固定机位、轨道机位。
- `body`：不改旋转，只移动相机。适用于横版、2.5D、房间相机。
- `both`：先转向再移动。适用于叙事镜头、轻影视化相机。

---

## 9. Confiner 与 Collision

### 9.1 概念区分

```txt
Confiner：限制相机最终位置必须在某个区域或体积内。
Collision：避免相机穿墙。
Occlusion：避免目标和相机之间被遮挡。
```

不要把这三者混成一个“防穿墙系统”。它们的输入、输出和调参方式不同。

### 9.2 Confiner2D

MVP 支持：

```txt
AABB
Circle
Polygon camera point
Polygon viewport edges for orthographic camera
```

配置：

```ts
constraints.confiner2D({
  shape: polygon,
  plane: "xy",
  mode: "cameraPoint", // or "viewportEdges"
  dampingHalfLife: 0.1,
});
```

### 9.3 Confiner3D

MVP 支持：

```txt
AABB
Sphere
Convex volume via closestPoint
Custom volume via callback
```

配置：

```ts
constraints.confiner3D({
  volume: "main-room",
  mode: "closestPoint",
  dampingHalfLife: 0.08,
});
```

### 9.4 Occlusion / Collision

第三人称常用策略：

```ts
constraints.occlusion({
  from: "targetPivot",
  to: "camera",
  radius: 0.25,
  minDistance: 0.6,
  collisionMask: "level",
  strategy: "pullForward",
  collisionHalfLife: 0.02,
  restoreHalfLife: 0.25,
});
```

行为：

1. 从 target pivot 到 desired camera position 做 spherecast。
2. 命中障碍物时把相机拉到命中点前方。
3. 碰撞时快速响应。
4. 遮挡解除后慢慢恢复距离。

---

## 10. Blend 与状态继承

### 10.1 Blend 类型

```txt
cut：立即切换。
blend：位置、旋转、FOV 等插值。
matchThenBlend：新机位先继承旧状态，再插值。
```

```ts
brain.activate("first-person", {
  blend: {
    duration: 0.18,
    curve: "smoothstep",
  },
  inherit: ["playerLook", "zoom"],
});
```

### 10.2 为什么 matchThenBlend 很重要

第三人称切第一人称时：

```txt
旧机位 yaw = 120°
旧机位 pitch = -8°
新机位如果使用默认 yaw/pitch，就会跳角。
新机位如果继承 playerLook channel，就会自然过渡。
```

因此 ViewRig 的切换不是简单插值两个 transform，而是：

```txt
1. 继承必要 channel。
2. 评估新 VirtualCamera 的合理目标状态。
3. 对 CameraState 做 blend。
4. 对 lens 和 noise weight 做 blend。
```

### 10.3 Blend 内容

需要支持：

```txt
position
rotation
fov / orthographicSize
near / far
shoulder offset
composer weight
noise weight
custom extension weight
```

---

## 11. Damping：统一使用 half-life

不要在核心中使用帧率相关的：

```ts
current = lerp(current, target, dt * damping);
```

统一使用半衰期：

```ts
function damp(current: number, target: number, halfLife: number, dt: number): number {
  if (halfLife <= 0) return target;
  const k = Math.pow(0.5, dt / halfLife);
  return target + (current - target) * k;
}
```

含义：

```txt
halfLife = 0.1：每 0.1 秒误差减半。
halfLife = 0：立即到达。
halfLife 越大：相机越重。
```

所有平滑参数统一命名：

```txt
positionHalfLife
rotationHalfLife
zoomHalfLife
composerHalfLife
confinerHalfLife
collisionHalfLife
restoreHalfLife
```

---

## 12. TypeScript API 草案

### 12.1 初始化

```ts
import { CameraBrain, rigs, aims, constraints, composers } from "@viewrig/core";
import { createThreeAdapter } from "@viewrig/adapter-three";

const brain = new CameraBrain({
  up: [0, 1, 0],
  worldProbe,
});

const adapter = createThreeAdapter();
```

### 12.2 Target

```ts
const playerTarget = targets.fromGetter(() => ({
  position: player.position,
  rotation: player.rotation,
  velocity: player.velocity,
  up: [0, 1, 0],
}));
```

### 12.3 Third person camera

```ts
const look = brain.channels.yawPitch("playerLook", {
  sensitivity: [0.002, 0.002],
  minPitch: -75,
  maxPitch: 80,
});

brain.add(createVirtualCamera({
  id: "third-person",
  priority: 10,
  target: playerTarget,

  rig: rigs.thirdPerson({
    look,
    pivotOffset: [0, 1.5, 0],
    shoulderOffset: [0.45, 0.05, 0],
    distance: 4,
    minDistance: 0.7,
    positionHalfLife: 0.12,
    rotationHalfLife: 0.06,
  }),

  composer: composers.screenZone({
    mode: "aim",
    dead: rectCenter(0.12, 0.10),
    soft: rectCenter(0.35, 0.28),
    hard: rectCenter(0.85, 0.70),
    dampingHalfLife: [0.12, 0.10],
  }),

  constraints: [
    constraints.occlusion({
      radius: 0.25,
      collisionMask: "level",
      collisionHalfLife: 0.02,
      restoreHalfLife: 0.25,
    }),
    constraints.confiner3D({
      volume: "main-room",
      dampingHalfLife: 0.08,
    }),
  ],
}));
```

### 12.4 First person camera

```ts
brain.add(createVirtualCamera({
  id: "first-person",
  priority: 0,
  target: playerTarget,

  rig: rigs.firstPerson({
    look,
    eyeOffset: [0, 1.65, 0],
    positionHalfLife: 0,
    rotationHalfLife: 0,
  }),
}));
```

### 12.5 Rail camera

```ts
brain.add(createVirtualCamera({
  id: "rail-intro",
  priority: 0,

  rig: rigs.rail({
    path: introPath,
    driver: {
      type: "time",
      duration: 4.5,
    },
  }),

  aim: aims.lookAt(playerTarget),
}));
```

### 12.6 Frame loop

```ts
function frame(dt: number) {
  input.update(dt);
  const state = brain.update(dt);
  adapter.apply(camera, state);
}
```

---

## 13. 引擎适配器设计

### 13.1 Adapter 只做转换

适配器不参与 camera 逻辑。

```ts
export interface EngineAdapter<TCamera> {
  apply(camera: TCamera, state: CameraState): void;
}
```

### 13.2 Three.js Adapter 示例

```ts
export function applyThreeCamera(camera: THREE.Camera, state: CameraState) {
  camera.position.set(state.position.x, state.position.y, state.position.z);
  camera.quaternion.set(
    state.rotation.x,
    state.rotation.y,
    state.rotation.z,
    state.rotation.w,
  );

  if (camera instanceof THREE.PerspectiveCamera && state.lens.fov != null) {
    camera.fov = state.lens.fov;
    camera.near = state.lens.near ?? camera.near;
    camera.far = state.lens.far ?? camera.far;
    camera.updateProjectionMatrix();
  }
}
```

### 13.3 Adapter 规则

- Adapter 可以依赖引擎。
- Adapter 不持有 gameplay 状态。
- Adapter 不计算 camera rig。
- Adapter 不读取 input。
- Adapter 不做 raycast，raycast 通过 WorldProbe 提供。

---

## 14. 输入模块设计

### 14.1 输入和相机解耦

`@viewrig/input` 不直接控制 CameraState，只写入 Channel。

```txt
PointerLockInput → YawPitchChannel
GamepadInput → YawPitchChannel / ZoomChannel
WheelInput → ZoomChannel
TouchInput → YawPitchChannel / OrbitPanChannel
```

### 14.2 输入 deadzone 与屏幕 dead zone 分离

```txt
输入 deadzone：处理手柄摇杆、触摸微动、鼠标噪声。
屏幕 dead zone：处理目标在画面中移动时是否触发构图修正。
```

这两个概念必须分开，否则手柄、锁定目标、自动构图会互相干扰。

### 14.3 Input Adapter 示例

```ts
const input = createPointerInput(canvas, {
  look,
  pointerLock: true,
  sensitivity: [0.002, 0.002],
});

const gamepad = createGamepadInput({
  look,
  deadzone: 0.12,
  acceleration: 1.4,
});
```

---

## 15. Debug 与调参工具

第一版应提供 debug overlay，但放在独立包。

### 15.1 Debug 内容

```txt
当前 live camera id
blend 进度
目标屏幕坐标
死区 / 软区 / 硬区
期望位置 / 约束后位置
collision hit point
confiner 边界
轨道 path 和 rail t
fps / update cost / allocation count
```

### 15.2 Debug 包策略

```txt
@viewrig/debug-core：产出 debug draw commands。
@viewrig/debug-three：把 debug draw commands 画到 Three.js。
@viewrig/debug-babylon：把 debug draw commands 画到 Babylon.js。
```

core 只提供 debug data，不直接画线。

---

## 16. 测试策略

### 16.1 测试层级

```txt
Unit tests：数学、damping、blend、clamp、zone 判断。
Golden tests：给定 target/input 时间序列，输出固定 camera trace。
Browser tests：在真实浏览器中验证 adapter 和 projection 行为。
Playground tests：最小三方引擎示例能启动、渲染、交互。
```

### 16.2 推荐测试用例

- **damping**：half-life 在不同 dt 下收敛一致。
- **blend**：cut / blend / matchThenBlend 输出连续。
- **composer**：目标在 dead 内不修正，越过 hard 立即修正。
- **third person**：collision 缩短距离，解除后平滑恢复。
- **first person**：pitch clamp，不翻转，不漂移。
- **rail**：targetProjection 不跳 t，能处理 path 端点。
- **confiner**：inside 不改，outside 投影到边界。
- **adapters**：state 写入引擎 camera 后矩阵更新。

---

## 17. 性能设计

### 17.1 每帧原则

- update 中尽量零分配。
- 避免隐式创建临时数组。
- scratch object 按 module/runtime 保存。
- 所有 raycast / spherecast 可配置频率或预算。
- Debug 模式可以分配；production core 不依赖 debug。

### 17.2 性能预算

MVP 目标：

```txt
单个 live camera：< 0.1 ms 常规逻辑，不含外部 raycast。
3-5 个 standby camera：可更新 target，但不做昂贵 constraint。
ThirdPerson + spherecast：主要成本来自外部 physics。
Debug overlay：不计入 production 预算。
```

### 17.3 Standby 策略

```txt
live：完整更新。
standby-light：更新 target 和 runtime state，不做 collision/confiner。
standby-off：不更新，激活时用 matchFromCurrent。
```

---

## 18. 发布和工程治理

### 18.1 package exports

```json
{
  "name": "@viewrig/core",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md", "LICENSE"]
}
```

### 18.2 CI 检查

```txt
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:browser
pnpm build
pnpm api:check
pnpm pack --dry-run
```

### 18.3 API 稳定性

建议使用 TSDoc release tags：

```txt
@public：稳定 API。
@beta：可用但可能改。
@alpha：实验 API。
@internal：不暴露。
```

API Extractor 可用于生成 API report，避免无意中改变公共 API [R8]。

### 18.4 发布策略

- 使用 Changesets 管理多包版本和 changelog。
- 小版本保持兼容，破坏性 API 只在 major 发布。
- adapter 包可独立发版。
- 使用 npm provenance 或 trusted publishing 记录包从哪里构建和发布，提升供应链可信度 [R10]。

---

## 19. MVP 路线

### Phase 1：Core 状态系统

```txt
CameraState
LensState
CameraTarget
CameraBrain
VirtualCamera
Blend
ChannelStore
Half-life damping
```

验收标准：能在无引擎环境下用测试驱动一个固定 target，输出稳定 CameraState trace。

### Phase 2：基础 Rig

```txt
FixedRig
FirstPersonRig
ThirdPersonRig
OrbitRig
YawPitchChannel
ZoomChannel
```

验收标准：Three.js 示例中可第一/第三人称切换，角度不跳。

### Phase 3：构图

```txt
ScreenZoneComposer
dead / soft / hard
projection helper
debug zone overlay
```

验收标准：目标在画面区域内移动时，相机按 dead/soft/hard 规则响应。

### Phase 4：约束

```txt
Confiner2D
Confiner3D
OcclusionConstraint
CollisionConstraint
WorldProbe adapters
```

验收标准：第三人称相机不会穿墙；相机位置不离开指定区域。

### Phase 5：轨道

```txt
CameraPath
RailRig
PolylinePath
SplinePath
time / input / targetProjection drivers
```

验收标准：相机可沿轨道播放，也可跟随 target 投影点。

### Phase 6：生态包

```txt
@viewrig/input
@viewrig/adapter-three
@viewrig/adapter-babylon
@viewrig/debug
examples
docs
```

验收标准：有完整 npm 包、文档、示例和浏览器测试。

---

## 20. 目录结构建议

```txt
packages/core/src/
  brain/
    CameraBrain.ts
    Blend.ts
    Activation.ts
  state/
    CameraState.ts
    LensState.ts
  target/
    CameraTarget.ts
    TargetSampler.ts
  channels/
    ChannelStore.ts
    YawPitchChannel.ts
    ZoomChannel.ts
  rigs/
    FixedRig.ts
    FirstPersonRig.ts
    ThirdPersonRig.ts
    OrbitRig.ts
    RailRig.ts
  aims/
    LookAtAim.ts
    YawPitchAim.ts
    FixedAim.ts
  composer/
    ScreenZoneComposer.ts
    RectNdc.ts
  constraints/
    Confiner2D.ts
    Confiner3D.ts
    OcclusionConstraint.ts
  math/
    Vec2.ts
    Vec3.ts
    Quat.ts
    Mat4.ts
    Projection.ts
  world/
    WorldProbe.ts
  debug/
    DebugState.ts
  index.ts
```

---

## 21. 重要架构决策 ADR

### ADR-001：Core 采用 TypeScript 而不是 WASM first

决定：第一版使用 TypeScript strict 实现 core。

原因：

- 与 Web 引擎适配成本最低。
- 调试和调参体验最好。
- 类型就是开发者 API。
- 性能瓶颈更可能在外部 physics 和渲染引擎，而不是相机控制标量数学。

### ADR-002：采用 Ports and Adapters

决定：Core 不引用具体引擎；所有引擎能力通过接口接入。

原因：

- 保证引擎无关。
- 易于测试。
- 支持 Three.js、Babylon.js、PlayCanvas、自研引擎并行演进。

### ADR-003：VirtualCamera 不是真实相机

决定：VirtualCamera 只产出 CameraState，不创建或持有引擎相机。

原因：

- 支持多个虚拟机位驱动一台真实相机。
- 支持 blend 和 priority。
- 支持 editor/playground/测试中无真实引擎运行。

### ADR-004：使用 Channel 保存输入状态

决定：yaw、pitch、zoom、shoulder、rail t 等状态放到 ControlChannel。

原因：

- 便于第一/第三人称切换继承状态。
- 便于输入设备解耦。
- 便于序列化、回放和测试。

### ADR-005：统一使用 half-life damping

决定：所有平滑参数使用 `halfLife` 命名和实现。

原因：

- 帧率无关。
- 含义直观。
- 参数可跨模块复用。

### ADR-006：Confiner、Collision、Occlusion 分开

决定：分别作为 Constraint 实现，而不是合成一个大模块。

原因：

- 语义不同。
- 性能成本不同。
- 调参方式不同。
- 用户可以按需组合。

---

## 22. 风险与缓解

- **API 过早复杂化**：如果概念像 Cinemachine 一样过多，第一版只保留 Brain / VirtualCamera / Rig / Aim / Composer / Constraint / Channel。
- **引擎适配污染 core**：如果 core 不小心 import Three.js 类型，CI 中禁止 core 依赖 engine packages。
- **每帧分配过多**：如果 Web 端出现 GC 抖动，使用 scratch runtime、allocation tests，并避免数组临时值。
- **碰撞手感差**：如果相机弹跳、穿墙、抖动，把 collisionHalfLife 与 restoreHalfLife 分离调节。
- **切机位跳角**：如果 FPS/TPS 切换不连续，使用 ControlChannel + matchThenBlend。
- **composer 难调**：如果 dead/soft/hard 行为不清晰，debug overlay 必须跟 MVP 一起做。
- **轨道系统范围膨胀**：如果 spline 编辑器做太大，MVP 只做 CameraPath 接口和基础 polyline/spline。
- **confiner 太复杂**：如果 concave mesh 代价高，MVP 支持 AABB、sphere、convex/custom callback。

---

## 23. 最终建议

ViewRig / 视角 的第一版应该做成：

```txt
TypeScript strict + ESM + pnpm monorepo
Core 纯数据管线
Ports and Adapters 架构
CameraBrain 管理 VirtualCamera
Rig / Aim / Composer / Constraint 可组合
ControlChannel 负责输入状态和跨机位继承
Half-life 统一平滑
Three / Babylon / PlayCanvas 通过 adapter 接入
Vite 用于 playground 和 demo
Vitest / Playwright 做测试
API Extractor / TypeDoc 做 API 稳定与文档
Changesets + npm provenance 做发布
```

核心心智模型：

```txt
Brain 负责“哪个视角生效，以及怎么过渡”。
VirtualCamera 负责“这个视角想要什么画面”。
Rig 负责“相机大概在哪里”。
Aim 负责“相机看向哪里”。
Composer 负责“目标在画面里怎么摆”。
Constraint 负责“相机不能违反哪些世界规则”。
Adapter 负责“把结果写进具体引擎”。
```

这套设计覆盖第一人称、第三人称、轨道、过渡、dead/soft/hard zone、confiner 和 collision，同时保持比 Cinemachine 更轻、更纯、更适合 Web 端。

---

## 24. 参考资料

[R1] Unity Cinemachine overview. https://docs.unity.cn/Packages/com.unity.cinemachine%402.2/manual/CinemachineOverview.html  
[R2] Unity Cinemachine procedural motion. https://docs.unity.cn/Packages/com.unity.cinemachine%403.1/manual/concept-procedural-motion.html  
[R3] TypeScript Project References. https://www.typescriptlang.org/docs/handbook/project-references  
[R4] pnpm Workspace documentation. https://pnpm.io/workspaces  
[R5] Vite Build / Library Mode documentation. https://vite.dev/guide/build.html  
[R6] Vitest Browser Mode documentation. https://vitest.dev/guide/browser/  
[R7] Playwright Browsers documentation. https://playwright.dev/docs/browsers  
[R8] API Extractor overview. https://api-extractor.com/pages/overview/intro/  
[R9] TypeDoc documentation. https://typedoc.org/  
[R10] npm provenance documentation. https://docs.npmjs.com/generating-provenance-statements  
[R11] Changesets repository and documentation. https://github.com/changesets/changesets  
[R12] Unity Cinemachine Position Control. https://docs.unity.cn/Packages/com.unity.cinemachine%403.0/manual/CinemachineVirtualCameraBody.html
