# ViewRig / Sinan 合作评估与研发计划

日期：2026-06-20  
依据：

- `docs/sinan-cooperation/rfc-004-sinan-camera-pose-shot-rig-boundary.md`
- `docs/sinan-cooperation/sinan-technical-advisory-2026-06-20.md`
- `docs/sinan-cooperation/sinan-business-letter-2026-06-20.md`
- `docs/ViewRig_视角_设计文档.md`

## 1. 总体判断

Sinan 提出的边界是合理的，并且对 ViewRig 是正向机会。

核心原因是：Sinan 的 CameraShot、DirectorCameraSystem、Timeline camera track、editor command/save/undo、preview/scrub/restore 已经构成它自己的相机语义和导演系统事实源。ViewRig 如果试图替代这些能力，会和 Sinan 的核心差异点冲突，也会把自己绑进特定引擎和编辑器工作流。相反，ViewRig 作为可拔插的 camera pose solver / rig algorithm library，正好补齐 Sinan 不该自己深挖的高级相机手感领域。

建议接受以下合作定位：

```txt
Sinan owns camera semantics and director ownership.
ViewRig owns reusable camera pose solving and rig algorithms.
Adapters bridge ViewRig CameraState to host RuntimeCameraPose / engine camera.
```

这不削弱 ViewRig 的引擎无关定位，反而迫使第一版更专注：先把“输入意图 / target trace / world probe 到稳定 CameraState trace”的纯数据管线做硬。

## 2. 合理性评估

### 2.1 RFC-004 合理

RFC 把相机系统拆成三层：

```txt
Sinan Camera Contract
Camera Rig / Solver Backend
Runtime Camera Adapter
```

这与 ViewRig 原设计中的 Ports and Adapters、VirtualCamera、CameraBrain、CameraState 完全兼容。RFC 明确拒绝 ViewRig 接管 CameraShot JSON、DirectorSystem、Timeline camera track 和 Three.Camera，这些限制是健康边界，不是商业压制。

ViewRig 可以进入的位置很清晰：

```txt
CameraShot JSON / gameplay camera intent
  -> Sinan CameraSystem / DirectorCameraSystem
  -> optional ViewRig solver
  -> RuntimeCameraPose
  -> WebRuntime.setCameraPose
```

### 2.2 技术顾问建议合理

技术建议中最重要的修正是：

- `CameraState` 必须成为唯一核心输出。
- M0 就要写死坐标约定。
- 弱化 `@viewrig/input`，强化 `ControlChannel`。
- core 只依赖 `WorldProbe` 接口，不依赖 Three/Rapier/Sinan。
- golden trace 比截图更适合作为 core 正确性测试。
- 首批包拆分要少，不要过早铺开 adapter 和生态包。

这些建议会让 ViewRig 更像一个可验证的算法核心，而不是一个过早膨胀的 camera framework。

### 2.3 商务函合理

商务函没有提出收购、排他或替代性要求，只提出 first-party design partner 和 POC 先行。这是低风险合作方式。它要求 ViewRig 回答的五个问题都属于接口边界问题，不是商业锁定。

风险主要在执行层：

- 不要被 Sinan 的需求牵引成 Sinan-only 库。
- 不要为了 POC 把 Sinan schema、Three 类型或 editor store 泄漏进 core。
- 不要把 runtime rig state 持久化成 host source-of-truth。
- 不要提前承诺官方 adapter 的维护责任。

## 3. ViewRig 需要做出的调整

### 3.1 定位调整

原定位“引擎无关的游戏相机控制库”保持不变，但第一版对外表达应更精确：

```txt
Engine-agnostic camera pose solver and rig algorithms for games.
```

也就是说，ViewRig 第一版不争夺宿主项目的 camera ownership、director ownership、timeline ownership 或 editor ownership。它输出 `CameraState`，由宿主 adapter 决定如何应用。

### 3.2 API 中心调整

`CameraState` 是唯一核心输出。后续所有能力都围绕它：

- rig 产出期望姿态。
- aim 修正朝向。
- composer 修正构图。
- constraint 修正世界约束。
- blend 修正过渡状态。
- debug data 附着在 state 或 trace metadata 上。

不得从 core 返回：

- `THREE.Camera`
- `Object3D`
- DOM event
- host scene node
- host editor command
- Sinan `CameraShot` 私有对象

