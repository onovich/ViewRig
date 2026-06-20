# ViewRig / Sinan Internal POC Adapter Design

日期：2026-06-20  
状态：M7 draft  
关联：`viewrig-poc-1-pose-solver-2026-06-20.md`、`rfc-004-sinan-camera-pose-shot-rig-boundary.md`

## 1. 目标

这份文档定义 Sinan repo 内部 POC adapter 的最小设计。它的职责是把 Sinan 的 target、input、WorldProbe、CameraShot intent 映射为 ViewRig solver 输入，再把 `CameraState` 转回 Sinan 的 `RuntimeCameraPose`，最后交给 `WebRuntime.setCameraPose` 或等价 runtime camera API。

POC adapter 不进入 ViewRig 公共 packages，不发布 `@viewrig/sinan`，不替代 Sinan 的 CameraShotPlayer、DirectorCameraSystem、Timeline camera track、editor command/save/undo 规则。

## 2. 放置位置

建议先放在 Sinan repo 内部，例如：

```txt
src/camera/viewrig/
  SinanViewRigAdapter.ts
  SinanViewRigWorldProbe.ts
  SinanViewRigMapper.ts
  SinanViewRigAdapter.test.ts
```

如果 Sinan 已经有 runtime/editor 分层，也可以拆为：

```txt
src/runtime/camera/viewrig/
src/editor/camera/viewrig/
```

规则：

- runtime adapter 只能依赖 Sinan runtime camera contract 和 ViewRig public API。
- editor adapter 只负责 preview/scrub/debug UI 绑定，不保存 ViewRig runtime state。
- 任何 schema 持久化都必须通过 Sinan CameraShot schema extension，而不是保存 ViewRig 私有对象。

## 3. 数据流

```txt
Sinan CameraShot / gameplay camera intent
  -> Sinan source selector
  -> SinanViewRigAdapter input mapper
  -> ViewRig rig / brain / constraint solver
  -> CameraState
  -> RuntimeCameraPose mapper
  -> WebRuntime.setCameraPose
```

POC-1 可以不接入真实 CameraShot，只用 deterministic fixture。POC-2 再接入 gameplay follow/orbit camera。POC-3 才考虑 CameraShot optional solver mode。

## 4. 最小接口草案

```ts
interface SinanViewRigAdapterInput {
  readonly mode: "gameplay" | "director-preview" | "timeline-scrub";
  readonly deltaSeconds: number;
  readonly targetPose: {
    readonly position: readonly [number, number, number];
    readonly rotation?: readonly [number, number, number, number];
  };
  readonly channels: {
    readonly yaw?: number;
    readonly pitch?: number;
    readonly zoom?: number;
    readonly shoulder?: number;
    readonly railT?: number;
  };
  readonly shot?: {
    readonly id: string;
    readonly solver?: "none" | "follow" | "orbit" | "thirdPerson" | "rail";
    readonly rigConfig?: unknown;
  };
}

interface SinanViewRigAdapterOutput {
  readonly pose: RuntimeCameraPose;
  readonly debug?: {
    readonly liveCameraId?: string;
    readonly tags?: readonly string[];
    readonly metadata?: Readonly<Record<string, unknown>>;
  };
}
```

实现可以先用 `evaluateOrbitRig`、`evaluateFollowRig`、`toRuntimeCameraPose` 做直通 POC。后续如果要接 `CameraBrain`，仍由 Sinan 的 source selector 决定何时启用 ViewRig，不让 ViewRig 反向接管 Director ownership。

## 5. Source Of Truth 边界

Sinan 保留：

- `data/cameraShots/*.json`
- CameraShot schema
- CameraShotPlayer
- DirectorCameraSystem
- Timeline camera track
- preview/scrub/restore
- editor command/save/undo

ViewRig 提供：

- pure solver config
- channel/control input consumption
- `CameraState`
- composer/debug metadata
- constraint/probe contracts

Runtime pose 是每帧输出，不是持久化事实源。Sinan 如果要保存 solver option，只保存 Sinan schema 中的 stable option，例如 `solver: "orbit"` 和经过 review 的 rig config。

## 6. WorldProbe 映射

Sinan adapter 可以把 Sinan world/physics query 包成 ViewRig `WorldProbe`：

```ts
const worldProbe: WorldProbe = {
  raycast: (query) => sinanPhysics.raycast(mapRay(query)),
  spherecast: (query) => sinanPhysics.spherecast(mapSphere(query)),
  containsPoint: (query) => sinanWorldBounds.contains(mapPoint(query.point)),
  closestPoint: (query) => sinanWorldBounds.closestPoint(mapPoint(query.point)),
};
```

失败策略：

- 没有 physics 时 probe 为 `undefined`，ViewRig constraint fallback 必须 no-op 或 clamp-only。
- probe 返回 incompatible shape 时 adapter 丢弃该 hit 并记录 debug metadata。
- ViewRig core 不能 import Rapier、Three、Sinan world store 或 editor store。

## 7. Editor / Runtime 模式

`gameplay`：

- input system 写入 yaw/pitch/zoom channel。
- Sinan gameplay camera source selector 启用 ViewRig solver。
- 输出 pose 写入 runtime camera。

`director-preview`：

- CameraShotPanel 或 preview controller 提供 shot intent。
- adapter 只预览，不提交 JSON。
- restore 规则仍由 Sinan DirectorCameraSystem 管。

`timeline-scrub`：

- scrub time 生成 deterministic input。
- adapter 输出当前帧 pose。
- 不保存 runtime channel state。

Editor viewport camera 必须独立，不和 gameplay/director camera 共用 mutable state。

## 8. 验证计划

POC adapter 进入 Sinan 主线前至少需要：

- deterministic pose mapper test
- no-probe fallback test
- editor camera 与 gameplay camera 隔离测试
- director preview restore 测试
- browser smoke：camera pose 随 yaw/pitch/zoom 或 shot time 变化
- CameraShot JSON round-trip：没有 ViewRig runtime state 泄漏进持久化数据

ViewRig 侧只需要维护 public API、trace fixtures 和设计文档。Sinan 侧维护真实 adapter、browser smoke 和 editor integration tests。

## 9. 拒绝方案

以下方案不进入 POC：

- 在 ViewRig repo 新增公共 `@viewrig/sinan` package。
- 用 ViewRig config 替换 Sinan CameraShot JSON。
- 让 ViewRig 直接调用 `WebRuntime.setCameraPose`。
- 让 ViewRig 直接读取 Three camera、scene graph、DOM input 或 editor store。
- 把 runtime channel state 写回 CameraShot。
- 为了 POC 删除或重写现有 CameraShotPlayer。

## 10. 下一步

R38 收口 M7 时，需要把本设计、adapter-three、three-orbit-playground、browser smoke 和 debug overlay 一起放进验证矩阵。M8 再补 RailRig / CameraPath / CameraShot optional solver mode 的草案闭环。
