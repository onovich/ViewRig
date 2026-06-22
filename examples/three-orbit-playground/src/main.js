import { PerspectiveCamera, Vector3 } from "three";
import { applyThreeCameraState } from "@viewrig/adapter-three";
import {
  createCameraPresetTuningSnapshot,
  createPolylinePath,
  createYawPitchChannel,
  evaluateFirstPersonGameplayPreset,
  evaluateFollowShowcasePreset,
  evaluateOrbitShowcasePreset,
  evaluateRailShotPreset,
  evaluateThirdPersonGameplayPreset
} from "@viewrig/core";

const canvas = document.querySelector("#view");
const ctx = canvas.getContext("2d");
const modeInput = document.querySelector("#mode");
const yawInput = document.querySelector("#yaw");
const pitchInput = document.querySelector("#pitch");
const distanceInput = document.querySelector("#distance");
const shoulderInput = document.querySelector("#shoulder");
const railTInput = document.querySelector("#railT");
const dampingInput = document.querySelector("#damping");
const composerInput = document.querySelector("#composer");
const debugOverlayInput = document.querySelector("#debugOverlay");
const debugStateOutput = document.querySelector("#debugState");
const poseOutput = document.querySelector("#pose");

const lens = Object.freeze({
  projection: "perspective",
  fov: 58,
  near: 0.1,
  far: 120
});

const railPoints = [
  [-4, 2.2, 7],
  [-1, 2.6, 4],
  [3, 2.1, 0],
  [0, 1.8, -4]
];
const railPath = createPolylinePath({ points: railPoints });

const galleryModes = [
  {
    id: "thirdPerson",
    label: "Third Person",
    role: "gameplay-target-follow",
    sinanPoc: "POC-2",
    target(controls) {
      return {
        x: (controls.railT - 0.5) * 2.4,
        y: 0,
        z: Math.sin(controls.railT * Math.PI) * 1.1
      };
    },
    evaluate(controls, target) {
      return evaluateThirdPersonGameplayPreset({
        target,
        look: { yaw: controls.yaw, pitch: controls.pitch },
        distance: controls.distance,
        shoulder: controls.shoulder,
        lens
      }, { time: controls.time });
    }
  },
  {
    id: "orbit",
    label: "Orbit",
    role: "object-viewer",
    sinanPoc: "POC-2",
    target: [0, 0, 0],
    evaluate(controls, target) {
      return evaluateOrbitShowcasePreset({
        target,
        look: { yaw: controls.yaw, pitch: controls.pitch },
        distance: controls.distance,
        lens
      }, { time: controls.time });
    }
  },
  {
    id: "follow",
    label: "Follow",
    role: "actor-follow",
    sinanPoc: "POC-2",
    target(controls) {
      const angle = controls.railT * Math.PI * 2;

      return {
        x: Math.cos(angle) * 1.4,
        y: 0,
        z: Math.sin(angle) * 1.1
      };
    },
    evaluate(controls, target) {
      return evaluateFollowShowcasePreset({
        target: {
          position: target,
          rotation: [0, 1, 0, 0]
        },
        offset: [controls.shoulder * 0.5, 2, -controls.distance],
        lens
      }, { time: controls.time });
    }
  },
  {
    id: "firstPerson",
    label: "First Person",
    role: "eye-anchor",
    sinanPoc: "POC-2",
    pitchClamp: {
      min: -45,
      max: 60
    },
    target: [0, 0, 3.5],
    evaluate(controls, target) {
      const look = createYawPitchChannel("gallery-first-person-look", {
        yaw: controls.yaw,
        pitch: controls.pitch,
        minPitch: this.pitchClamp.min,
        maxPitch: this.pitchClamp.max
      });

      return evaluateFirstPersonGameplayPreset({
        target,
        look,
        eyeOffset: [0, 1.65, 0],
        lens: {
          ...lens,
          fov: 66
        }
      }, { time: controls.time });
    }
  },
  {
    id: "railShot",
    label: "Rail Shot",
    role: "camera-shot",
    sinanPoc: "POC-3",
    target: [0, 0, 0],
    evaluate(controls) {
      return evaluateRailShotPreset({
        path: railPath,
        driver: {
          type: "input",
          channel: controls.railT
        },
        rotation: [0, 0, 0, 1],
        lens: {
          ...lens,
          fov: 52
        }
      }, { time: controls.time });
    }
  }
];

const galleryById = new Map(galleryModes.map((mode) => [mode.id, mode]));
const camera = new PerspectiveCamera(lens.fov, canvas.width / canvas.height, lens.near, lens.far);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolveGalleryTarget(mode, controls) {
  return typeof mode.target === "function" ? mode.target(controls) : mode.target;
}

function readControls() {
  return {
    yaw: Number(yawInput.value),
    pitch: Number(pitchInput.value),
    distance: Number(distanceInput.value),
    shoulder: Number(shoulderInput.value),
    railT: Number(railTInput.value),
    damping: Number(dampingInput.value),
    composer: composerInput.value,
    time: Number(railTInput.value) * 4
  };
}

function toVector3(point) {
  return new Vector3(point.x ?? point[0], point.y ?? point[1], point.z ?? point[2]);
}

function toVectorSnapshot(point) {
  const vector = toVector3(point);

  return {
    x: vector.x,
    y: vector.y,
    z: vector.z
  };
}

function projectTopDown(point) {
  const vector = toVector3(point);
  const scale = 36;

  return {
    x: canvas.width * 0.5 + vector.x * scale,
    y: canvas.height * 0.58 + vector.z * scale
  };
}

