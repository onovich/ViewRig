# ViewRig / Sinan PhysicsProbe Adapter Contract

日期：2026-06-20  
状态：M6 draft  
关联：`rfc-004-sinan-camera-pose-shot-rig-boundary.md`

## 1. 边界

ViewRig core 只依赖 `WorldProbe` 接口：

```ts
interface WorldProbe {
  raycast?(ray, maxDistance, mask): HitLike | null;
  spherecast?(ray, radius, maxDistance, mask): HitLike | null;
  containsPoint?(volumeId, point): boolean;
  closestPoint?(volumeId, point): Vec3Like;
}
```

Sinan PhysicsProbe / World query 的具体实现必须留在 Sinan repo 内部 adapter，不进入 ViewRig core。

## 2. 推荐映射

```txt
ViewRig raycast    -> Sinan PhysicsProbe.raycast / world query ray
ViewRig spherecast -> Sinan PhysicsProbe.spherecast 或 capsule/sweep fallback
containsPoint      -> Sinan volume/region query
closestPoint       -> Sinan volume closest point 或自定义 region adapter
```

`LayerMask` 可以先映射为 Sinan collision group、tag、layer id 或 adapter-local string。ViewRig 不解释 mask 语义。

## 3. Fallback

如果 Sinan 当前 POC 没有 physics capability：

- `safeRaycast` 返回 `null`。
- `safeSpherecast` 返回 `null`。
- `safeContainsPoint` 返回 `true`，让 constraint no-op。
- `safeClosestPoint` 返回输入 point snapshot。

这样 gameplay camera 可先运行，等 PhysicsProbe 稳定后再启用 collision/confiner。

## 4. 验收

- ViewRig core 不 import Sinan PhysicsProbe、Rapier、Three Raycaster。
- Collision / Occlusion / Confiner 在无 probe 时安全 no-op。
- Fake WorldProbe 可驱动 deterministic tests。
- Sinan adapter 可拔除，CameraShot / Director source-of-truth 不变。
