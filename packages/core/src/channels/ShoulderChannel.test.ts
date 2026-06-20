import { describe, expect, it } from "vitest";
import { createShoulderChannel } from "./ShoulderChannel";

describe("ShoulderChannel", () => {
  it("clamps shoulder side to -1..1", () => {
    const channel = createShoulderChannel("shoulder");

    channel.add(2);
    expect(channel.value).toBe(1);

    channel.set(-2);
    expect(channel.snapshot()).toBe(-1);
  });
});
