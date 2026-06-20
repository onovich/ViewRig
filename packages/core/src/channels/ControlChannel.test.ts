import { describe, expect, it } from "vitest";
import type { ControlChannel } from "./ControlChannel";

interface LookValue {
  readonly yaw: number;
  readonly pitch: number;
}

describe("ControlChannel contract", () => {
  it("allows host input, test fixtures, or adapters to own channel storage", () => {
    let value: LookValue = { yaw: 0, pitch: 0 };

    const channel: ControlChannel<LookValue> = {
      id: "playerLook",
      get value() {
        return value;
      },
      update: () => undefined,
      set: (next) => {
        value = next;
      },
      add: (delta) => {
        value = {
          yaw: value.yaw + (delta.yaw ?? 0),
          pitch: value.pitch + (delta.pitch ?? 0)
        };
      },
      snapshot: () => ({ ...value })
    };

    channel.add({ yaw: 10 });

    expect(channel.id).toBe("playerLook");
    expect(channel.value).toEqual({ yaw: 10, pitch: 0 });
    expect(channel.snapshot()).toEqual({ yaw: 10, pitch: 0 });
  });
});
