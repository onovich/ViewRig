import type { BlendOptions } from "./Blend.js";
import type { ChannelInheritancePair } from "../channels/ChannelInheritance.js";

export type ActivationTransition = "cut" | "blend" | "matchThenBlend";

export interface CameraActivationOptions {
  readonly transition?: ActivationTransition;
  readonly blend?: BlendOptions;
  readonly inheritChannels?: readonly ChannelInheritancePair[];
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
