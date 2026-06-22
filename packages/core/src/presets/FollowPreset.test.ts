import { describe, expect, it } from "vitest";
import {
  DEFAULT_FOLLOW_SHOWCASE_OFFSET,
  createFollowShowcasePreset,
  evaluateFollowShowcasePreset,
  resolveFollowShowcasePresetConfig
} from "./FollowPreset";

describe("FollowShowcasePreset", () => {
  it("resolves follow showcase defaults", () => {
    const target = {
      position: [0, 0, 0] as const
    };
    const resolved = resolveFollowShowcasePresetConfig({
      target
    });

    expect(resolved.target).toBe(target);
    expect(resolved.offset).toBe(DEFAULT_FOLLOW_SHOWCASE_OFFSET);
    expect(resolved.debugId).toBe("follow-showcase");
  });

  it("evaluates through the existing follow rig and reports offset tuning", () => {
    const preset = createFollowShowcasePreset({
      id: "follow-player",
      target: {
        position: [2, 0, -1],
        rotation: [0, 0, 0, 1]
      },
      offset: [0, 2, -6]
    });

    const result = preset.evaluate({ time: 3 });

    expect(result.state.position).toEqual({ x: 2, y: 2, z: -7 });
    expect(result.state.debug?.liveCameraId).toBe("follow-player");
    expect(result.debug).toMatchObject({
      presetId: "follow-player",
      mode: "follow",
      liveCameraId: "follow-player",
      metadata: {
        offset: [0, 2, -6]
      },
      tags: ["preset", "follow", "showcase"]
    });
    expect(result.debug.tuning.map((control) => control.id)).toEqual(["offsetX", "offsetY", "offsetZ"]);
    expect(result.draw).toEqual([
      {
        type: "line3",
        from: [2, 0, -1],
        to: result.state.position,
        label: "follow"
      }
    ]);
  });

  it("offers a one-shot evaluator for compact follow recipes", () => {
    const result = evaluateFollowShowcasePreset({
      target: {
        position: [1, 2, 3]
      }
    });

    expect(result.state.position).toEqual({ x: 1, y: 4, z: -3 });
  });
});
