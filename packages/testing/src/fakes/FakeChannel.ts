import type { ChannelDelta, ControlChannel } from "@viewrig/core";

export function createFakeChannel<TValue>(
  id: string,
  initialValue: TValue,
  mergeDelta: (current: TValue, delta: ChannelDelta<TValue>) => TValue
): ControlChannel<TValue> {
  let value = initialValue;

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
      value = mergeDelta(value, delta);
    },
    snapshot: () => value
  };
}
