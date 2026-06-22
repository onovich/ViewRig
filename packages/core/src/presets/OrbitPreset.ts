import type { ControlChannel } from "../channels/ControlChannel.js";
import type { YawPitchValue } from "../channels/YawPitchChannel.js";
import { evaluateOrbitRig } from "../rigs/OrbitRig.js";
import type { LensState } from "../state/LensState.js";
import type { Vec3Like } from "../state/SnapshotTypes.js";
import {
  defineCameraPreset,
  type CameraPreset,
  type CameraPresetEvaluation,
  type CameraPresetEvaluationContext
} from "./CameraPreset.js";

export interface OrbitShowcasePresetConfig {
  readonly id?: string;
  readonly label?: string;
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly distance?: number | ControlChannel<number>;
  readonly pivotOffset?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

export interface OrbitShowcasePresetResolvedConfig {
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly distance: number | ControlChannel<number>;
  readonly pivotOffset: Vec3Like;
  readonly lens?: LensState;
  readonly debugId: string;
}

export const DEFAULT_ORBIT_SHOWCASE_PRESET_ID = "orbit-showcase";
export const DEFAULT_ORBIT_SHOWCASE_DISTANCE = 5;
export const DEFAULT_ORBIT_SHOWCASE_PIVOT_OFFSET = [0, 1, 0] as const;

function resolveDistanceValue(distance: number | ControlChannel<number>): number {
  return typeof distance === "number" ? distance : distance.snapshot();
}

export function resolveOrbitShowcasePresetConfig(
  config: OrbitShowcasePresetConfig
): OrbitShowcasePresetResolvedConfig {
  const debugId = config.debugId ?? config.id ?? DEFAULT_ORBIT_SHOWCASE_PRESET_ID;

  return Object.freeze({
    target: config.target,
    look: config.look,
    distance: config.distance ?? DEFAULT_ORBIT_SHOWCASE_DISTANCE,
    pivotOffset: config.pivotOffset ?? DEFAULT_ORBIT_SHOWCASE_PIVOT_OFFSET,
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    debugId
  });
}

export function createOrbitShowcasePreset(
  config: OrbitShowcasePresetConfig
): CameraPreset<OrbitShowcasePresetResolvedConfig> {
  const resolved = resolveOrbitShowcasePresetConfig(config);
  const id = config.id ?? DEFAULT_ORBIT_SHOWCASE_PRESET_ID;

  return defineCameraPreset({
    id,
    label: config.label ?? "Orbit Showcase",
    mode: "orbit",
    config: resolved,
    evaluate(presetConfig, context) {
      return evaluateOrbitRig({
        target: presetConfig.target,
        look: presetConfig.look,
        distance: resolveDistanceValue(presetConfig.distance),
        pivotOffset: presetConfig.pivotOffset,
        debugId: presetConfig.debugId,
        ...(presetConfig.lens === undefined ? {} : { lens: presetConfig.lens })
      }, context.time === undefined ? {} : { time: context.time });
    },
    describe(presetConfig) {
      const distance = resolveDistanceValue(presetConfig.distance);

      return {
        tags: ["preset", "orbit", "showcase"],
        metadata: {
          distance,
          pivotOffset: presetConfig.pivotOffset
        },
        tuning: [
          {
            id: "distance",
            label: "Distance",
            value: distance,
            min: 1,
            max: 12,
            step: 0.1,
            unit: "m"
          }
        ]
      };
    },
    draw(presetConfig, state) {
      return [
        {
          type: "line3",
          from: presetConfig.target,
          to: state.position,
          label: "orbit"
        }
      ];
    }
  });
}

export function evaluateOrbitShowcasePreset(
  config: OrbitShowcasePresetConfig,
  context: CameraPresetEvaluationContext = {}
): CameraPresetEvaluation {
  return createOrbitShowcasePreset(config).evaluate(context);
}
