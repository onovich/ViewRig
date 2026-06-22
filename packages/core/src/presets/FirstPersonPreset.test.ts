import { describe, expect, it } from "vitest";
import { createYawPitchChannel } from "../channels/YawPitchChannel";
import {
  DEFAULT_FIRST_PERSON_GAMEPLAY_EYE_OFFSET,
  createFirstPersonGameplayPreset,
  evaluateFirstPersonGameplayPreset,
  resolveFirstPersonGameplayPresetConfig
} from "./FirstPersonPreset";

describe("FirstPersonGameplayPreset", () => {
  it("resolves first-person gameplay defaults", () => {
    const look = createYawPitchChannel("look");
    const resolved = resolveFirstPersonGameplayPresetConfig({
      target: [0, 0, 0],
      look
    });

    expect(resolved.eyeOffset).toBe(DEFAULT_FIRST_PERSON_GAMEPLAY_EYE_OFFSET);
    expect(resolved.look).toBe(look);
    expect(resolved.debugId).toBe("first-person-gameplay");
  });

  it("evaluates through the existing first-person rig and reports eye height tuning", () => {
    const preset = createFirstPersonGameplayPreset({
      id: "player-eye",
      target: [1, 0, 2],
      look: {
        yaw: 90,
        pitch: 0
      },
      eyeOffset: [0, 1.8, 0]
    });

    const result = preset.evaluate({ time: 4 });

    expect(result.state.position).toEqual({ x: 1, y: 1.8, z: 2 });
    expect(result.state.debug?.liveCameraId).toBe("player-eye");
    expect(result.debug).toMatchObject({
      presetId: "player-eye",
      mode: "firstPerson",
      liveCameraId: "player-eye",
      metadata: {
        eyeOffset: [0, 1.8, 0]
      },
      tags: ["preset", "firstPerson", "gameplay"]
    });
    expect(result.debug.tuning).toEqual([
      {
        id: "eyeHeight",
        label: "Eye Height",
        value: 1.8,
        min: 0.5,
        max: 2.5,
        step: 0.01,
        unit: "m"
      }
    ]);
    expect(result.draw[0]).toMatchObject({
      type: "line3",
      from: [1, 0, 2],
      label: "first-person"
    });
  });

  it("offers a one-shot evaluator for compact recipes", () => {
    const result = evaluateFirstPersonGameplayPreset({
      target: [0, 0, 0],
      look: {
        yaw: 0,
        pitch: 0
      }
    });

    expect(result.state.position).toEqual({ x: 0, y: 1.65, z: 0 });
  });
});