function drawGrid() {
  ctx.fillStyle = "#171719";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#2f3438";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawCircle(point, radius, fill, stroke) {
  const projected = projectTopDown(point);
  ctx.beginPath();
  ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  if (stroke !== undefined) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function drawLine(from, to, color, width = 3) {
  const start = projectTopDown(from);
  const end = projectTopDown(to);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawRailPath() {
  ctx.beginPath();
  for (let i = 0; i < railPoints.length; i += 1) {
    const point = projectTopDown(railPoints[i]);
    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.strokeStyle = "#f36f6f";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawCameraFrustum(state) {
  const cameraPoint = projectTopDown(state.position);
  const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const left = new Vector3(forward.x * 1.4 - forward.z * 0.35, 0, forward.z * 1.4 + forward.x * 0.35);
  const right = new Vector3(forward.x * 1.4 + forward.z * 0.35, 0, forward.z * 1.4 - forward.x * 0.35);
  const leftPoint = projectTopDown({
    x: state.position.x + left.x,
    y: state.position.y,
    z: state.position.z + left.z
  });
  const rightPoint = projectTopDown({
    x: state.position.x + right.x,
    y: state.position.y,
    z: state.position.z + right.z
  });

  ctx.beginPath();
  ctx.moveTo(cameraPoint.x, cameraPoint.y);
  ctx.lineTo(leftPoint.x, leftPoint.y);
  ctx.moveTo(cameraPoint.x, cameraPoint.y);
  ctx.lineTo(rightPoint.x, rightPoint.y);
  ctx.strokeStyle = "#ffcf66";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawDebugOverlay(mode, evaluation, controls, target) {
  if (!debugOverlayInput.checked) {
    return;
  }

  drawLine(target, evaluation.state.position, "#70e0ff", 2);
  ctx.fillStyle = "#70e0ff";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(`live:${mode.id}`, 24, 32);
  ctx.fillText(`preset:${evaluation.debug.presetId}`, 24, 54);
  ctx.fillText(`target x:${toVectorSnapshot(target).x.toFixed(2)} z:${toVectorSnapshot(target).z.toFixed(2)}`, 24, 76);
  ctx.fillText(`composer:${controls.composer} damping:${controls.damping.toFixed(2)}`, 24, 98);
  ctx.fillText(`adapter:@viewrig/adapter-three`, 24, 120);
}

function drawGalleryFrame(mode, evaluation, controls, target) {
  drawGrid();

  if (mode.id === "railShot" || debugOverlayInput.checked) {
    drawRailPath();
  }

  if (mode.id === "orbit") {
    drawCircle([0, 1, 0], 18, "#f4b84a", "#fff2bf");
  }

  if (mode.id === "thirdPerson" || mode.id === "follow") {
    drawCircle(target, 14, "#3fcf8e", "#d8ffe9");
  }

  if (mode.id === "firstPerson") {
    drawCircle(mode.target, 14, "#72b7ff", "#e8f5ff");
  }

  drawCircle(target, 9, "#f8f5ea");
  drawCircle(evaluation.state.position, 12, "#ffcf66", "#fff2bf");
  drawCameraFrustum(evaluation.state);
  drawDebugOverlay(mode, evaluation, controls, target);
}

function createPoseOutput(mode, evaluation, controls, target) {
  return {
    mode: mode.id,
    label: mode.label,
    presetId: evaluation.debug.presetId,
    adapter: "@viewrig/adapter-three",
    renderer: "three-camera-canvas",
    integration: {
      role: mode.role,
      sinanPoc: mode.sinanPoc,
      sourceOfTruth: "ViewRig example input only",
      ...(mode.pitchClamp === undefined ? {} : {
        pitchClamp: mode.pitchClamp,
        appliedPitch: clamp(controls.pitch, mode.pitchClamp.min, mode.pitchClamp.max)
      })
    },
    state: {
      position: evaluation.state.position,
      rotation: evaluation.state.rotation,
      lens: evaluation.state.lens,
      time: evaluation.state.time
    },
    target: toVectorSnapshot(target),
    camera: {
      position: camera.position.toArray(),
      quaternion: camera.quaternion.toArray(),
      matrixWorldPosition: [
        camera.matrixWorld.elements[12],
        camera.matrixWorld.elements[13],
        camera.matrixWorld.elements[14]
      ]
    },
    controls,
    tuning: {
      ...createCameraPresetTuningSnapshot(evaluation),
      composer: controls.composer,
      dampingHalfLife: controls.damping,
      targetRailT: controls.railT
    },
    debug: {
      liveCameraId: evaluation.debug.liveCameraId,
      tags: evaluation.debug.tags,
      drawCount: evaluation.draw.length,
      overlay: debugOverlayInput.checked
    }
  };
}

function render() {
  const mode = galleryById.get(modeInput.value) ?? galleryModes[0];
  const controls = readControls();
  const target = resolveGalleryTarget(mode, controls);
  const evaluation = mode.evaluate(controls, target);

  applyThreeCameraState(camera, evaluation.state);
  drawGalleryFrame(mode, evaluation, controls, target);

  debugStateOutput.textContent = debugOverlayInput.checked
    ? `debug:on live:${mode.id} preset:${evaluation.debug.presetId} adapter:three`
    : `debug:off live:${mode.id}`;
  poseOutput.textContent = JSON.stringify(createPoseOutput(mode, evaluation, controls, target), null, 2);
  globalThis.__viewrigGalleryFrame = (globalThis.__viewrigGalleryFrame ?? 0) + 1;
}

for (const input of [
  modeInput,
  yawInput,
  pitchInput,
  distanceInput,
  shoulderInput,
  railTInput,
  dampingInput,
  composerInput,
  debugOverlayInput
]) {
  input.addEventListener("input", render);
}

render();
