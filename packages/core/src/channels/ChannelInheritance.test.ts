import { describe, expect, it } from "vitest";
import type { ControlChannel } from "./ControlChannel";
import { inheritControlChannelValue } from "./ChannelInheritance";

function createScalarChannel(id: string, initial: number): ControlChannel<number> {
  let value = initial;
  return {
    id,
    get value() {
      return value;
    },
    update: () => undefined,
    set: (next) => {
      value = next;
    },
    add: (delta) => {
      value += delta;
    },
    snapshot: () => value
  };
}

describe("channel inheritance", () => {
  it("copies a source channel snapshot into a target channel", () => {
    const from = createScalarChannel("from", 10);
    const to = createScalarChannel("to", 0);

    expect(inheritControlChannelValue({ from, to })).toBe(10);
    expect(to.value).toBe(10);
  });
});
