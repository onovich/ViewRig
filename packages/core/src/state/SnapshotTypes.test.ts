import { describe, expect, it } from "vitest";
import { snapshotQuat, snapshotVec2, snapshotVec3 } from "./SnapshotTypes";

describe("public snapshot helpers", () => {
  it("copies tuple-like values into readonly object snapshots", () => {
    expect(snapshotVec2([1, 2])).toEqual({ x: 1, y: 2 });
    expect(snapshotVec3([1, 2, 3])).toEqual({ x: 1, y: 2, z: 3 });
    expect(snapshotQuat([0, 0, 0, 1])).toEqual({ x: 0, y: 0, z: 0, w: 1 });
  });

  it("does not reuse mutable object references", () => {
    const source = { x: 1, y: 2, z: 3 };
    const snapshot = snapshotVec3(source);

    source.x = 99;

    expect(snapshot).toEqual({ x: 1, y: 2, z: 3 });
    expect(Object.isFrozen(snapshot)).toBe(true);
  });
});
