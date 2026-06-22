# ViewRig v0.6 Browser Smoke

Date: 2026-06-22
Status: R9 browser smoke matrix evidence

## 1. Goal

The v0.6 browser smoke verifies the example gallery as a repeatable integration
surface. It proves that the gallery can build, load through local HTTP, evaluate
v0.5 presets, apply states through `@viewrig/adapter-three`, render a stable
canvas signal, expose DOM/debug state, and run without browser errors.

## 2. Covered Modes

The smoke matrix covers:

- `thirdPerson` with moving target, shoulder tuning, distance tuning, and
  debug/tuning output;
- `orbit` with object-viewer role and POC-2 tag;
- `follow` with moving actor target and stable camera offset;
- `firstPerson` with eye offset and pitch clamp evidence;
- `railShot` with input scrub and time-driver rail workflows.

For each mode, the smoke asserts:

- pose identity and preset id;
- nonblank canvas signal;
- mode/status DOM output;
- shared adapter marker;
- integration role and POC tag where relevant.

## 3. Canvas Signal

The gallery uses a deterministic 2D canvas signal driven by a real
`THREE.PerspectiveCamera` after `applyThreeCameraState` writes the ViewRig
`CameraState`. Earlier probing showed that Playwright headless can lose WebGL
context while capturing WebGL canvases on this host, so the smoke intentionally
does not depend on WebGL readback. The integration evidence remains the real
Three camera object and adapter apply path; the canvas is the stable observable
signal.

## 4. Error Guards

The smoke fails on:

- failed HTTP responses or failed requests;
- browser page errors;
- browser console errors;
- blank canvas signal;
- missing DOM smoke hooks;
- mode canvas hashes that are not distinct enough;
- debug overlay off/on failing to change the canvas signal.

## 5. Validation

Required R9 validation:

- `pnpm test:browser`
- `git diff --check`

R9 status: PASS when required validation passes and the commit is pushed.
