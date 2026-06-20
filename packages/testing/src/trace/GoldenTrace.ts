export interface TraceStep<TInput> {
  readonly dt: number;
  readonly input: TInput;
  readonly label?: string;
}

export interface TraceEvaluationContext<TInput> {
  readonly frame: number;
  readonly time: number;
  readonly dt: number;
  readonly input: TInput;
}

export interface TraceSample<TOutput> {
  readonly frame: number;
  readonly time: number;
  readonly dt: number;
  readonly output: TOutput;
  readonly label?: string;
}

export function runGoldenTrace<TInput, TOutput>(
  steps: readonly TraceStep<TInput>[],
  evaluate: (context: TraceEvaluationContext<TInput>) => TOutput
): readonly TraceSample<TOutput>[] {
  let time = 0;

  return steps.map((step, frame) => {
    time += step.dt;
    const base = {
      frame,
      time,
      dt: step.dt,
      output: evaluate({
        frame,
        time,
        dt: step.dt,
        input: step.input
      })
    };

    if (step.label === undefined) {
      return Object.freeze(base);
    }

    return Object.freeze({
      ...base,
      label: step.label
    });
  });
}