### 3.3 坐标约定前置

新增 M0：Coordinate Contract。必须先定义并测试：

- handedness。
- up axis。
- forward axis。
- yaw / pitch / roll 顺序。
- quaternion multiplication order。
- fov 单位。
- near / far 默认策略。
- NDC / screen zone 坐标范围。
- host adapter 如何做坐标转换。

这个工作应早于 ThirdPersonRig、RailRig 和 Sinan POC。

### 3.4 输入系统降级为 intent/channel

`@viewrig/input` 不作为 v0.1 首批包。ViewRig core 只拥有 `ControlChannel` 和 channel trace：

```txt
yaw
pitch
zoom
shoulder
railT
lookDelta
orbitIntent
```

raw input、rebinding、input context、replay 由宿主、InputFlow 或示例 adapter 提供。

### 3.5 包拆分收敛

原设计中 `input`、`path`、`adapter-babylon`、`adapter-playcanvas`、`devtools` 可以延后。v0.1 首批建议只保留：

```txt
@viewrig/core
@viewrig/testing
@viewrig/adapter-three
@viewrig/debug
```

其中 `@viewrig/testing` 负责 golden trace fixture、snapshot matcher、fake WorldProbe、deterministic dt/channel/target trace。

### 3.6 Sinan adapter 策略

短期不发布 `@viewrig/sinan`。第一阶段建议 adapter 放在 Sinan repo 内部，作为 POC adapter，原因：

- Sinan schema 和 RuntimeCameraPose 仍在演进。
- 可以快速验证 `WebRuntime.setCameraPose` 和 editor/play mode 隔离。
- 不把不稳定的 Sinan contract 过早固化成 ViewRig 公共包。

当 POC-1/2/3 都稳定后，再评估独立 `@viewrig/sinan`。

### 3.7 持久化边界

ViewRig 可以定义 serializable config，但不能把 private runtime state 当成 source-of-truth。对 Sinan：

- 持久化配置必须映射为 Sinan schema 扩展。
- runtime channel / blend / damping cache / scratch object 不写进 Sinan JSON。
- `RuntimeCameraPose` 是每帧输出，不是 authoring data。

## 4. 对 Sinan 商务函五个问题的建议回复

1. 接受 Sinan 保留 CameraShot / DirectorCameraSystem source-of-truth。  
   这是合理边界，ViewRig 不应接管宿主引擎的 authoring 和 director ownership。

2. ViewRig 第一阶段可以只输出 RuntimeCameraPose / CameraState，不触碰 Three.Camera。  
   这也是 ViewRig core 的正确方向。Three camera 写入只能发生在 adapter。

3. WorldProbe 应与 Sinan PhysicsProbe 通过接口适配对齐。  
   ViewRig 定义最小 probe interface；Sinan 提供 adapter，把 PhysicsProbe / World query 映射成 raycast、spherecast、containsPoint、closestPoint。

4. 第一条可见 POC 建议选择 follow/orbit，而不是 rail。  
   follow/orbit 更适合 Showcase player camera，依赖少、反馈直观、能证明 gameplay camera value。Rail 更适合 CameraShot Enhancement 阶段。

5. Sinan adapter 先放在 Sinan repo，稳定后再抽出 `@viewrig/sinan`。  
   这样能降低 contract 变更成本，避免 ViewRig 过早承诺 Sinan adapter 的公共 API 和维护矩阵。

## 5. 重新梳理后的研发计划

### M0：Contract Foundation

目标：把 ViewRig 的不可变边界写清楚。

交付：

- `CameraState` / `LensState` / `CameraDebugState` 草案。
- coordinate convention 文档。
- `Vec2Like` / `Vec3Like` / `QuatLike` 输入类型。
- public snapshot 类型与内部 mutable scratch 分离。
- `WorldProbe` 最小接口草案。
- `ControlChannel` 最小接口草案。

验收：

- core 文档明确无 Three、DOM、React、Sinan、physics dependency。
- 坐标、FOV、NDC、rotation order 有测试或 fixture。

### M1：Deterministic Trace Core

目标：先证明无引擎环境下可稳定输出相机 trace。

交付：

- 极小 math 层：Vec2、Vec3、Quat、Mat4 或 Projection 所需子集。
- half-life damping。
- target trace / channel trace / dt trace fixture。
- `@viewrig/testing` golden trace harness。
- Fixed pose solver spike。

