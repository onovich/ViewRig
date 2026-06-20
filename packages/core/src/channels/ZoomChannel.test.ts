import { describe, expect, it } from "vitest";
import { createZoomChannel } from "./ZoomChannel";

describe("ZoomChannel", () => {
  it("stores scalar zoom and clamps to min/max", () => {
    const channel = createZoomChannel("zoom", {
      value: 4,
      min: 2,
      max: 6
    });

    channel.add(10);
    expect(channel.value).toBe(6);

    channel.set(1);
    expect(channel.value).toBe(2);
    expect(channel.snapshot()).toBe(2);
  });
});
