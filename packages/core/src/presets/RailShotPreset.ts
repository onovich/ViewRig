import type { ControlChannel } from "../channels/ControlChannel.js";
import type { CameraPath } from "../path/CameraPath.js";
import {
  evaluateRailRig,
  resolveRailRigDriverT,
  type RailRigDriver
} from "../rigs/RailRig.js";
import type { LensState } from "../state/LensState.js";
import type { QuatLike, Vec3Like } from "../state/SnapshotTypes.js";
import {
  defineCameraPreset,
  type CameraPreset,
  type CameraPresetEvaluation,
  type CameraPresetEvaluationContext,
  type CameraPresetTuningControl
} from "./CameraPreset.js";

/** Input config for the rail/camera-shot preset. */
export interface RailShotPresetConfig {
  readonly id?: string;
  readonly label?: string;
  readonly path: CameraPath;
  readonly driver: RailRigDriver;
  readonly rotation?: QuatLike;
  readonly up?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

/** Resolved rail/camera-shot preset config. */
export interface RailShotPresetResolvedConfig {
  readonly path: CameraPath;
  readonly driver: RailRigDriver;
  readonly rotation?: QuatLike;
  readonly up?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId: string;
}

export const DEFAULT_RAIL_SHOT_PRESET_ID = "rail-shot";

function resolveInputChannelValue(channel: number | ControlChannel<number>): number {
  return typeof channel === "number" ? channel : channel.snapshot();
}

function readRailMetadataNumber(metadata: Readonly<Record<string, unknown>> | undefined, key: string): number | undefined {
  const value = metadata?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function createRailDriverTuning(
  driver: RailRigDriver,
  context: CameraPresetEvaluationContext,
  stateMetadata: Readonly<Record<string, unknown>> | undefined
): readonly CameraPresetTuningControl[] {
  const railT = readRailMetadataNumber(stateMetadata, "railT") ?? resolveRailRigDriverT(driver, context);
  const controls: CameraPresetTuningControl[] = [
    {
      id: "driver",
      label: "Driver",
      value: driver.type
    },
    {
      id: "railT",
      label: "Rail T",
      value: railT,
      min: 0,
      max: 1,
      step: 0.01
    }
  ];

  if (driver.type === "time") {
    controls.push({
      id: "duration",
      label: "Duration",
      value: driver.duration,
      min: 0,
      step: 0.01,
      unit: "s"
    });
  }

  if (driver.type === "input") {
    controls.push({
      id: "input",
      label: "Input",
      value: resolveInputChannelValue(driver.channel),
      min: 0,
      max: 1,
      step: 0.01
    });
  }

  return controls;
}

/** Applies rail-shot defaults. */
export function resolveRailShotPresetConfig(config: RailShotPresetConfig): RailShotPresetResolvedConfig {
  const debugId = config.debugId ?? config.id ?? DEFAULT_RAIL_SHOT_PRESET_ID;

  return Object.freeze({
    path: config.path,
    driver: config.driver,
    ...(config.rotation === undefined ? {} : { rotation: config.rotation }),
    ...(config.up === undefined ? {} : { up: config.up }),
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    debugId
  });
}

/** Creates a deterministic rail/camera-shot preset. */
export function createRailShotPreset(
  config: RailShotPresetConfig
): CameraPreset<RailShotPresetResolvedConfig> {
  const resolved = resolveRailShotPresetConfig(config);
  const id = config.id ?? DEFAULT_RAIL_SHOT_PRESET_ID;

  return defineCameraPreset({
    id,
    label: config.label ?? "Rail Shot",
    mode: "railShot",
    config: resolved,
    evaluate(presetConfig, context) {
      return evaluateRailRig({
        path: presetConfig.path,
        driver: presetConfig.driver,
        debugId: presetConfig.debugId,
        ...(presetConfig.rotation === undefined ? {} : { rotation: presetConfig.rotation }),
        ...(presetConfig.up === undefined ? {} : { up: presetConfig.up }),
        ...(presetConfig.lens === undefined ? {} : { lens: presetConfig.lens })
      }, context.time === undefined ? {} : { time: context.time });
    },
    describe(presetConfig, state, context) {
      return {
        tags: ["preset", "railShot", "cameraShot"],
        metadata: {
          driver: presetConfig.driver.type,
          pathLength: presetConfig.path.length
        },
        tuning: createRailDriverTuning(presetConfig.driver, context, state.debug?.metadata)
      };
    },
    draw(_presetConfig, state) {
      return [
        {
          type: "point3",
          position: state.position,
          label: "rail-shot"
        }
      ];
    }
  });
}

/** Evaluates a rail-shot preset without retaining the preset object. */
export function evaluateRailShotPreset(
  config: RailShotPresetConfig,
  context: CameraPresetEvaluationContext = {}
): CameraPresetEvaluation {
  return createRailShotPreset(config).evaluate(context);
}
