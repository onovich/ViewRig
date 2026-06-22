import { describe, expect, expectTypeOf, it } from "vitest";
import { createCameraState } from "../state/CameraState";
import { defineCameraPreset, type CameraPreset, type CameraPresetEvaluation } from "./CameraPreset";

describe("CameraPreset", () => {
  it("wraps an evaluator with preset metadata, debug summary, and draw commands", () => {
    const preset = defineCameraPreset({
      id: "orbit-showcase",
      label: "Orbit Showcase",
      mode: "orbit",
      config: {
        distance: 5,
        target: [0, 1, 0] as const
      },
      evaluate(config, context) {
        return createCameraState({
          position: [0, 1, config.distance],
          rotation: [0, 0, 0, 1],
          time: context.time,
          debug: {
            liveCameraId: "orbit-showcase",
            metadata: {
              target: config.target
            },
            tags: ["preset"]
          }
        });
      },
      describe(config) {
        return {
          metadata: {
            distance: config.distance
          },
          tuning: [
            {
              id: "distance",
              label: "Distance",
              value: config.distance,
              min: 2,
              max: 10,
              step: 0.1,
              unit: "m"
            }
          ],
          notes: ["orbit preset smoke"]
        };
      },
      draw() {
        return [
          {
            type: "line3",
            from: [0, 1, 0],
            to: [0, 1, 5],
            label: "camera ray"
          }
        ];
      }
    });

    const result = preset.evaluate({ time: 2 });

    expect(preset.id).toBe("orbit-showcase");
    expect(result.state.position).toEqual({ x: 0, y: 1, z: 5 });
    expect(result.state.time).toBe(2);
    expect(result.debug).toMatchObject({
      presetId: "orbit-showcase",
      label: "Orbit Showcase",
      mode: "orbit",
      liveCameraId: "orbit-showcase",
      metadata: {
        distance: 5,
        target: [0, 1, 0]
      },
      notes: ["orbit preset smoke"],
      tags: ["preset"]
    });
    expect(result.debug.tuning).toEqual([
      {
        id: "distance",
        label: "Distance",
        value: 5,
        min: 2,
        max: 10,
        step: 0.1,
        unit: "m"
      }
    ]);
    expect(result.draw).toEqual([
      {
        type: "line3",
        from: [0, 1, 0],
        to: [0, 1, 5],
        label: "camera ray"
      }
    ]);
  });

  it("keeps descriptor config typed for concrete preset factories", () => {
    const preset = defineCameraPreset({
      id: "third-person-gameplay",
      label: "Third Person Gameplay",
      mode: "thirdPerson",
      config: {
        distance: 4,
        shoulder: 1
      },
      evaluate(config) {
        return createCameraState({
          position: [config.shoulder, 1.5, config.distance],
          rotation: [0, 0, 0, 1]
        });
      }
    });

    const result = preset.evaluate();

    expectTypeOf(preset).toEqualTypeOf<CameraPreset<{ distance: number; shoulder: number }>>();
    expectTypeOf(result).toEqualTypeOf<CameraPresetEvaluation>();
    expect(result.debug.tuning).toEqual([]);
    expect(result.draw).toEqual([]);
  });
});
