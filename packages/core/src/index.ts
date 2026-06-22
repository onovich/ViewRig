export const VIEWRIG_CORE_PACKAGE = "@viewrig/core";

export * from "./brain/Activation.js";
export * from "./brain/Blend.js";
export * from "./brain/CameraBrain.js";
export * from "./brain/VirtualCamera.js";
export * from "./channels/ChannelInheritance.js";
export * from "./channels/ControlChannel.js";
export * from "./channels/ShoulderChannel.js";
export * from "./channels/YawPitchChannel.js";
export * from "./channels/ZoomChannel.js";
export * from "./conventions/CoordinateConvention.js";
export * from "./conventions/ScreenSpace.js";
export * from "./composer/RectNdc.js";
export * from "./composer/ScreenZoneDebug.js";
export * from "./composer/ScreenZoneComposer.js";
export * from "./constraints/DistanceClamp.js";
export * from "./constraints/YawPitchClamp.js";
export * from "./constraints/Confiner2D.js";
export * from "./constraints/Confiner3D.js";
export * from "./constraints/CollisionConstraint.js";
export * from "./constraints/OcclusionConstraint.js";
export * from "./math/Vec2.js";
export * from "./debug/DebugDraw.js";
export * from "./math/Vec3.js";
export * from "./math/Quat.js";
export * from "./math/Damping.js";
export * from "./math/Projection.js";
export * from "./path/CameraPath.js";
export * from "./path/PolylinePath.js";
export * from "./pose/RuntimeCameraPoseMapper.js";
export * from "./presets/CameraPreset.js";
export * from "./presets/FollowPreset.js";
export * from "./presets/OrbitPreset.js";
export * from "./presets/ThirdPersonGameplayPreset.js";
export * from "./rigs/FixedPoseSolver.js";
export * from "./rigs/FollowRig.js";
export * from "./rigs/FirstPersonRig.js";
export * from "./rigs/OrbitRig.js";
export * from "./rigs/RailRig.js";
export * from "./rigs/ThirdPersonRig.js";
export * from "./state/CameraState.js";
export * from "./state/LensState.js";
export * from "./state/SnapshotTypes.js";
export * from "./world/WorldProbe.js";
export * from "./world/WorldProbeFallback.js";

export interface ViewRigPackageInfo {
  readonly name: string;
  readonly role: "core" | "testing";
}

export const corePackageInfo = {
  name: VIEWRIG_CORE_PACKAGE,
  role: "core"
} satisfies ViewRigPackageInfo;
