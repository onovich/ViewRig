const canvas = document.querySelector("#view");
const ctx = canvas.getContext("2d");
const yawInput = document.querySelector("#yaw");
const pitchInput = document.querySelector("#pitch");
const distanceInput = document.querySelector("#distance");
const debugOverlayInput = document.querySelector("#debugOverlay");
const debugStateOutput = document.querySelector("#debugState");
const poseOutput = document.querySelector("#pose");

function orbitPose({ yaw, pitch, distance }) {
  const yawRad = yaw * Math.PI / 180;
  const pitchRad = pitch * Math.PI / 180;
  const cosPitch = Math.cos(pitchRad);
  return {
    position: {
      x: Math.sin(yawRad) * cosPitch * distance,
      y: Math.sin(pitchRad) * distance,
      z: Math.cos(yawRad) * cosPitch * distance
    },
    target: { x: 0, y: 0, z: 0 }
  };
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
  ctx.fillText("live: orbit", 24, 32);
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
  const pose = orbitPose({
    yaw: Number(yawInput.value),
    pitch: Number(pitchInput.value),
    distance: Number(distanceInput.value)
  });
  const camera = projectTopDown(pose.position);
  const target = projectTopDown(pose.target);

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
  ctx.moveTo(target.x, target.y);
  ctx.lineTo(camera.x, camera.y);
  ctx.stroke();

  ctx.fillStyle = "#f7f7f2";
  ctx.beginPath();
  ctx.arc(target.x, target.y, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffcf66";
  ctx.beginPath();
  ctx.arc(camera.x, camera.y, 12, 0, Math.PI * 2);
  ctx.fill();

  if (debugOverlayInput.checked) {
    drawDebugOverlay({ pose, camera, target });
  }

  debugStateOutput.textContent = debugOverlayInput.checked ? "debug:on live:orbit" : "debug:off";
  poseOutput.textContent = JSON.stringify(pose, null, 2);
}

for (const input of [yawInput, pitchInput, distanceInput, debugOverlayInput]) {
  input.addEventListener("input", render);
}

render();
