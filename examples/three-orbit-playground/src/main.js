const canvas = document.querySelector("#view");
const ctx = canvas.getContext("2d");
const yawInput = document.querySelector("#yaw");
const pitchInput = document.querySelector("#pitch");
const distanceInput = document.querySelector("#distance");
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

  poseOutput.textContent = JSON.stringify(pose, null, 2);
}

for (const input of [yawInput, pitchInput, distanceInput]) {
  input.addEventListener("input", render);
}

render();
