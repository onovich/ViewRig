import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { CameraBrain } from "./CameraBrain";
import { createVirtualCamera } from "./VirtualCamera";

describe("CameraBrain add/remove/activate/update", () => {
  it("adds, lists, and removes virtual cameras", () => {
    const brain = new CameraBrain();
    const camera = createVirtualCamera({
      id: "a",
      evaluate: () => evaluateFixedPose({ position: [0, 0, 0] })
    });

    brain.add(camera);

    expect(brain.has("a")).toBe(true);
    expect(brain.get("a")).toBe(camera);
    expect(brain.list()).toEqual([camera]);
    expect(brain.remove("a")).toBe(true);
    expect(brain.has("a")).toBe(false);
  });

  it("activates and updates the selected virtual camera", () => {
    const brain = new CameraBrain();
    brain.add(createVirtualCamera({
      id: "a",
      priority: 1,
      evaluate: ({ time }) => evaluateFixedPose({ position: [1, 0, 0] }, { time })
    }));
    brain.add(createVirtualCamera({
      id: "b",
      priority: 10,
      evaluate: ({ time }) => evaluateFixedPose({ position: [2, 0, 0] }, { time })
    }));

    brain.activate("a");
    const state = brain.update({ dt: 0.016, time: 1 });

    expect(brain.activeId).toBe("a");
    expect(state?.position).toEqual({ x: 1, y: 0, z: 0 });
    expect(brain.output).toBe(state);
  });

  it("falls back to the highest priority enabled camera when no active camera is set", () => {
    const brain = new CameraBrain();
    brain.add(createVirtualCamera({
      id: "low",
      priority: 1,
      evaluate: () => evaluateFixedPose({ position: [1, 0, 0] })
    }));
    brain.add(createVirtualCamera({
      id: "high",
      priority: 10,
      evaluate: () => evaluateFixedPose({ position: [10, 0, 0] })
    }));

    const state = brain.update({ dt: 0.016, time: 0 });

    expect(brain.activeId).toBe("high");
    expect(state?.position).toEqual({ x: 10, y: 0, z: 0 });
  });

  it("passes previous output into the next evaluation context", () => {
    const brain = new CameraBrain();
    brain.add(createVirtualCamera({
      id: "memory",
      evaluate: ({ previous, time }) => evaluateFixedPose({
        position: previous === undefined ? [0, 0, 0] : [previous.position.x + 1, 0, 0]
      }, {
        time
      })
    }));

    expect(brain.update({ dt: 0.016, time: 0 })?.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(brain.update({ dt: 0.016, time: 1 })?.position).toEqual({ x: 1, y: 0, z: 0 });
  });

  it("cuts to a newly activated camera without passing stale previous output", () => {
    const brain = new CameraBrain();
    brain.add(createVirtualCamera({
      id: "a",
      evaluate: ({ previous }) => evaluateFixedPose({
        position: previous === undefined ? [1, 0, 0] : [99, 0, 0]
      })
    }));
    brain.add(createVirtualCamera({
      id: "b",
      evaluate: ({ previous }) => evaluateFixedPose({
        position: previous === undefined ? [2, 0, 0] : [99, 0, 0]
      })
    }));

    brain.activate("a");
    expect(brain.update({ dt: 0.016, time: 0 })?.position).toEqual({ x: 1, y: 0, z: 0 });

    brain.activate("b", { transition: "cut" });
    const state = brain.update({ dt: 0.016, time: 1 });

    expect(brain.activation).toEqual({
      fromId: "a",
      toId: "b",
      transition: "cut"
    });
    expect(state?.position).toEqual({ x: 2, y: 0, z: 0 });
  });

  it("throws when activating an unknown camera", () => {
    const brain = new CameraBrain();

    expect(() => brain.activate("missing")).toThrow("Cannot activate unknown virtual camera");
  });
});
