import { describe, expect, it } from "vitest";
import { createZoomChannel } from "../channels/ZoomChannel";
import { createPolylinePath } from "../path/PolylinePath";
import {
  DEFAULT_RAIL_SHOT_PRESET_ID,
  createRailShotPreset,
  evaluateRailShotPreset,
  resolveRailShotPresetConfig
} from "./RailShotPreset";

describe("RailShotPreset", () => {
  const path = createPolylinePath({
    points: [
      [0, 0, 0],
      [0, 0, -4],
      [4, 0, -4]
    ]
  });

  it("resolves rail-shot defaults", () => {
    const driver = { type: "fixed" as const, t: 0.25 };
    const resolved = resolveRailShotPresetConfig({
      path,
      driver
    });

    expect(resolved.path).toBe(path);
    expect(resolved.driver).toBe(driver);
    expect(resolved.debugId).toBe(DEFAULT_RAIL_SHOT_PRESET_ID);
  });

  it("evaluates a deterministic time-driven camera shot", () => {
    const preset = createRailShotPreset({
      id: "intro-shot",
      path,
      driver: {
        type: "time",
        duration: 4
      }
    });

    const result = preset.evaluate({ time: 2 });

    expect(result.state.position).toEqual({ x: 0, y: 0, z: -4 });
    expect(result.state.debug?.metadata).toEqual({
      railT: 0.5,
      railDistance: 4,
      driver: "time"
    });
    expect(result.debug).toMatchObject({
      presetId: "intro-shot",
      mode: "railShot",
      liveCameraId: "intro-shot",
      metadata: {
        driver: "time",
        pathLength: 8,
        railDistance: 4,
        railT: 0.5
      },
      tags: ["preset", "railShot", "cameraShot"]
    });
    expect(result.debug.tuning.map((control) => control.id)).toEqual(["driver", "railT", "duration"]);
    expect(result.draw).toEqual([
      {
        type: "point3",
        position: result.state.position,
        label: "rail-shot"
      }
    ]);
  });

  it("reports input-driven rail tuning from a channel snapshot", () => {
    const channel = createZoomChannel("railT", {
      value: 0.75,
      min: 0,
      max: 1
    });
    const result = evaluateRailShotPreset({
      path,
      driver: {
        type: "input",
        channel
      }
    });

    expect(result.state.position).toEqual({ x: 2, y: 0, z: -4 });
    expect(result.debug.tuning).toMatchObject([
      { id: "driver", value: "input" },
      { id: "railT", value: 0.75 },
      { id: "input", value: 0.75 }
    ]);
  });
});
