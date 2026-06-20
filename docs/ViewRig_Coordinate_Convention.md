# ViewRig Coordinate Convention

日期：2026-06-20  
状态：M0 contract draft

## 1. 默认世界坐标

ViewRig core 的默认坐标约定是：

- 右手系。
- `+Y` 是 up。
- `-Z` 是 camera forward。
- `+X` 是 camera right。
- FOV 单位固定为 degree。
- NDC / screen zone 坐标范围固定为 `-1..1`。

宿主引擎如果使用不同坐标系，由 adapter 做转换。core solver 不在每个 rig、composer 或 constraint 内猜测宿主坐标系。

## 2. 相机姿态语义

`CameraState.position` 表示相机在 ViewRig 默认世界坐标中的位置。`CameraState.rotation` 表示相机从默认相机朝向转换到最终朝向的四元数。

默认相机朝向为：

```txt
X right
+Y up
-Z forward
```

`CameraState.up` 是输出姿态的 up vector snapshot，用于 adapter 和 debug，不替代 `rotation`。

## 3. Yaw / Pitch / Roll

M0 默认规则：

- yaw 围绕默认 up axis。
- pitch 围绕相机 local right axis。
- roll 围绕相机 local forward axis。
- 欧拉顺序以 yaw -> pitch -> roll 表达 intent。
- 后续 M1/M2 实现四元数 helper 时，必须用测试固定乘法顺序。

## 4. Lens

Perspective FOV 使用 degree，不使用 radian。默认 near / far 策略由 `LensState` 草案定义：

```txt
near: adapter 或 lens config 提供；未提供时 adapter 可保留宿主默认值。
far: adapter 或 lens config 提供；未提供时 adapter 可保留宿主默认值。
```

Orthographic size 表示垂直方向 size。

## 5. NDC / Screen Zone

ViewRig 的 NDC 约定：

```txt
x = -1 left, 0 center, +1 right
y = -1 bottom, 0 center, +1 top
```

`ScreenZoneComposer` 后续只消费这个范围。输入 deadzone 与 screen dead/soft/hard zone 是两个独立概念，不能共享配置。

## 6. Adapter 责任

Adapter 负责：

- 把宿主坐标系转换为 ViewRig 默认坐标。
- 把 ViewRig `CameraState` 转回宿主相机坐标。
- 把宿主 FOV / projection 规则映射到 `LensState`。

Core 不负责：

- 直接读取 Three / Babylon / PlayCanvas camera。
- 读取 DOM 或宿主 scene graph。
- 保存宿主 runtime/editor state。