验收：

- 给定 target/input/dt，输出 deterministic `CameraState` snapshot。
- 不需要 Three、浏览器或 Sinan。

### M2：Brain And Blend

目标：建立 ViewRig 的虚拟相机调度模型。

交付：

- `VirtualCamera`。
- `CameraBrain`。
- activation policy。
- `cut`。
- `blend`。
- `matchThenBlend`。
- channel inheritance。

验收：

- 两个 virtual camera 之间切换稳定。
- yaw/pitch/zoom 等状态能跨机位继承。
- golden trace 覆盖 cut / blend / matchThenBlend。

### M3：Basic Gameplay Rigs

目标：先做 Sinan POC 最需要的 gameplay camera 能力。

交付：

- `YawPitchChannel`。
- `ZoomChannel`。
- `FixedRig`。
- `FollowRig` 或 `OrbitRig`。
- `FirstPersonRig`。
- `ThirdPersonRig` 最小版。

验收：

- POC-1 Pose Solver Spike 可完成：输入 target pose + yaw/pitch/distance，输出 RuntimeCameraPose-compatible state。
- follow/orbit trace 可 snapshot。
- core 仍无 host dependency。

### M4：Composer And Debug Data

目标：把 camera feel 中最重要的可调部分变成可测、可视化的数据。

交付：

- `ScreenZoneComposer`。
- dead / soft / hard zone。
- projection helper。
- debug metadata：live camera id、blend weight、target NDC、zone rects。
- debug draw command 数据模型。

验收：

- target 在 dead 内不修正。
- target 超过 soft/hard 时按规则修正。
- debug data 不依赖具体 renderer。

### M5：WorldProbe Constraints

目标：完成 collision/confiner 的接口闭环，但不绑定物理引擎。

交付：

- fake WorldProbe。
- DistanceClamp。
- YawPitchClamp。
- Confiner2D / Confiner3D 最小版。
- Collision / Occlusion 最小策略。
- no-probe fallback。

验收：

- constraint trace deterministic。
- 无 physics hard dependency 时行为安全。
- Sinan PhysicsProbe 可通过 adapter 映射进来。

### M6：Adapters And POCs

目标：把 core 接入真实宿主，但保持可拔除。

交付：

- `@viewrig/adapter-three` 最小 playground。
- `@viewrig/debug` 或 debug-three 最小 overlay。
- Sinan repo 内部 POC adapter。
- POC-2 Showcase Follow / Orbit Camera。
- POC-3 CameraShot Enhancement 设计草案。

验收：

- Three playground 中相机 pose 可见变化。
- Sinan gameplay camera 可启停，不影响 editor camera。
- `WebRuntime.setCameraPose` 应用 ViewRig 输出。
- Sinan 内置 CameraShotPlayer 和 camera path 可 fallback。

### M7：Rail And CameraShot Enhancement

目标：在 core 稳定后推进 rail/path 与 Sinan CameraShot 增强。

交付：

- `CameraPath` interface。
- `RailRig`。
- PolylinePath。
- time / input / targetProjection driver。
- CameraShot optional solver mode 对齐方案。

验收：

- Timeline scrub 可预测。
- ViewRig runtime state 不进入 Sinan JSON。
- Rail trace deterministic。

## 6. 优先级变化摘要

上调：

- Coordinate Contract。
- `CameraState` / `RuntimeCameraPose` 桥接思维。
- golden trace harness。
- `ControlChannel`。
- follow/orbit POC。
- debug data。

下调：

- 完整 `@viewrig/input`。
- Babylon / PlayCanvas adapter。
- Devtools。
- 复杂 rail 编辑能力。
- concave mesh / navmesh confiner。
- CJS 兼容产物。

## 7. 当前结论

ViewRig 应接受 Sinan 的合作边界，但不能变成 Sinan 的附属 camera module。最稳的路线是：

```txt
先做纯 core solver。
再做 deterministic trace。
再做 follow/orbit gameplay POC。
再接 Sinan RuntimeCameraPose。
最后再做 CameraShot enhancement、collision/confiner 和官方 adapter。
```

这样既能服务 Sinan 的真实需求，也能保留 ViewRig 作为独立、引擎无关相机库的长期价值。
