export const VIEWRIG_CORE_PACKAGE = "@viewrig/core";

export * from "./conventions/CoordinateConvention";
export * from "./conventions/ScreenSpace";

export interface ViewRigPackageInfo {
  readonly name: string;
  readonly role: "core" | "testing";
}

export const corePackageInfo = {
  name: VIEWRIG_CORE_PACKAGE,
  role: "core"
} satisfies ViewRigPackageInfo;
