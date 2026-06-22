import type { ControlChannel } from "./ControlChannel.js";

export interface ZoomChannelOptions {
  readonly value?: number;
  readonly min?: number;
  readonly max?: number;
}

export interface ZoomChannel extends ControlChannel<number> {
  readonly min: number;
  readonly max: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function createZoomChannel(id: string, options: ZoomChannelOptions = {}): ZoomChannel {
  const min = options.min ?? 0;
  const max = options.max ?? Number.POSITIVE_INFINITY;
  let value = clamp(options.value ?? 1, min, max);

  return {
    id,
    min,
    max,
    get value() {
      return value;
    },
    update: () => undefined,
    set: (next) => {
      value = clamp(next, min, max);
    },
    add: (delta) => {
      value = clamp(value + delta, min, max);
    },
    snapshot: () => value
  };
}
