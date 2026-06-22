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

export type CameraPresetDebugSource = CameraPresetDebugSummary | CameraPresetEvaluation;

export type CameraPresetTuningSnapshot = Readonly<Record<string, CameraPresetTuningValue>>;

export interface CameraPresetDebugStatus {
  readonly presetId: string;
  readonly label: string;
  readonly mode: CameraPresetMode;
  readonly liveCameraId?: string;
  readonly tuning: CameraPresetTuningSnapshot;
  readonly tags: readonly string[];
  readonly notes: readonly string[];
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

export function getCameraPresetDebugSummary(source: CameraPresetDebugSource): CameraPresetDebugSummary {
  return "state" in source ? source.debug : source;
}

export function findCameraPresetTuningControl(
  source: CameraPresetDebugSource,
  id: string
): CameraPresetTuningControl | undefined {
  return getCameraPresetDebugSummary(source).tuning.find((control) => control.id === id);
}

export function createCameraPresetTuningSnapshot(source: CameraPresetDebugSource): CameraPresetTuningSnapshot {
  const summary = getCameraPresetDebugSummary(source);
  const entries = summary.tuning.map((control) => [control.id, control.value] as const);

  return Object.freeze(Object.fromEntries(entries) as Record<string, CameraPresetTuningValue>);
}

export function createCameraPresetDebugStatus(source: CameraPresetDebugSource): CameraPresetDebugStatus {
  const summary = getCameraPresetDebugSummary(source);

  return Object.freeze({
    presetId: summary.presetId,
    label: summary.label,
    mode: summary.mode,
    ...(summary.liveCameraId === undefined ? {} : { liveCameraId: summary.liveCameraId }),
    tuning: createCameraPresetTuningSnapshot(summary),
    tags: summary.tags,
    notes: summary.notes
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
