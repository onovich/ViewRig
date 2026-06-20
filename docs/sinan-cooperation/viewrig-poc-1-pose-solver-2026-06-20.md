# ViewRig / Sinan POC-1 Pose Solver Spike

日期：2026-06-20  
状态：M3 draft  
关联：`rfc-004-sinan-camera-pose-shot-rig-boundary.md`

## 1. 目标

POC-1 只验证 ViewRig 能从 target pose、yaw/pitch/distance 等纯数据输入输出 RuntimeCameraPose-compatible shape。它不替换 Sinan CameraShotPlayer，不接管 DirectorCameraSystem，不直接写 Three.Camera。

推荐数据流：

```txt
Sinan target/world/input fixture
  -> ViewRig FollowRig / OrbitRig
  -> CameraState
  -> RuntimeCameraPose-compatible mapper
  -> Sinan repo 内部 adapter
  -> WebRuntime.setCameraPose
```

## 2. 当前 ViewRig 交付

- `createYawPitchChannel`
- `createZoomChannel`
- `evaluateFollowRig`
- `evaluateOrbitRig`
- `toRuntimeCameraPose`
- deterministic golden trace fixtures in `@viewrig/testing`

## 3. Sinan 侧 POC adapter 草案

Sinan repo 内部 adapter 可以把 `RuntimeCameraPoseLike` 映射到 Sinan 自己的 `RuntimeCameraPose`：

```ts
const pose = toRuntimeCameraPose(viewRigState);

webRuntime.setCameraPose({
  position: pose.position,
  rotation: pose.rotation,
  fov: pose.fov,
  near: pose.near,
  far: pose.far,
  debug: pose.debug,
});
```

这段 adapter 属于 Sinan repo，不进入 ViewRig 公共包。等 POC-1/2/3 稳定后，再评估是否需要 `@viewrig/sinan`。

## 4. 验收

- ViewRig core 不 import Sinan、Three、DOM 或 physics engine。
- Runtime pose 是每帧输出，不写回 Sinan JSON。
- CameraShot JSON、Timeline camera track、preview/scrub/restore 仍由 Sinan 拥有。
- POC trace 可在无浏览器环境下 deterministic snapshot。

## 5. 后续

POC-2 建议接 Showcase Follow / Orbit Camera，用 InputFlow 或 Sinan InputSystem 写入 yaw/pitch/zoom channel，再由 ViewRig 输出 pose。
