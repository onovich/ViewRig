# ViewRig v0.5 Playground Usability

Date: 2026-06-22
Status: R8 playground tuning notes

## 1. Goal

The playground should act as a small product usability surface, not just a
rendering smoke fixture. It needs to show that common camera modes can be
selected, tuned, inspected, and smoke-tested without pulling UI concepts back
into `@viewrig/core`.

## 2. Current Controls

The R8 playground supports:

- mode switch: `orbit` and `thirdPerson`;
- yaw;
- pitch;
- distance;
- shoulder;
- damping half-life;
- composer profile;
- debug overlay toggle;
- JSON pose/tuning output.

The mode switch and tuning controls are example UI state. They are intentionally
kept in `examples/three-orbit-playground`.

## 3. Smoke Coverage

`pnpm test:browser` now verifies:

- playground build succeeds;
- browser page loads without console, request, or page errors;
- canvas renders a useful nonblank frame;
- yaw, pitch, distance, damping, and composer controls update JSON state;
- switching from orbit to third-person changes pose identity and camera
  position;
- shoulder tuning changes third-person camera placement;
- debug overlay off/on updates DOM status;
- debug overlay visibly changes the canvas.

## 4. Core Boundary

The playground mirrors v0.5 preset concepts for usability testing, but it does
not become core logic.

Core stays responsible for:

- `CameraState`;
- rig and preset APIs;
- debug/tuning data shapes;
- renderer-agnostic draw commands.

The playground stays responsible for:

- HTML controls;
- canvas drawing;
- DOM events;
- browser smoke assertions;
- visual inspection affordances.

## 5. Follow-Up

Later rounds should align this playground with recipe docs and packed-package
consumer smoke so the public API, docs, and example experience all demonstrate
the same camera roles.
