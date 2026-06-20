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
});
