import type { DebugDrawCommand } from "../debug/DebugDraw.js";
import type { ScreenZoneComposerConfig, ScreenZoneComposerResult } from "./ScreenZoneComposer.js";

export function createScreenZoneDebugCommands(
  config: ScreenZoneComposerConfig,
  result: ScreenZoneComposerResult
): readonly DebugDrawCommand[] {
  const commands: DebugDrawCommand[] = [
    { type: "rectNdc", rect: config.hard, color: "#f66", label: "hard" },
    { type: "rectNdc", rect: config.soft, color: "#fc3", label: "soft" },
    { type: "rectNdc", rect: config.dead, color: "#6f6", label: "dead" }
  ];

  if (result.targetNdc !== null) {
    commands.push({
      type: "pointNdc",
      point: result.targetNdc,
      color: "#fff",
      label: `target:${result.kind}`
    });
  }

  if (result.correctionTargetNdc !== null) {
    commands.push({
      type: "pointNdc",
      point: result.correctionTargetNdc,
      color: "#6cf",
      label: "correction"
    });
  }

  return Object.freeze(commands);
}
