import type { DebugDrawCommand } from "../debug/DebugDraw.js";
import type { CameraDebugState, CameraState } from "../state/CameraState.js";

export type CameraPresetMode =
  | "thirdPerson"
  | "orbit"
  | "follow"
  | "firstPerson"
  | "railShot";

export type CameraPresetTuningValue = string | number | boolean;

export interface CameraPresetTuningControl {
  readonly id: string;
  readonly label: string;
  readonly value: CameraPresetTuningValue;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly unit?: string;
}

export interface CameraPresetEvaluationContext {
  readonly dt?: number;
  readonly previous?: CameraState;
  readonly time?: number;
}

export interface CameraPresetDebugSummary {
  readonly presetId: string;
  readonly label: string;
  readonly mode: CameraPresetMode;
  readonly liveCameraId?: string;
  readonly tags: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly tuning: readonly CameraPresetTuningControl[];
  readonly notes: readonly string[];
}

export interface CameraPresetDebugSummaryInput {
  readonly presetId: string;
  readonly label: string;
  readonly mode: CameraPresetMode;
  readonly state?: CameraState;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly tuning?: readonly CameraPresetTuningControl[];
  readonly notes?: readonly string[];
}

export interface CameraPresetEvaluation {
  readonly state: CameraState;
  readonly debug: CameraPresetDebugSummary;
  readonly draw: readonly DebugDrawCommand[];
}

export interface CameraPreset<TConfig = unknown> {
  readonly id: string;
  readonly label: string;
  readonly mode: CameraPresetMode;
  readonly config: TConfig;
  evaluate(context?: CameraPresetEvaluationContext): CameraPresetEvaluation;
}

export interface CameraPresetDescriptor<TConfig> {
  readonly id: string;
  readonly label: string;
  readonly mode: CameraPresetMode;
  readonly config: TConfig;
  readonly evaluate: (config: TConfig, context: CameraPresetEvaluationContext) => CameraState;
  readonly describe?: (
    config: TConfig,
    state: CameraState,
    context: CameraPresetEvaluationContext
  ) => Omit<CameraPresetDebugSummaryInput, "presetId" | "label" | "mode" | "state">;
  readonly draw?: (
    config: TConfig,
    state: CameraState,
    context: CameraPresetEvaluationContext
  ) => readonly DebugDrawCommand[];
}

function mergeDebugMetadata(
  stateDebug: CameraDebugState | undefined,
  metadata: Readonly<Record<string, unknown>> | undefined
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    ...(stateDebug?.metadata ?? {}),
    ...(metadata ?? {})
  });
}

export function createCameraPresetDebugSummary(
  input: CameraPresetDebugSummaryInput
): CameraPresetDebugSummary {
  return Object.freeze({
    presetId: input.presetId,
    label: input.label,
    mode: input.mode,
    ...(input.state?.debug?.liveCameraId === undefined ? {} : { liveCameraId: input.state.debug.liveCameraId }),
    tags: Object.freeze([...(input.state?.debug?.tags ?? []), ...(input.tags ?? [])]),
    metadata: mergeDebugMetadata(input.state?.debug, input.metadata),
    tuning: Object.freeze([...(input.tuning ?? [])]),
    notes: Object.freeze([...(input.notes ?? [])])
  });
}

export function createCameraPresetEvaluation(
  state: CameraState,
  debug: CameraPresetDebugSummary,
  draw: readonly DebugDrawCommand[] = []
): CameraPresetEvaluation {
  return Object.freeze({
    state,
    debug,
    draw: Object.freeze([...draw])
  });
}

export function defineCameraPreset<TConfig>(
  descriptor: CameraPresetDescriptor<TConfig>
): CameraPreset<TConfig> {
  return Object.freeze({
    id: descriptor.id,
    label: descriptor.label,
    mode: descriptor.mode,
    config: descriptor.config,
    evaluate(context: CameraPresetEvaluationContext = {}) {
      const state = descriptor.evaluate(descriptor.config, context);
      const described = descriptor.describe?.(descriptor.config, state, context);
      const debug = createCameraPresetDebugSummary({
        presetId: descriptor.id,
        label: descriptor.label,
        mode: descriptor.mode,
        state,
        ...described
      });
      const draw = descriptor.draw?.(descriptor.config, state, context) ?? [];

      return createCameraPresetEvaluation(state, debug, draw);
    }
  });
}
