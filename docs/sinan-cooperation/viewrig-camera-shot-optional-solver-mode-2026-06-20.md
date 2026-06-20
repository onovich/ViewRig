# ViewRig / Sinan CameraShot Optional Solver Mode

日期：2026-06-20  
状态：M8 draft  
关联：`viewrig-sinan-internal-poc-adapter-2026-06-20.md`、`rfc-004-sinan-camera-pose-shot-rig-boundary.md`

## 1. 目标

这份草案定义 Sinan CameraShot 如何以 optional mode 使用 ViewRig solver。目标是让某个 CameraShot 可以选择 follow、orbit、thirdPerson、rail 等求解能力，同时保持 Sinan 的 CameraShot JSON、CameraShotPlayer、DirectorCameraSystem、Timeline camera track、preview/scrub/restore、editor command/save/undo 仍是 source-of-truth。

## 2. 非目标

- 不替换 CameraShotPlayer。
- 不让 ViewRig 接管 DirectorCameraSystem。
- 不把 ViewRig runtime channel state 保存到 CameraShot JSON。
- 不把 Sinan adapter 发布成 ViewRig 公共 `@viewrig/sinan` package。
- 不在 ViewRig core 中 import Sinan、Three、DOM、React、Rapier 或 editor store。

## 3. Schema 扩展草案

建议 Sinan 在 CameraShot schema 中增加一个可选字段。字段缺失时行为必须完全等同当前 CameraShot。

```ts
interface CameraShotViewRigExtension {
  readonly version: 1;
  readonly enabled?: boolean;
  readonly solver: "none" | "follow" | "orbit" | "thirdPerson" | "rail";
  readonly rig?: Readonly<Record<string, unknown>>;
  readonly driver?: CameraShotViewRigDriver;
  readonly composer?: Readonly<Record<string, unknown>>;
  readonly constraints?: Readonly<Record<string, unknown>>;
}

type CameraShotViewRigDriver =
  | { readonly type: "fixed"; readonly t: number }
  | { readonly type: "time"; readonly duration: number; readonly offsetT?: number; readonly loop?: boolean }
  | { readonly type: "input"; readonly channel: "railT" | "zoom" | "look" | string }
  | { readonly type: "targetProjection"; readonly targetRef: string };
```

建议字段名先由 Sinan repo 内部决定，例如：

```json
{
  "id": "cam_gate_reveal",
  "type": "cameraShot",
  "viewRig": {
    "version": 1,
    "enabled": true,
    "solver": "rail",
    "driver": { "type": "time", "duration": 3.5 },
    "rig": {
      "path": {
        "type": "polyline",
        "points": [[0, 2, 6], [0, 2, 0], [4, 3, -4]]
      }
    }
  }
}
```

## 4. Runtime 映射

```txt
CameraShot JSON
  -> Sinan CameraShotPlayer selects shot
  -> optional viewRig extension mapper
  -> ViewRig CameraPath / RailRig / other solver
  -> CameraState
  -> RuntimeCameraPose
  -> WebRuntime.setCameraPose
```

规则：

- `viewRig.enabled !== true` 或 `solver === "none"` 时使用 Sinan 当前 CameraShot path。
- adapter 只读取 stable schema option，不读取 ViewRig runtime mutable state。
- input driver 的 channel 值来自 Sinan InputSystem、Timeline scrub context 或 editor preview context。
- `targetProjection.targetRef` 由 Sinan resolve 为世界 target pose，再传给 ViewRig adapter。
- ViewRig 输出的 `CameraState.debug` 可以进入 preview debug metadata，但不能成为持久化 source-of-truth。

## 5. Rail 对齐

ViewRig M8 已提供以下核心能力：

- `CameraPath`
- `PathSample`
- `PolylinePath`
- `RailRig`
- fixed/time/input/targetProjection driver

Sinan CameraShot 对齐建议：

- CameraShot 持久化 path authoring data，例如 polyline points 或未来 spline id。
- Runtime adapter 把 path authoring data 转成 ViewRig `CameraPath`。
- Timeline scrub 使用 deterministic time 或 fixed t。
- Gameplay camera 可以使用 input driver。
- 需要跟随目标最近路径点时使用 targetProjection driver。

## 6. Fallback 和兼容

- 如果 `viewRig` 字段不存在，旧 CameraShot 完全不变。
- 如果 solver 不支持，Sinan 应回退到当前 CameraShotPlayer 行为并记录 validation warning。
- 如果 path 数据为空或不兼容，Sinan 应拒绝保存或在 preview 中显示 invalid state。
- 如果 WorldProbe 不可用，constraint fallback 应 no-op 或 clamp-only。
- 如果 Timeline scrub 没有 input channel，input driver 应由 Sinan 提供 deterministic default。

## 7. 验收矩阵

进入 Sinan POC-3 前建议验证：

- CameraShot JSON round-trip 不产生 ViewRig runtime state。
- Timeline scrub 在相同 time 下输出 deterministic RuntimeCameraPose。
- preview/restore 不污染 editor viewport camera。
- unsupported solver 可以 fallback。
- browser smoke 可见 camera pose 随 shot time、fixed t、input channel 或 targetProjection 变化。
- ViewRig core 仍无宿主依赖。

## 8. 后续

这个草案只定义 optional solver mode 的边界。真正落地应先放在 Sinan repo 内部 adapter 中，完成 POC-3 后再评估是否需要公开 adapter 包。
