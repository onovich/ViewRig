import type { ControlChannel } from "../channels/ControlChannel.js";
import type { YawPitchValue } from "../channels/YawPitchChannel.js";
import { evaluateFirstPersonRig } from "../rigs/FirstPersonRig.js";
import type { LensState } from "../state/LensState.js";
import { snapshotVec3, type Vec3Like } from "../state/SnapshotTypes.js";
import {
  defineCameraPreset,
  type CameraPreset,
  type CameraPresetEvaluation,
  type CameraPresetEvaluationContext
} from "./CameraPreset.js";

/** Input config for the first-person gameplay preset. */
export interface FirstPersonGameplayPresetConfig {
  readonly id?: string;
  readonly label?: string;
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly eyeOffset?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

/** Resolved first-person gameplay config with defaults applied. */
export interface FirstPersonGameplayPresetResolvedConfig {
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly eyeOffset: Vec3Like;
  readonly lens?: LensState;
  readonly debugId: string;
}

export const DEFAULT_FIRST_PERSON_GAMEPLAY_PRESET_ID = "first-person-gameplay";
export const DEFAULT_FIRST_PERSON_GAMEPLAY_EYE_OFFSET = [0, 1.65, 0] as const;

/** Applies first-person gameplay defaults. */
export function resolveFirstPersonGameplayPresetConfig(
  config: FirstPersonGameplayPresetConfig
): FirstPersonGameplayPresetResolvedConfig {
  const debugId = config.debugId ?? config.id ?? DEFAULT_FIRST_PERSON_GAMEPLAY_PRESET_ID;

  return Object.freeze({
    target: config.target,
    look: config.look,
    eyeOffset: config.eyeOffset ?? DEFAULT_FIRST_PERSON_GAMEPLAY_EYE_OFFSET,
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    debugId
  });
}

/** Creates an eye-anchor first-person gameplay preset. */
export function createFirstPersonGameplayPreset(
  config: FirstPersonGameplayPresetConfig
): CameraPreset<FirstPersonGameplayPresetResolvedConfig> {
  const resolved = resolveFirstPersonGameplayPresetConfig(config);
  const id = config.id ?? DEFAULT_FIRST_PERSON_GAMEPLAY_PRESET_ID;

  return defineCameraPreset({
    id,
    label: config.label ?? "First Person Gameplay",
    mode: "firstPerson",
    config: resolved,
    evaluate(presetConfig, context) {
      return evaluateFirstPersonRig({
        target: presetConfig.target,
        look: presetConfig.look,
        eyeOffset: presetConfig.eyeOffset,
        debugId: presetConfig.debugId,
        ...(presetConfig.lens === undefined ? {} : { lens: presetConfig.lens })
      }, context.time === undefined ? {} : { time: context.time });
    },
    describe(presetConfig) {
      const eyeOffset = snapshotVec3(presetConfig.eyeOffset);

      return {
        tags: ["preset", "firstPerson", "gameplay"],
        metadata: {
          eyeOffset: presetConfig.eyeOffset
        },
        tuning: [
          {
            id: "eyeHeight",
            label: "Eye Height",
            value: eyeOffset.y,
            min: 0.5,
            max: 2.5,
            step: 0.01,
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
          label: "first-person"
        }
      ];
    }
  });
}

/** Evaluates a first-person gameplay preset without retaining the preset object. */
export function evaluateFirstPersonGameplayPreset(
  config: FirstPersonGameplayPresetConfig,
  context: CameraPresetEvaluationContext = {}
): CameraPresetEvaluation {
  return createFirstPersonGameplayPreset(config).evaluate(context);
}
