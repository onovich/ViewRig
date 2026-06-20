import type { YawPitchValue } from "../channels/YawPitchChannel";

export interface YawPitchClampConfig {
  readonly minYaw?: number;
  readonly maxYaw?: number;
  readonly minPitch?: number;
  readonly maxPitch?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampYawPitch(value: YawPitchValue, config: YawPitchClampConfig = {}): YawPitchValue {
  return Object.freeze({
    yaw: clamp(value.yaw, config.minYaw ?? Number.NEGATIVE_INFINITY, config.maxYaw ?? Number.POSITIVE_INFINITY),
    pitch: clamp(value.pitch, config.minPitch ?? -89, config.maxPitch ?? 89)
  });
}
