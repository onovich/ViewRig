import { describe, expect, it } from "vitest";
import { createShoulderChannel } from "../channels/ShoulderChannel";
import { createYawPitchChannel } from "../channels/YawPitchChannel";
import {
  DEFAULT_THIRD_PERSON_GAMEPLAY_DISTANCE,
  DEFAULT_THIRD_PERSON_GAMEPLAY_PIVOT_OFFSET,
  DEFAULT_THIRD_PERSON_GAMEPLAY_SHOULDER_OFFSET,
  createThirdPersonGameplayPreset,
  evaluateThirdPersonGameplayPreset,
  resolveThirdPersonGameplayPresetConfig
} from "./ThirdPersonGameplayPreset";

describe("ThirdPersonGameplayPreset", () => {
  it("resolves gameplay defaults without hiding target or look input", () => {
    const look = createYawPitchChannel("look");
    const resolved = resolveThirdPersonGameplayPresetConfig({
      target: [0, 0, 0],
      look
    });

    expect(resolved.distance).toBe(DEFAULT_THIRD_PERSON_GAMEPLAY_DISTANCE);
    expect(resolved.pivotOffset).toBe(DEFAULT_THIRD_PERSON_GAMEPLAY_PIVOT_OFFSET);
    expect(resolved.shoulder).toBe(1);
    expect(resolved.shoulderOffset).toBe(DEFAULT_THIRD_PERSON_GAMEPLAY_SHOULDER_OFFSET);
    expect(resolved.look).toBe(look);
    expect(resolved.debugId).toBe("third-person-gameplay");
  });

  it("evaluates through the existing third-person rig and reports tuning controls", () => {
    const look = createYawPitchChannel("look", {
      yaw: 0,
      pitch: 0
    });
    const shoulder = createShoulderChannel("shoulder", {
      value: -1
    });
    const preset = createThirdPersonGameplayPreset({
      id: "player-camera",
      target: [1, 0, 2],
      look,
      shoulder,
      distance: 5
    });

    const result = preset.evaluate({ time: 1.5 });

    expect(result.state.position).toEqual({ x: 0.55, y: 1.45, z: 7 });
    expect(result.state.debug?.liveCameraId).toBe("player-camera");
    expect(result.debug).toMatchObject({
      presetId: "player-camera",
      mode: "thirdPerson",
      liveCameraId: "player-camera",
      metadata: {
        distance: 5,
        shoulder: -1
      },
      tags: ["preset", "thirdPerson", "gameplay"]
    });
    expect(result.debug.tuning.map((control) => control.id)).toEqual(["distance", "shoulder"]);
    expect(result.draw).toEqual([
      {
        type: "line3",
        from: [1, 0, 2],
        to: result.state.position,
        label: "third-person"
      }
    ]);
  });

  it("offers a one-shot evaluator for compact recipes", () => {
    const result = evaluateThirdPersonGameplayPreset({
      target: [0, 0, 0],
      look: {
        yaw: 90,
        pitch: 0
      }
    });

    expect(result.state.position.x).toBeCloseTo(4.45);
    expect(result.state.position.y).toBeCloseTo(1.55);
    expect(result.state.position.z).toBeCloseTo(0);
  });
});
