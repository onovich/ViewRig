import type { ControlChannel } from "../channels/ControlChannel.js";
import type { YawPitchValue } from "../channels/YawPitchChannel.js";
import type { LensState } from "../state/LensState.js";
import type { Vec3Like } from "../state/SnapshotTypes.js";
import { evaluateThirdPersonRig } from "../rigs/ThirdPersonRig.js";
import {
  defineCameraPreset,
  type CameraPreset,
  type CameraPresetEvaluation,
  type CameraPresetEvaluationContext
} from "./CameraPreset.js";

export interface ThirdPersonGameplayPresetConfig {
  readonly id?: string;
  readonly label?: string;
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly distance?: number;
  readonly pivotOffset?: Vec3Like;
  readonly shoulder?: number | ControlChannel<number>;
  readonly shoulderOffset?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

export interface ThirdPersonGameplayPresetResolvedConfig {
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly distance: number;
  readonly pivotOffset: Vec3Like;
  readonly shoulder: number | ControlChannel<number>;
  readonly shoulderOffset: Vec3Like;
  readonly lens?: LensState;
  readonly debugId: string;
}

export const DEFAULT_THIRD_PERSON_GAMEPLAY_PRESET_ID = "third-person-gameplay";
export const DEFAULT_THIRD_PERSON_GAMEPLAY_DISTANCE = 4;
export const DEFAULT_THIRD_PERSON_GAMEPLAY_PIVOT_OFFSET = [0, 1.5, 0] as const;
export const DEFAULT_THIRD_PERSON_GAMEPLAY_SHOULDER = 1;
export const DEFAULT_THIRD_PERSON_GAMEPLAY_SHOULDER_OFFSET = [0.45, 0.05, 0] as const;

function resolveShoulderValue(shoulder: number | ControlChannel<number>): number {
  return typeof shoulder === "number" ? shoulder : shoulder.snapshot();
}

export function resolveThirdPersonGameplayPresetConfig(
  config: ThirdPersonGameplayPresetConfig
): ThirdPersonGameplayPresetResolvedConfig {
  const debugId = config.debugId ?? config.id ?? DEFAULT_THIRD_PERSON_GAMEPLAY_PRESET_ID;

  return Object.freeze({
    target: config.target,
    look: config.look,
    distance: config.distance ?? DEFAULT_THIRD_PERSON_GAMEPLAY_DISTANCE,
    pivotOffset: config.pivotOffset ?? DEFAULT_THIRD_PERSON_GAMEPLAY_PIVOT_OFFSET,
    shoulder: config.shoulder ?? DEFAULT_THIRD_PERSON_GAMEPLAY_SHOULDER,
    shoulderOffset: config.shoulderOffset ?? DEFAULT_THIRD_PERSON_GAMEPLAY_SHOULDER_OFFSET,
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    debugId
  });
}

export function createThirdPersonGameplayPreset(
  config: ThirdPersonGameplayPresetConfig
): CameraPreset<ThirdPersonGameplayPresetResolvedConfig> {
  const resolved = resolveThirdPersonGameplayPresetConfig(config);
  const id = config.id ?? DEFAULT_THIRD_PERSON_GAMEPLAY_PRESET_ID;

  return defineCameraPreset({
    id,
    label: config.label ?? "Third Person Gameplay",
    mode: "thirdPerson",
    config: resolved,
    evaluate(presetConfig, context) {
      return evaluateThirdPersonRig({
        target: presetConfig.target,
        look: presetConfig.look,
        distance: presetConfig.distance,
        pivotOffset: presetConfig.pivotOffset,
        shoulder: presetConfig.shoulder,
        shoulderOffset: presetConfig.shoulderOffset,
        debugId: presetConfig.debugId,
        ...(presetConfig.lens === undefined ? {} : { lens: presetConfig.lens })
      }, context.time === undefined ? {} : { time: context.time });
    },
    describe(presetConfig) {
      const shoulder = resolveShoulderValue(presetConfig.shoulder);

      return {
        tags: ["preset", "thirdPerson", "gameplay"],
        metadata: {
          distance: presetConfig.distance,
          pivotOffset: presetConfig.pivotOffset,
          shoulder,
          shoulderOffset: presetConfig.shoulderOffset
        },
        tuning: [
          {
            id: "distance",
            label: "Distance",
            value: presetConfig.distance,
            min: 0.7,
            max: 8,
            step: 0.1,
            unit: "m"
          },
          {
            id: "shoulder",
            label: "Shoulder",
            value: shoulder,
            min: -1,
            max: 1,
            step: 0.1
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
          label: "third-person"
        }
      ];
    }
  });
}

export function evaluateThirdPersonGameplayPreset(
  config: ThirdPersonGameplayPresetConfig,
  context: CameraPresetEvaluationContext = {}
): CameraPresetEvaluation {
  return createThirdPersonGameplayPreset(config).evaluate(context);
}
