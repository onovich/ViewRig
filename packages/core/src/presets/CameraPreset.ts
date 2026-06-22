import type { DebugDrawCommand } from "../debug/DebugDraw.js";
import type { CameraDebugState, CameraState } from "../state/CameraState.js";

/** Camera role exposed by a v0.5 preset. */
export type CameraPresetMode =
  | "thirdPerson"
  | "orbit"
  | "follow"
  | "firstPerson"
  | "railShot";

/** Scalar value shape used by preset tuning summaries. */
export type CameraPresetTuningValue = string | number | boolean;

/** One UI-friendly tuning control reported by a preset evaluation. */
export interface CameraPresetTuningControl {
  readonly id: string;
  readonly label: string;
  readonly value: CameraPresetTuningValue;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly unit?: string;
}

/** Optional frame context passed to preset evaluation. */
export interface CameraPresetEvaluationContext {
  readonly dt?: number;
  readonly previous?: CameraState;
  readonly time?: number;
}

/** Renderer-agnostic debug and tuning summary for a preset result. */
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

/** Input shape for creating a preset debug summary. */
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

/** Full preset evaluation result: state, debug summary, and draw commands. */
export interface CameraPresetEvaluation {
  readonly state: CameraState;
  readonly debug: CameraPresetDebugSummary;
  readonly draw: readonly DebugDrawCommand[];
}

/** Either a full evaluation or its extracted debug summary. */
export type CameraPresetDebugSource = CameraPresetDebugSummary | CameraPresetEvaluation;

/** Map of tuning control ids to their current values. */
export type CameraPresetTuningSnapshot = Readonly<Record<string, CameraPresetTuningValue>>;

/** Compact status object for playgrounds, smoke tests, and diagnostics. */
export interface CameraPresetDebugStatus {
  readonly presetId: string;
  readonly label: string;
  readonly mode: CameraPresetMode;
  readonly liveCameraId?: string;
  readonly tuning: CameraPresetTuningSnapshot;
  readonly tags: readonly string[];
  readonly notes: readonly string[];
}

/** Reusable preset object with typed config and explicit evaluation. */
export interface CameraPreset<TConfig = unknown> {
  readonly id: string;
  readonly label: string;
  readonly mode: CameraPresetMode;
  readonly config: TConfig;
  evaluate(context?: CameraPresetEvaluationContext): CameraPresetEvaluation;
}

/** Declarative descriptor consumed by defineCameraPreset. */
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

/** Creates a frozen debug summary from preset and CameraState metadata. */
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

/** Creates a frozen preset evaluation result. */
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

/** Extracts the debug summary from either a summary or full evaluation. */
export function getCameraPresetDebugSummary(source: CameraPresetDebugSource): CameraPresetDebugSummary {
  return "state" in source ? source.debug : source;
}

/** Finds a tuning control by id. */
export function findCameraPresetTuningControl(
  source: CameraPresetDebugSource,
  id: string
): CameraPresetTuningControl | undefined {
  return getCameraPresetDebugSummary(source).tuning.find((control) => control.id === id);
}

/** Converts tuning controls into an id/value snapshot. */
export function createCameraPresetTuningSnapshot(source: CameraPresetDebugSource): CameraPresetTuningSnapshot {
  const summary = getCameraPresetDebugSummary(source);
  const entries = summary.tuning.map((control) => [control.id, control.value] as const);

  return Object.freeze(Object.fromEntries(entries) as Record<string, CameraPresetTuningValue>);
}

/** Creates a compact status object from preset debug data. */
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

/** Defines a reusable preset from a typed descriptor. */
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
