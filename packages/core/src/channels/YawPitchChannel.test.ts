import { describe, expect, it } from "vitest";
import { createYawPitchChannel } from "./YawPitchChannel";

describe("YawPitchChannel", () => {
  it("stores yaw and clamps pitch", () => {
    const channel = createYawPitchChannel("look", {
      minPitch: -45,
      maxPitch: 60
    });

    channel.add({ yaw: 15, pitch: 100 });

    expect(channel.value).toEqual({ yaw: 15, pitch: 60 });
    expect(channel.snapshot()).toEqual({ yaw: 15, pitch: 60 });
  });

  it("sets values through snapshots", () => {
    const channel = createYawPitchChannel("look");

    channel.set({ yaw: 90, pitch: -120 });

    expect(channel.value).toEqual({ yaw: 90, pitch: -89 });
    expect(Object.isFrozen(channel.value)).toBe(true);
  });

  it("smooths toward target values when half-life is configured", () => {
    const channel = createYawPitchChannel("look", {
      yawHalfLife: 0.5,
      pitchHalfLife: 0.5,
      minPitch: -45,
      maxPitch: 45
    });

    channel.set({ yaw: 10, pitch: 100 });

    expect(channel.value).toEqual({ yaw: 0, pitch: 0 });
    expect(channel.target).toEqual({ yaw: 10, pitch: 45 });

    channel.update(0.5);

    expect(channel.value.yaw).toBeCloseTo(5);
    expect(channel.value.pitch).toBeCloseTo(22.5);
  });
});
