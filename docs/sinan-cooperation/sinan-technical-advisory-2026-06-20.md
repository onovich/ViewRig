# Sinan 技术顾问建议：ViewRig

> 日期：2026-06-20
> 角色：Sinan Engine 领头技术顾问视角
> 阅读对象：ViewRig 项目负责人、架构负责人、后续 Sinan adapter 负责人
> 依据文档：`docs/ViewRig_视角_设计文档.md`、`docs/sinan-cooperation/rfc-004-sinan-camera-pose-shot-rig-boundary.md`

## 1. 总体判断

ViewRig 的方向清晰，且和 Sinan 的边界天然互补。Sinan 已经有 CameraShot schema、CameraShotPlayer、DirectorCameraSystem、Timeline camera track、editor CameraShotPanel 和 `WebRuntime.setCameraPose`。这些属于 Sinan 的镜头事实源和导演系统，不应该外包。ViewRig 更适合提供高级相机 solver：follow、orbit、third-person、rail、blend、composer、collision、confiner、shake。

换句话说，ViewRig 不应该成为“相机系统的所有者”，而应该成为“相机姿态求解器和 rig 算法库”。

建议合作定位：

```txt
Sinan owns camera shots, director ownership, timeline preview, editor commands.
ViewRig owns reusable camera pose solving, blending, composer, constraints.
Runtime adapter applies final pose to engine camera.
```

对 ViewRig 自身来说，第一版最该证明的是：在没有 Three.js、没有真实渲染器、没有 Sinan 的情况下，给定 target/input/world probe trace，能输出稳定、可测试、低分配的 `CameraState` trace。

## 2. 架构建议

### 2.1 CameraState 是唯一核心输出

建议把 `CameraState` 视为 ViewRig 的中心公共契约。所有 rig、aim、composer、constraint、blend 最终都只服务于稳定输出：

```txt
position
rotation 或 target/up
lens
time/frame
debug metadata
```

core 不应返回 Three.Camera、matrixWorld、Object3D、scene node 或 DOM event。adapter 负责把 `CameraState` 写入具体引擎。

### 2.2 坐标约定需要尽早写死

相机库最容易在坐标约定上埋坑。建议在 M0 写明：

- 默认右手系还是左手系。
- 默认 up axis。
- `forward` 的定义。
- yaw/pitch/roll 顺序。
- quaternion multiplication order。
- fov 单位。
- near/far 默认值策略。
- NDC/screen zone 坐标范围。

如果要支持多引擎坐标差异，建议通过 adapter 或 `CoordinateConvention` 转换，不要让 core 的每个算法都自己猜。

### 2.3 Input 模块要弱化，ControlChannel 要强化

ViewRig 设计里有 `@viewrig/input`。考虑到 InputFlow 也在合作矩阵里，ViewRig 不应该再做一个完整输入系统。建议 ViewRig core 只拥有 `ControlChannel`：

```txt
yaw
pitch
zoom
shoulder
railT
lookDelta
orbitIntent
```

这些 channel 可以由 InputFlow、宿主代码、测试 trace 或 editor gizmo 写入。`@viewrig/input` 如果存在，也应只是示例/adapter，不要和 InputFlow 抢 raw input / rebinding / replay 的职责。

### 2.4 WorldProbe 必须是接口，不是物理系统

collision、occlusion、confiner 需要 world query，但 ViewRig 不应引入 Rapier、Three raycaster 或宿主 scene graph。

建议：

```ts
interface WorldProbe {
  raycast?(...): Hit | null;
  spherecast?(...): Hit | null;
  containsPoint?(...): boolean;
  closestPoint?(...): Vec3Like;
}
```

ViewRig core 只依赖 probe interface。Three/Rapier/Sinan/其他引擎各自实现 adapter。

### 2.5 Composer 要和 input deadzone 分离

设计文档已经提到这个点，建议把它变成测试规则。输入 deadzone 处理摇杆/鼠标噪声；screen dead/soft/hard zone 处理目标构图。它们不能共用同一个配置或同一个概念名。

测试应覆盖：

- 输入在 deadzone 内不改变 yaw/pitch。
- 目标在 screen dead zone 内不触发 composer 修正。
- 目标越过 hard zone 立即修正。

## 3. 技术栈建议

### 3.1 第一版建议 ESM-only

设计文档提到 ESM first，必要时提供 CJS。建议 v0.x 直接 ESM-only，避免 dual package hazard 和测试矩阵膨胀。等真实用户强烈要求再评估 CJS。

### 3.2 包拆分先少后多

建议首批只做：

```txt
@viewrig/core
@viewrig/testing
@viewrig/adapter-three
@viewrig/debug
```

`adapter-babylon`、`adapter-playcanvas`、`devtools`、`input`、`path` 可以先作为 internal module 或 examples，等 core API 稳定再独立发布。

### 3.3 小数学层是必要的

core 不依赖 Three math 是正确的。建议使用极小内部 math 层：

- Vec2 / Vec3 / Quat / Mat4。
- 对外接受 `Vec3Like`。
- 内部使用 mutable scratch。
- public snapshot 输出 plain readonly object 或 tuple。

