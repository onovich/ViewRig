import { createZoomChannel } from "../channels/ZoomChannel";
import { createPolylinePath } from "../path/PolylinePath";
import { evaluateRailRig, resolveRailRigDriverT } from "./RailRig";
import { describe, expect, it } from "vitest";

describe("RailRig", () => {
  const path = createPolylinePath({
    points: [
      [0, 0, 0],
      [0, 0, -10]
    ]
  });

  it("samples a fixed rail position", () => {
    const state = evaluateRailRig({
      path,
      driver: { type: "fixed", t: 0.25 },
      debugId: "rail"
    });

    expect(state.position).toEqual({ x: 0, y: 0, z: -2.5 });
    expect(state.debug).toEqual({
      liveCameraId: "rail",
      metadata: {
        railT: 0.25,
        railDistance: 2.5,
        driver: "fixed"
      }
    });
  });

  it("samples a time-driven rail position", () => {
    const state = evaluateRailRig(
      {
        path,
        driver: { type: "time", duration: 4 }
      },
      { time: 2 }
    );

    expect(state.position).toEqual({ x: 0, y: 0, z: -5 });
    expect(state.time).toBe(2);
    expect(resolveRailRigDriverT({ type: "time", duration: 4, loop: true }, { time: 5 })).toBe(0.25);
  });

  it("samples an input-driven rail position", () => {
    const channel = createZoomChannel("railT", { value: 0.75, min: 0, max: 1 });
    const state = evaluateRailRig({
      path,
      driver: { type: "input", channel }
    });

    expect(state.position).toEqual({ x: 0, y: 0, z: -7.5 });
    channel.set(0.1);
    expect(evaluateRailRig({ path, driver: { type: "input", channel } }).position).toEqual({
      x: 0,
      y: 0,
      z: -1
    });
  });

  it("samples a target-projected rail position", () => {
    const projectedPath = createPolylinePath({
      points: [
        [0, 0, 0],
        [0, 0, -4],
        [4, 0, -4]
      ]
    });
    const state = evaluateRailRig({
      path: projectedPath,
      driver: { type: "targetProjection", target: [2, 0, -10] },
      debugId: "rail-project"
    });

    expect(state.position).toEqual({ x: 2, y: 0, z: -4 });
    expect(state.debug?.metadata).toEqual({
      railT: 0.75,
      railDistance: 6,
      driver: "targetProjection"
    });
  });
});
