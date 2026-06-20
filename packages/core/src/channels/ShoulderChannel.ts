import type { ControlChannel } from "./ControlChannel";

export interface ShoulderChannelOptions {
  readonly value?: number;
}

export type ShoulderChannel = ControlChannel<number>;

function clampShoulder(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

export function createShoulderChannel(
  id: string,
  options: ShoulderChannelOptions = {}
): ShoulderChannel {
  let value = clampShoulder(options.value ?? 0);

  return {
    id,
    get value() {
      return value;
    },
    update: () => undefined,
    set: (next) => {
      value = clampShoulder(next);
    },
    add: (delta) => {
      value = clampShoulder(value + delta);
    },
    snapshot: () => value
  };
}
