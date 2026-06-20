import { describe, expect, it } from "vitest";
import {
  QUAT_IDENTITY,
  degreesToRadians,
  quat,
  quatConjugate,
  quatFromAxisAngle,
  quatMul,
  quatNormalize,
  quatRotateVec3,
  radiansToDegrees
} from "./Quat";

describe("Quat math", () => {
  it("creates frozen quaternion snapshots", () => {
    const value = quat(0, 0, 0, 1);

    expect(value).toEqual({ x: 0, y: 0, z: 0, w: 1 });
    expect(Object.isFrozen(value)).toBe(true);
  });

  it("normalizes and falls back to identity for degenerate rotations", () => {
    expect(quatNormalize([0, 0, 0, 2])).toEqual(QUAT_IDENTITY);
    expect(quatNormalize([0, 0, 0, 0])).toEqual(QUAT_IDENTITY);
  });

  it("uses Hamilton multiplication with identity and conjugate", () => {
    const yaw = quatFromAxisAngle([0, 1, 0], Math.PI / 2);
    const identity = quatMul(yaw, quatConjugate(yaw));

    expect(quatMul(QUAT_IDENTITY, yaw)).toEqual(yaw);
    expect(identity.x).toBeCloseTo(0);
    expect(identity.y).toBeCloseTo(0);
    expect(identity.z).toBeCloseTo(0);
    expect(identity.w).toBeCloseTo(1);
  });

  it("rotates the default forward vector using the right-handed +Y yaw convention", () => {
    const yawLeft = quatFromAxisAngle([0, 1, 0], degreesToRadians(90));
    const rotated = quatRotateVec3(yawLeft, [0, 0, -1]);

    expect(rotated.x).toBeCloseTo(-1);
    expect(rotated.y).toBeCloseTo(0);
    expect(rotated.z).toBeCloseTo(0);
  });

  it("converts between degrees and radians", () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
    expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
  });
});
