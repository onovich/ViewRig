import { describe, expect, it } from "vitest";
import { clampPathDistance, clampPathT, snapshotPathSample, type CameraPath } from "./CameraPath";

describe("CameraPath contract", () => {
  it("clamps normalized path t and distance inputs", () => {
    expect(clampPathT(-0.5)).toBe(0);
    expect(clampPathT(0.25)).toBe(0.25);
    expect(clampPathT(1.5)).toBe(1);
    expect(clampPathT(Number.NaN)).toBe(0);

    expect(clampPathDistance(-1)).toBe(0);
    expect(clampPathDistance(4)).toBe(4);
    expect(clampPathDistance(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("creates immutable path samples with stable defaults", () => {
    const sample = snapshotPathSample({
      position: [1, 2, 3],
      t: 2,
      distance: -4
    });

    expect(sample).toEqual({
      position: { x: 1, y: 2, z: 3 },
      tangent: { x: 0, y: 0, z: -1 },
      up: { x: 0, y: 1, z: 0 },
      t: 1,
      distance: 0
    });
    expect(Object.isFrozen(sample)).toBe(true);
    expect(Object.isFrozen(sample.position)).toBe(true);
    expect(Object.isFrozen(sample.tangent)).toBe(true);
    expect(Object.isFrozen(sample.up)).toBe(true);
  });

  it("defines the minimal host-independent camera path surface", () => {
    const path: CameraPath = {
      length: 10,
      sampleAtT: (t) => snapshotPathSample({ position: [t, 0, 0], t, distance: t * 10 }),
      sampleAtDistance: (distance) =>
        snapshotPathSample({ position: [distance, 0, 0], t: distance / 10, distance })
    };

    expect(path.sampleAtT(0.5).position).toEqual({ x: 0.5, y: 0, z: 0 });
    expect(path.sampleAtDistance(5).t).toBe(0.5);
  });
});
