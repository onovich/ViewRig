# ViewRig v0.2 Debug Renderer Boundary

Status: R8 deferred public debug renderer decision.

## Decision

ViewRig v0.2 does not create a public `@viewrig/debug-three` package.

The boundary for this phase is:

- `@viewrig/core` owns renderer-agnostic debug data and draw commands.
- `@viewrig/adapter-three` owns applying `CameraState` to Three-compatible cameras.
- `examples/three-orbit-playground` may render an example-internal debug overlay for smoke and visual inspection.
- Public Three debug rendering remains deferred until there is a concrete renderer contract, lifecycle model, and release surface.

## Rationale

The current core debug API is pure data:

- `CameraDebugFrame`
- `DebugDrawCommand`
- `createCameraDebugFrame`
- `createScreenZoneDebugCommands`

That is enough for engines, tools, and examples to draw debug overlays without coupling core to Three, DOM, canvas, React, Babylon, PlayCanvas, Sinan, or another host renderer.

Creating `@viewrig/debug-three` now would prematurely choose scene object ownership, disposal semantics, material policy, render-layer policy, and update cadence. Those decisions belong with a real debug renderer RFC rather than the v0.2 release-readiness pass.

## Guardrails

- `pnpm boundary:check` rejects `packages/debug-three`.
- `pnpm boundary:check` rejects package manifests named `@viewrig/debug-three`.
- Core host-dependency restrictions remain unchanged.

## Future RFC Inputs

A future public debug renderer should define:

- Whether it is a standalone package or an extension of `@viewrig/adapter-three`.
- Whether it owns Three objects or writes into caller-owned objects.
- How it maps NDC commands, 3D commands, labels, colors, lifetimes, and disposal.
- Whether browser canvas overlays and Three scene overlays share a command renderer contract.
