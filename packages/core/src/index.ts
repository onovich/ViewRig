export const VIEWRIG_CORE_PACKAGE = "@viewrig/core";

export * from "./channels/ControlChannel";
export * from "./conventions/CoordinateConvention";
export * from "./conventions/ScreenSpace";
export * from "./math/Vec2";
export * from "./math/Vec3";
export * from "./state/CameraState";
export * from "./state/LensState";
export * from "./state/SnapshotTypes";
export * from "./world/WorldProbe";

export interface ViewRigPackageInfo {
  readonly name: string;
  readonly role: "core" | "testing";
}

export const corePackageInfo = {
  name: VIEWRIG_CORE_PACKAGE,
  role: "core"
} satisfies ViewRigPackageInfo;
