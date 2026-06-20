import type { ControlChannel } from "./ControlChannel";

export interface YawPitchValue {
  readonly yaw: number;
  readonly pitch: number;
}

export interface YawPitchChannelOptions {
  readonly yaw?: number;
  readonly pitch?: number;
  readonly minPitch?: number;
  readonly maxPitch?: number;
}

export interface YawPitchChannel extends ControlChannel<YawPitchValue> {
  readonly minPitch: number;
  readonly maxPitch: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function snapshotYawPitch(value: YawPitchValue, minPitch: number, maxPitch: number): YawPitchValue {
  return Object.freeze({
    yaw: value.yaw,
    pitch: clamp(value.pitch, minPitch, maxPitch)
  });
}

export function createYawPitchChannel(
  id: string,
  options: YawPitchChannelOptions = {}
): YawPitchChannel {
  const minPitch = options.minPitch ?? -89;
  const maxPitch = options.maxPitch ?? 89;
  let value = snapshotYawPitch({
    yaw: options.yaw ?? 0,
    pitch: options.pitch ?? 0
  }, minPitch, maxPitch);

  return {
    id,
    minPitch,
    maxPitch,
    get value() {
      return value;
    },
    update: () => undefined,
    set: (next) => {
      value = snapshotYawPitch(next, minPitch, maxPitch);
    },
    add: (delta) => {
      value = snapshotYawPitch({
        yaw: value.yaw + (delta.yaw ?? 0),
        pitch: value.pitch + (delta.pitch ?? 0)
      }, minPitch, maxPitch);
    },
    snapshot: () => snapshotYawPitch(value, minPitch, maxPitch)
  };
}
