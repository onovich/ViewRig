import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { rectCenter } from "./RectNdc";
import { createScreenZoneDebugCommands } from "./ScreenZoneDebug";
import { evaluateScreenZoneComposer } from "./ScreenZoneComposer";

describe("screen zone debug commands", () => {
  it("creates renderer-agnostic draw commands for zones and target points", () => {
    const config = {
      mode: "aim" as const,
      dead: rectCenter(0.2, 0.2),
      soft: rectCenter(0.8, 0.8),
      hard: rectCenter(1.6, 1.6)
    };
    const camera = evaluateFixedPose({
      position: [0, 0, 0],
      lens: { projection: "perspective", fov: 90 }
    });
    const result = evaluateScreenZoneComposer(camera, [0.5, 0, -2], config);
    const commands = createScreenZoneDebugCommands(config, result);

    expect(commands.map((command) => command.type)).toEqual([
      "rectNdc",
      "rectNdc",
      "rectNdc",
      "pointNdc",
      "pointNdc"
    ]);
    expect(Object.isFrozen(commands)).toBe(true);
  });
});
