export const VIEWRIG_CORE_PACKAGE = "@viewrig/core";

export * from "./brain/Activation";
export * from "./brain/Blend";
export * from "./brain/CameraBrain";
export * from "./brain/VirtualCamera";
export * from "./channels/ChannelInheritance";
export * from "./channels/ControlChannel";
export * from "./channels/ShoulderChannel";
export * from "./channels/YawPitchChannel";
export * from "./channels/ZoomChannel";
export * from "./conventions/CoordinateConvention";
export * from "./conventions/ScreenSpace";
export * from "./composer/RectNdc";
export * from "./composer/ScreenZoneDebug";
export * from "./composer/ScreenZoneComposer";
export * from "./constraints/DistanceClamp";
export * from "./constraints/YawPitchClamp";
export * from "./constraints/Confiner2D";
export * from "./constraints/Confiner3D";
export * from "./math/Vec2";
export * from "./debug/DebugDraw";
export * from "./math/Vec3";
export * from "./math/Quat";
export * from "./math/Damping";
export * from "./math/Projection";
export * from "./pose/RuntimeCameraPoseMapper";
export * from "./rigs/FixedPoseSolver";
export * from "./rigs/FollowRig";
export * from "./rigs/FirstPersonRig";
export * from "./rigs/OrbitRig";
export * from "./rigs/ThirdPersonRig";
export * from "./state/CameraState";
export * from "./state/LensState";
export * from "./state/SnapshotTypes";
export * from "./world/WorldProbe";
export * from "./world/WorldProbeFallback";

export interface ViewRigPackageInfo {
  readonly name: string;
  readonly role: "core" | "testing";
}

export const corePackageInfo = {
  name: VIEWRIG_CORE_PACKAGE,
  role: "core"
} satisfies ViewRigPackageInfo;
