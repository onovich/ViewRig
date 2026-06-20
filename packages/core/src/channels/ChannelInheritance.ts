import type { ControlChannel } from "./ControlChannel";

export interface ChannelInheritancePair<TValue = unknown> {
  readonly from: ControlChannel<TValue>;
  readonly to: ControlChannel<TValue>;
}

export function inheritControlChannelValue<TValue>(pair: ChannelInheritancePair<TValue>): TValue {
  const value = pair.from.snapshot();
  pair.to.set(value);
  return pair.to.snapshot();
}

export function inheritControlChannels(
  pairs: readonly ChannelInheritancePair[]
): readonly unknown[] {
  return Object.freeze(pairs.map((pair) => inheritControlChannelValue(pair)));
}
