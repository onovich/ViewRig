const canvas = document.querySelector("#view");
const ctx = canvas.getContext("2d");
const modeInput = document.querySelector("#mode");
const yawInput = document.querySelector("#yaw");
const pitchInput = document.querySelector("#pitch");
const distanceInput = document.querySelector("#distance");
const debugOverlayInput = document.querySelector("#debugOverlay");
const debugStateOutput = document.querySelector("#debugState");
const poseOutput = document.querySelector("#pose");

function resolveOrbitOffset({ yaw, pitch, distance }) {
  const yawRad = yaw * Math.PI / 180;
  const pitchRad = pitch * Math.PI / 180;
  const cosPitch = Math.cos(pitchRad);
  return {
    x: Math.sin(yawRad) * cosPitch * distance,
    y: Math.sin(pitchRad) * distance,
    z: Math.cos(yawRad) * cosPitch * distance
  };
}

function orbitPose({ yaw, pitch, distance }) {
  const offset = resolveOrbitOffset({ yaw, pitch, distance });
  return {
    mode: "orbit",
    presetId: "orbit-showcase",
    position: offset,
    pivot: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    tuning: { distance }
  };
}

function thirdPersonPose({ yaw, pitch, distance }) {
  const target = { x: 0, y: 0, z: 0 };
  const pivot = { x: 0, y: 1.5, z: 0 };
  const shoulderOffset = { x: 0.45, y: 0.05, z: 0 };
  const offset = resolveOrbitOffset({ yaw, pitch, distance });
  return {
    mode: "thirdPerson",
    presetId: "third-person-gameplay",
    position: {
      x: pivot.x + offset.x + shoulderOffset.x,
      y: pivot.y + offset.y + shoulderOffset.y,
      z: pivot.z + offset.z + shoulderOffset.z
    },
    pivot,
    target,
    tuning: {
      distance,
      shoulder: 1
    }
  };
}

function computePose({ mode, yaw, pitch, distance }) {
  if (mode === "thirdPerson") {
    return thirdPersonPose({ yaw, pitch, distance });
  }

  return orbitPose({ yaw, pitch, distance });
}

function projectTopDown(point) {
  const scale = 34;
  return {
    x: canvas.width * 0.5 + point.x * scale,
    y: canvas.height * 0.5 + point.z * scale
  };
}

function drawDebugOverlay({ pose, camera, target }) {
  const deadZone = {
    x: canvas.width * 0.36,
    y: canvas.height * 0.32,
    width: canvas.width * 0.28,
    height: canvas.height * 0.36
  };
  const softZone = {
    x: canvas.width * 0.24,
    y: canvas.height * 0.2,
    width: canvas.width * 0.52,
    height: canvas.height * 0.6
  };

  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#68e6a6";
  ctx.strokeRect(softZone.x, softZone.y, softZone.width, softZone.height);
  ctx.strokeStyle = "#ffcf66";
  ctx.strokeRect(deadZone.x, deadZone.y, deadZone.width, deadZone.height);
  ctx.setLineDash([]);

  ctx.font = "14px system-ui, sans-serif";
  ctx.fillStyle = "#68e6a6";
  ctx.fillText(`live: ${pose.mode}`, 24, 32);
  ctx.fillText(`camera x:${pose.position.x.toFixed(2)} z:${pose.position.z.toFixed(2)}`, 24, 54);
  ctx.fillText(`target x:${pose.target.x.toFixed(2)} z:${pose.target.z.toFixed(2)}`, 24, 76);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(target.x, target.y, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(camera.x, camera.y, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function render() {
  const pose = computePose({
    mode: modeInput.value,
    yaw: Number(yawInput.value),
    pitch: Number(pitchInput.value),
    distance: Number(distanceInput.value)
  });
  const camera = projectTopDown(pose.position);
  const target = projectTopDown(pose.target);
  const pivot = projectTopDown(pose.pivot);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#39414c";
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

  ctx.strokeStyle = "#7cc7ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pivot.x, pivot.y);
  ctx.lineTo(camera.x, camera.y);
  ctx.stroke();

  ctx.fillStyle = "#f7f7f2";
  ctx.beginPath();
  ctx.arc(target.x, target.y, 10, 0, Math.PI * 2);
  ctx.fill();

  if (pose.mode === "thirdPerson") {
    ctx.fillStyle = "#68e6a6";
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ffcf66";
  ctx.beginPath();
  ctx.arc(camera.x, camera.y, 12, 0, Math.PI * 2);
  ctx.fill();

  if (debugOverlayInput.checked) {
    drawDebugOverlay({ pose, camera, target });
  }

  debugStateOutput.textContent = debugOverlayInput.checked ? `debug:on live:${pose.mode}` : "debug:off";
  poseOutput.textContent = JSON.stringify(pose, null, 2);
}

for (const input of [modeInput, yawInput, pitchInput, distanceInput, debugOverlayInput]) {
  input.addEventListener("input", render);
}

render();
