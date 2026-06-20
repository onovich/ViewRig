import { evaluateFixedPose } from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("fixed pose golden trace", () => {
  it("produces deterministic CameraState samples", () => {
    const trace = runGoldenTrace(
      [
        { dt: 0.25, input: null, label: "a" },
        { dt: 0.25, input: null, label: "b" }
      ],
      ({ time }) => evaluateFixedPose({
        position: [1, 2, 3],
        rotation: [0, 0, 0, 1],
        debugId: "fixed-trace"
      }, {
        time,
        tags: ["golden"]
      })
    );

    expect(trace).toEqual([
      {
        frame: 0,
        time: 0.25,
        dt: 0.25,
        label: "a",
        output: {
          position: { x: 1, y: 2, z: 3 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          up: { x: 0, y: 1, z: 0 },
          lens: {
            projection: "perspective",
            fov: 60,
            near: 0.1,
            far: 1000
          },
          time: 0.25,
          debug: {
            liveCameraId: "fixed-trace",
            tags: ["golden"]
          }
        }
      },
      {
        frame: 1,
        time: 0.5,
        dt: 0.25,
        label: "b",
        output: {
          position: { x: 1, y: 2, z: 3 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          up: { x: 0, y: 1, z: 0 },
          lens: {
            projection: "perspective",
            fov: 60,
            near: 0.1,
            far: 1000
          },
          time: 0.5,
          debug: {
            liveCameraId: "fixed-trace",
            tags: ["golden"]
          }
        }
      }
    ]);
  });
});
