# Sinan Engine 给 ViewRig 的合作沟通函

日期：2026-06-20
发件方：Sinan Engine 商务与生态合作评估
收件方：ViewRig 项目负责人 / 维护者
关联 RFC：`rfc-004-sinan-camera-pose-shot-rig-boundary.md`

## 1. 来信目的

我们已将 Sinan 本地决策者批准的 `RFC-004：Sinan Camera Pose / Shot / Rig Boundary` 放入本目录。该 RFC 定义了 Sinan 对 CameraShot、DirectorCameraSystem、Timeline camera track、RuntimeCameraPose、ViewRig solver 和 adapter 的当前边界。

这封信是商务侧补充说明：Sinan 希望邀请 ViewRig 成为高级相机 rig / pose solver 方向的 first-party design partner，但 Sinan 不会外包 CameraShot 和 Director camera 的 source-of-truth。

## 2. Sinan 当前项目介绍

ViewRig 当前文档主要是 engine-agnostic camera rig 设计，没有专门描述 Sinan。这里先给出 Sinan 背景：

Sinan 已经升级为 **Sinan Engine**，即 AI-native、data-first、Web 原生 3D 游戏引擎与编辑器。它不是 Unity 或 Godot clone，而是把引擎语义放在 JSON、schema、registry、adapter、validation 和 browser smoke 中，方便人类和 AI agent 共同维护。

原先的 Sinan Scene Director 现在是 Sinan Engine 内部的一等 Director System，负责 events、conditions、actions、timelines、camera shots、animation cues 和 cinematic flow。

相机方面，Sinan 当前已有：

- `data/cameraShots/*.json`
- CameraShot schema
- CameraShotPlayer
- DirectorCameraSystem
- Timeline camera track
- editor CameraShotPanel
- `WebRuntime.setCameraPose`

## 3. 我们为什么看重 ViewRig

Sinan 的 CameraShot/Director 能表达镜头数据和演出调度，但高级相机 rig 是专门领域。ViewRig 的核心方向正好补上：

- follow / orbit / third-person / rail rig。
- composer、dead/soft/hard zone。
- blend、matchThenBlend。
- confiner、collision、occlusion。
- WorldProbe 和 engine adapter。
- core 纯 TypeScript，不依赖 Three、DOM、React 或物理引擎。

这些能力很适合成为 Sinan gameplay camera 和高级 shot enhancement 的 backend。

## 4. 合作方式

我们建议先做技术 spike，而不是替换 Sinan 现有相机系统：

1. `POC-1`：Pose Solver Spike
   输入 target pose、yaw/pitch/distance 或 rail progress，输出 RuntimeCameraPose。

2. `POC-2`：Showcase Follow / Orbit Camera
   InputFlow 或 Sinan InputSystem 提供 look/orbit intent，Sinan World 提供 player transform，ViewRig 输出 camera pose。

3. `POC-3`：CameraShot Enhancement
   某个 Sinan CameraShot 可选择使用 ViewRig blend/composer/rail algorithm，但数据仍保存为 Sinan cameraShot JSON。

4. `POC-4`：Collision / Confiner
   通过 Sinan WorldProbe/PhysicsProbe 接入，不让 ViewRig core 依赖 Three/Rapier/Sinan store。

## 5. Sinan 与 ViewRig 的职责边界

Sinan 保留：

- cameraShot JSON。
- CameraShot schema。
- CameraShotPlayer。
- DirectorCameraSystem。
- Timeline camera track。
- scrub/preview/restore 规则。
- editor command/save/undo。
- gameplay camera ownership。

ViewRig 可提供：

- pose solver。
- rig algorithm。
- blend/composer。
- rail/path sampling。
- collision/occlusion/confiner。
- debug visualization data。

ViewRig 不应直接：

- 替换 Sinan cameraShot JSON。
- 接管 DirectorSystem。
- 读取或写入 `THREE.Camera`。
- 保存 runtime rig state 为 Sinan source-of-truth。

## 6. 生态协同提示

Sinan 同期也在和几个 Web game infrastructure 项目对齐：

- Indirection：资源 catalog、asset report、fallback loader。
- InputFlow：look/orbit/move/interact 输入 intent。
- LudoWeave：Runtime UI、Prompt、Subtitle、Pause。

ViewRig 在生态里最自然的位置是 camera pose solver。它会消费 Sinan World/Input/Physics/CameraShot contract，并输出 RuntimeCameraPose 给 Sinan runtime adapter。

## 7. 希望 ViewRig 回复的问题

请优先评估：

1. 是否接受 Sinan 保留 CameraShot/DirectorCameraSystem source-of-truth？
2. ViewRig 第一阶段能否只输出 RuntimeCameraPose，不触碰 Three.Camera？
3. ViewRig 的 WorldProbe 接口如何与 Sinan 未来 PhysicsProbe 对齐？
4. follow/orbit/rail 哪一个最适合作为第一条 POC？
5. ViewRig adapter 更适合先放在 Sinan repo，还是未来独立 `@viewrig/sinan`？

## 8. 商务边界

本函不是收购、合并或排他合作要约。当前阶段我们希望建立 first-party design partner 关系：

```txt
Sinan owns camera semantics.
ViewRig owns specialized camera rig implementation.
POCs prove value.
Validation protects boundaries.
```

如果 POC 稳定、接口连续兼容、维护责任清晰，我们再讨论官方 adapter、兼容矩阵、Sinan Engine Infrastructure Kit 或更深层合作。
