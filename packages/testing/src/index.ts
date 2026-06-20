import { VIEWRIG_CORE_PACKAGE, type ViewRigPackageInfo } from "@viewrig/core";

export const VIEWRIG_TESTING_PACKAGE = "@viewrig/testing";

export const testingPackageInfo = {
  name: VIEWRIG_TESTING_PACKAGE,
  role: "testing"
} satisfies ViewRigPackageInfo;

export function describeTestingRuntime(): string {
  return `${VIEWRIG_TESTING_PACKAGE} uses ${VIEWRIG_CORE_PACKAGE}`;
}
