import { evaluateFollowRig, type FollowTargetSample } from "../rigs/FollowRig.js";
import type { LensState } from "../state/LensState.js";
import { snapshotVec3, type Vec3Like } from "../state/SnapshotTypes.js";
import {
  defineCameraPreset,
  type CameraPreset,
  type CameraPresetEvaluation,
  type CameraPresetEvaluationContext
} from "./CameraPreset.js";

/** Input config for the follow showcase preset. */
export interface FollowShowcasePresetConfig {
  readonly id?: string;
  readonly label?: string;
  readonly target: FollowTargetSample;
  readonly offset?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

/** Resolved follow showcase config with defaults applied. */
export interface FollowShowcasePresetResolvedConfig {
  readonly target: FollowTargetSample;
  readonly offset: Vec3Like;
  readonly lens?: LensState;
  readonly debugId: string;
}

export const DEFAULT_FOLLOW_SHOWCASE_PRESET_ID = "follow-showcase";
export const DEFAULT_FOLLOW_SHOWCASE_OFFSET = [0, 2, -6] as const;

/** Applies follow showcase defaults. */
export function resolveFollowShowcasePresetConfig(
  config: FollowShowcasePresetConfig
): FollowShowcasePresetResolvedConfig {
  const debugId = config.debugId ?? config.id ?? DEFAULT_FOLLOW_SHOWCASE_PRESET_ID;

  return Object.freeze({
    target: config.target,
    offset: config.offset ?? DEFAULT_FOLLOW_SHOWCASE_OFFSET,
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    debugId
  });
}

/** Creates a simple follow preset for actors or anchors. */
export function createFollowShowcasePreset(
  config: FollowShowcasePresetConfig
): CameraPreset<FollowShowcasePresetResolvedConfig> {
  const resolved = resolveFollowShowcasePresetConfig(config);
  const id = config.id ?? DEFAULT_FOLLOW_SHOWCASE_PRESET_ID;

  return defineCameraPreset({
    id,
    label: config.label ?? "Follow Showcase",
    mode: "follow",
    config: resolved,
    evaluate(presetConfig, context) {
      return evaluateFollowRig({
        target: presetConfig.target,
        offset: presetConfig.offset,
        debugId: presetConfig.debugId,
        ...(presetConfig.lens === undefined ? {} : { lens: presetConfig.lens })
      }, context.time === undefined ? {} : { time: context.time });
    },
    describe(presetConfig) {
      const offset = snapshotVec3(presetConfig.offset);

      return {
        tags: ["preset", "follow", "showcase"],
        metadata: {
          offset: presetConfig.offset
        },
        tuning: [
          {
            id: "offsetX",
            label: "Offset X",
            value: offset.x,
            step: 0.1,
            unit: "m"
          },
          {
            id: "offsetY",
            label: "Offset Y",
            value: offset.y,
            step: 0.1,
            unit: "m"
          },
          {
            id: "offsetZ",
            label: "Offset Z",
            value: offset.z,
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
          from: presetConfig.target.position,
          to: state.position,
          label: "follow"
        }
      ];
    }
  });
}

/** Evaluates a follow showcase preset without retaining the preset object. */
export function evaluateFollowShowcasePreset(
  config: FollowShowcasePresetConfig,
  context: CameraPresetEvaluationContext = {}
): CameraPresetEvaluation {
  return createFollowShowcasePreset(config).evaluate(context);
}
