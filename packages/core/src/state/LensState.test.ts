import { describe, expect, it } from "vitest";
import { DEFAULT_LENS_STATE, snapshotLensState } from "./LensState";

describe("LensState contract", () => {
  it("uses degree FOV for the default perspective lens", () => {
    expect(DEFAULT_LENS_STATE).toEqual({
      projection: "perspective",
      fov: 60,
      near: 0.1,
      far: 1000
    });
  });

  it("snapshots perspective and orthographic lens values", () => {
    const perspective = snapshotLensState({ projection: "perspective", fov: 70 });
    const orthographic = snapshotLensState({ projection: "orthographic", orthographicSize: 8 });

    expect(perspective).toEqual({ projection: "perspective", fov: 70 });
    expect(orthographic).toEqual({ projection: "orthographic", orthographicSize: 8 });
    expect(Object.isFrozen(perspective)).toBe(true);
    expect(Object.isFrozen(orthographic)).toBe(true);
  });
});
