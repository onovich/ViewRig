export type ActivationTransition = "cut";

export interface CameraActivationOptions {
  readonly transition?: ActivationTransition;
  readonly force?: boolean;
}

export interface CameraActivationRecord {
  readonly fromId: string | null;
  readonly toId: string;
  readonly transition: ActivationTransition;
}

export function normalizeActivationOptions(
  options: CameraActivationOptions = {}
): Required<Pick<CameraActivationOptions, "transition" | "force">> {
  return {
    transition: options.transition ?? "cut",
    force: options.force ?? false
  };
}
