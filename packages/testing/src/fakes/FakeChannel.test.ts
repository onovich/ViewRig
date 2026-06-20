import { describe, expect, it } from "vitest";
import { createFakeChannel } from "./FakeChannel";

interface LookValue {
  readonly yaw: number;
  readonly pitch: number;
}

describe("createFakeChannel", () => {
  it("implements the ControlChannel interface for fixture-owned state", () => {
    const channel = createFakeChannel<LookValue>(
      "look",
      { yaw: 0, pitch: 0 },
      (current, delta) => ({
        yaw: current.yaw + (delta.yaw ?? 0),
        pitch: current.pitch + (delta.pitch ?? 0)
      })
    );

    channel.add({ yaw: 15 });

    expect(channel.value).toEqual({ yaw: 15, pitch: 0 });
    expect(channel.snapshot()).toEqual({ yaw: 15, pitch: 0 });
  });
});
