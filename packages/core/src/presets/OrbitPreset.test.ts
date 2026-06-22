import { describe, expect, it } from "vitest";
import { createYawPitchChannel } from "../channels/YawPitchChannel";
import { createZoomChannel } from "../channels/ZoomChannel";
import {
  DEFAULT_ORBIT_SHOWCASE_DISTANCE,
  DEFAULT_ORBIT_SHOWCASE_PIVOT_OFFSET,
  createOrbitShowcasePreset,
  evaluateOrbitShowcasePreset,
  resolveOrbitShowcasePresetConfig
} from "./OrbitPreset";

describe("OrbitShowcasePreset", () => {
  it("resolves orbit showcase defaults", () => {
    const look = createYawPitchChannel("look");
    const resolved = resolveOrbitShowcasePresetConfig({
      target: [0, 0, 0],
      look
    });

    expect(resolved.distance).toBe(DEFAULT_ORBIT_SHOWCASE_DISTANCE);
    expect(resolved.pivotOffset).toBe(DEFAULT_ORBIT_SHOWCASE_PIVOT_OFFSET);
    expect(resolved.look).toBe(look);
    expect(resolved.debugId).toBe("orbit-showcase");
  });

  it("uses a normalized distance channel as showcase zoom input", () => {
    const look = createYawPitchChannel("look", {
      yaw: 90,
      pitch: 0
    });
    const distance = createZoomChannel("distance", {
      value: 6,
      min: 2,
      max: 10
    });
    const preset = createOrbitShowcasePreset({
      id: "orbit-object",
      target: [0, 0, 0],
      look,
      distance
    });

    const result = preset.evaluate({ time: 2 });

    expect(result.state.position.x).toBeCloseTo(6);
    expect(result.state.position.y).toBe(1);
    expect(result.state.position.z).toBeCloseTo(0);
    expect(result.debug).toMatchObject({
      presetId: "orbit-object",
      mode: "orbit",
      liveCameraId: "orbit-object",
      metadata: {
        distance: 6
      },
      tags: ["preset", "orbit", "showcase"]
    });
    expect(result.debug.tuning.map((control) => control.id)).toEqual(["distance"]);
    expect(result.draw[0]).toMatchObject({
      type: "line3",
      from: [0, 0, 0],
      label: "orbit"
    });
  });

  it("offers a one-shot evaluator for compact showcase recipes", () => {
    const result = evaluateOrbitShowcasePreset({
      target: [0, 0, 0],
      look: {
        yaw: 0,
        pitch: 30
      },
      distance: 4
    });

    expect(result.state.position.x).toBeCloseTo(0);
    expect(result.state.position.y).toBeCloseTo(3);
    expect(result.state.position.z).toBeCloseTo(3.4641016);
  });
});