不要在 public API 暴露内部 mutable scratch 对象，否则用户可能保存引用导致后续帧被改写。

### 3.4 Golden trace 比截图更重要

相机库的核心测试不应依赖截图。建议建立 golden trace：

```txt
target trace + channel trace + dt trace + probe fixture
  -> camera state trace
```

这比 Playwright screenshot 更稳定，也更适合 AI review。浏览器示例 smoke 可以验证 adapter 和可视变化，但 core 正确性靠 trace。

## 4. 与 Sinan 的合作建议

### 4.1 不替换 CameraShotPlayer

Sinan 的红线很清楚：

- 不替换 `data/cameraShots/*.json`。
- 不替换 CameraShotPlayer。
- 不替换 DirectorCameraSystem。
- 不接管 timeline camera track。
- 不直接操作 Three.Camera。

ViewRig 可以进入的位置是：

```txt
Sinan CameraShot / gameplay camera intent
  -> Sinan camera system chooses source
  -> ViewRig solver optionally computes pose
  -> RuntimeCameraPose
  -> WebRuntime.setCameraPose
```

### 4.2 Sinan POC 建议

建议按 RFC-004，但先做更小的 solver spike：

1. **Pose Solver Spike**
   - 输入 target transform。
   - 输入 yaw/pitch/distance。
   - 输出 `RuntimeCameraPose`。
   - 无 Three。
   - snapshot test。

2. **Follow / Orbit Gameplay Camera**
   - 由 Sinan/InputFlow 提供 look/orbit intent。
   - World 提供 player transform。
   - ViewRig 输出 pose。
   - Sinan 应用到 `WebRuntime.setCameraPose`。

3. **CameraShot Enhancement**
   - 给某个 Sinan camera shot 增加可选 solver mode。
   - 数据仍保存为 Sinan schema。
   - timeline scrub 仍可预测。

4. **Collision / Confiner**
   - 等 Sinan Physics/WorldProbe 稳定后做。
   - 没有 probe 时 fallback 正常。

### 4.3 Sinan 最关心的验收

ViewRig adapter 进入 Sinan 主线前至少要满足：

- core 不 import Three。
- core 不 import Sinan。
- pose tests deterministic。
- editor camera 和 gameplay camera 隔离。
- director camera restore 规则不被破坏。
- private runtime rig state 不保存进 Sinan JSON。
- browser smoke 可看到 camera pose 变化。
- Sinan 内置 camera path 可 fallback。

## 5. 实现优先级

### Stage A：State And Math

- CameraState。
- LensState。
- Vec3/Quat math。
- coordinate convention doc。
- half-life damping。
- golden trace harness。

### Stage B：Brain And Blend

- VirtualCamera。
- CameraBrain。
- cut。
- blend。
- matchThenBlend。
- activation policy。

### Stage C：Basic Rigs

- FixedRig。
- FirstPersonRig。
- ThirdPersonRig。
- OrbitRig。
- YawPitchChannel。
- ZoomChannel。

### Stage D：Composer

- ScreenZoneComposer。
- dead/soft/hard zones。
- projection helper。
- debug data。

### Stage E：Constraints And Adapter

- DistanceClamp。
- YawPitchClamp。
- basic collision with WorldProbe fake。
- adapter-three。
- debug overlay example。

## 6. 最大风险

### 风险一：过早复刻完整 Cinemachine

Cinemachine 很强，但 ViewRig v0.1 不需要全量复制。第一版只需要证明核心心智模型跑通：Brain、VirtualCamera、Rig、Aim、Composer、Constraint、Channel、Adapter。

### 风险二：坐标和状态隐式

如果 yaw/pitch、up、forward、rotation order 没写清楚，后续每个 adapter 都会补丁化。建议 M0 就把 coordinate convention 和 conversion tests 写好。

### 风险三：输入系统越界

ViewRig 需要 camera control intent，但不需要 raw input framework。InputFlow 更适合做 raw input、context、rebind、replay。ViewRig 只消费 channel。

### 风险四：debug overlay 过晚

相机手感很难凭数字理解。debug data 可以在 core，debug renderer 放 adapter。Screen zone、collision hit、blend weight、live camera id 这些信息应该尽早可视化。

## 7. 建议的 v0.1 Definition of Done

ViewRig v0.1 建议满足：

- core 无 Three、DOM、React、Sinan、physics engine 依赖。
- 坐标约定文档和测试明确。
- CameraState trace 可 deterministic snapshot。
- CameraBrain 支持 cut/blend。
- Fixed/FirstPerson/ThirdPerson/Orbit 可用。
- ScreenZoneComposer 可用。
- WorldProbe fake 可驱动一个 constraint test。
- adapter-three 可运行一个最小 playground。
- debug data 可输出。
- Sinan pose solver spike 可运行，但不替换 CameraShotPlayer。

## 8. 给项目方的一句话建议

ViewRig 的第一版不要急着做“所有相机模式”，而要先把“输入/目标/世界探针到稳定 CameraState trace”的纯数据管线做硬。只要这个管线稳定，follow、orbit、rail、collision、Sinan camera shot enhancement 都只是逐步增加 solver 能力。
