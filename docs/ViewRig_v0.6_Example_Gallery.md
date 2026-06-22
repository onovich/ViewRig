# ViewRig v0.6 Example Gallery

Date: 2026-06-22
Status: R11 docs/recipes alignment

## 1. Location

The v0.6 example gallery lives at:

```txt
examples/three-orbit-playground
```

It is still a private workspace example. It is not a public deployment and does
not publish packages.

## 2. Run And Validate

Build the example:

```powershell
pnpm --dir examples/three-orbit-playground build
```

Run the browser smoke matrix:

```powershell
pnpm test:browser
```

The smoke builds the gallery, serves `dist` through local HTTP, opens Playwright
Chromium or an approved system Chromium channel, checks DOM state, checks canvas
signal, and fails on console, request, page, or HTTP errors.

## 3. Shared Integration Path

Every gallery mode follows the same path:

```txt
example controls
  -> v0.5 preset evaluation
  -> CameraState
  -> applyThreeCameraState
  -> THREE.PerspectiveCamera
  -> deterministic canvas signal
```

The canvas signal is intentionally deterministic 2D output driven by the
adapter-applied Three camera. This keeps the smoke stable in headless
environments where WebGL capture can lose context.

## 4. Modes

| Mode | Preset | Evidence |
| --- | --- | --- |
| `thirdPerson` | `createThirdPersonGameplayPreset` | moving target, shoulder, distance, debug/tuning |
| `orbit` | `createOrbitShowcasePreset` | object-viewer role, distance tuning, POC-2 tag |
| `follow` | `createFollowShowcasePreset` | moving actor target, stable offset, POC-2 tag |
| `firstPerson` | `createFirstPersonGameplayPreset` | eye offset and pitch clamp |
| `railShot` | `createRailShotPreset` | input scrub, time driver, duration, POC-3 tag |

## 5. Boundary

The gallery is integration evidence only. It does not move DOM, Three, or
example UI state into `@viewrig/core`; it does not add public `@viewrig/sinan`;
and it does not publish, tag, or deploy anything.
