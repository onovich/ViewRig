import type { ControlChannel } from "./ControlChannel";
import { dampNumber } from "../math/Damping";

export interface YawPitchValue {
  readonly yaw: number;
  readonly pitch: number;
}

export interface YawPitchChannelOptions {
  readonly yaw?: number;
  readonly pitch?: number;
  readonly minPitch?: number;
  readonly maxPitch?: number;
  readonly yawHalfLife?: number;
  readonly pitchHalfLife?: number;
}

export interface YawPitchChannel extends ControlChannel<YawPitchValue> {
  readonly minPitch: number;
  readonly maxPitch: number;
  readonly yawHalfLife: number;
  readonly pitchHalfLife: number;
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
  const yawHalfLife = options.yawHalfLife ?? 0;
  const pitchHalfLife = options.pitchHalfLife ?? 0;
  let value = snapshotYawPitch({
    yaw: options.yaw ?? 0,
    pitch: options.pitch ?? 0
  }, minPitch, maxPitch);
  let target: YawPitchValue | undefined;

  function usesSmoothing(): boolean {
    return yawHalfLife > 0 || pitchHalfLife > 0;
  }

  function assign(next: YawPitchValue): void {
    const snapshot = snapshotYawPitch(next, minPitch, maxPitch);
    if (usesSmoothing()) {
      target = snapshot;
    } else {
      value = snapshot;
      target = undefined;
    }
  }

  return {
    id,
    minPitch,
    maxPitch,
    yawHalfLife,
    pitchHalfLife,
    get value() {
      return value;
    },
    get target() {
      return target;
    },
    update: (dt) => {
      if (target === undefined) {
        return;
      }

      value = snapshotYawPitch({
        yaw: dampNumber(value.yaw, target.yaw, yawHalfLife, dt),
        pitch: dampNumber(value.pitch, target.pitch, pitchHalfLife, dt)
      }, minPitch, maxPitch);
    },
    set: (next) => {
      assign(next);
    },
    add: (delta) => {
      const base = target ?? value;
      assign({
        yaw: base.yaw + (delta.yaw ?? 0),
        pitch: base.pitch + (delta.pitch ?? 0)
      });
    },
    snapshot: () => snapshotYawPitch(value, minPitch, maxPitch)
  };
}
