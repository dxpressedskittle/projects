// Clean 3D engine with smooth movement, scene API, and helpers

// --- Canvas setup & runtime guards ---
const canvasEl = document.getElementById("gameCanvas");
const canvas = canvasEl || document.createElement("canvas");
const viewPortWidth = document.documentElement.clientWidth;
const viewPortHeight = document.documentElement.clientHeight;
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;
const ctx = canvas.getContext ? canvas.getContext("2d") : null;

const fov = Math.min(canvas.width, canvas.height) || 600;
const canvasOffsetX = canvas.width / 2;
const canvasOffsetY = canvas.height / 2;

// --- Basic scene objects ---
const cube = {
  vertices: [
    [-1, -2, 1],
    [1, -2, 1],
    [1, 0, 1],
    [-1, 0, 1],
    [-1, -2, -1],
    [1, -2, -1],
    [1, 0, -1],
    [-1, 0, -1],
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ],
  strokeStyle: "#000",
};

// Use in registerScene to create multiple cubes
function makeCube(center = [0, 0, 0], s = 1) {
  const [cx, cy, cz] = center;
  const verts = [
    [cx - s, cy - s, cz + s],
    [cx + s, cy - s, cz + s],
    [cx + s, cy + s, cz + s],
    [cx - s, cy + s, cz + s],
    [cx - s, cy - s, cz - s],
    [cx + s, cy - s, cz - s],
    [cx + s, cy + s, cz - s],
    [cx - s, cy + s, cz - s],
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  return { vertices: verts, edges };
}

// Floor grid generation
const gridSize = 20;
const gridSpacing = 1.0;
const floor = { vertices: [], edges: [], strokeStyle: "#888" };
for (let x = -gridSize / 2; x <= gridSize / 2; x++) {
  for (let z = -gridSize / 2; z <= gridSize / 2; z++) {
    floor.vertices.push([x * gridSpacing, 0, z * gridSpacing]);
  }
}
for (let i = 0; i <= gridSize; i++) {
  const start = i * (gridSize + 1);
  for (let j = 0; j < gridSize; j++)
    floor.edges.push([start + j, start + j + 1]);
  for (let j = 0; j < gridSize; j++)
    floor.edges.push([j * (gridSize + 1) + i, (j + 1) * (gridSize + 1) + i]);
}

//  Scene management 
const scene = [];
function isRenderable(obj) {
  return obj && Array.isArray(obj.vertices) && Array.isArray(obj.edges);
}
function registerScene(objOrFactory) {
  if (typeof objOrFactory === "function") {
    scene.push(objOrFactory);
    return objOrFactory;
  }
  if (!isRenderable(objOrFactory)) {
    console.warn("registerScene: invalid object", objOrFactory);
    return null;
  }
  scene.push(objOrFactory);
  return objOrFactory;
}
// register defaults
registerScene(floor);
registerScene(cube);

// --- Camera & globals ---

let camera = [0, 2, -5];
let mouseLocked = false;
let cameraYaw = 0;
let cameraPitch = 0;

// 3D to 2D projection 
function transform(v) {
  const z = v[2];
  const safeZ = z <= 0.001 ? 0.001 : z;
  const f = fov / safeZ;
  return [v[0] * f, v[1] * f];
}

// Rotation helpers
function rotateY(v, angle) {
  return [
    v[0] * Math.cos(angle) - v[2] * Math.sin(angle),
    v[1],
    v[0] * Math.sin(angle) + v[2] * Math.cos(angle),
  ];
}
function rotateX(v, angle) {
  return [
    v[0],
    v[1] * Math.cos(angle) - v[2] * Math.sin(angle),
    v[1] * Math.sin(angle) + v[2] * Math.cos(angle),
  ];
}

// Transform object vertices into camera space
function getTransformedVertices(obj) {
  const out = [];
  for (let i = 0; i < obj.vertices.length; i++) {
    let v = [...obj.vertices[i]];
    v[0] -= camera[0];
    v[1] -= camera[1];
    v[2] -= camera[2];
    v = rotateY(v, -cameraYaw);
    v = rotateX(v, -cameraPitch);
    out[i] = v;
  }
  return out;
}

//  Smooth movement state 
const keys = {};
document.addEventListener("keydown", (e) => {
  // normalize and store keys; also map Space via code for consistency
  const k = e.key ? e.key.toLowerCase() : "";
  keys[k] = true;
  if (e.code === "Space") keys["space"] = true;
  if (e.key === "Escape") document.exitPointerLock();
});
document.addEventListener("keyup", (e) => {
  const k = e.key ? e.key.toLowerCase() : "";
  keys[k] = false;
  if (e.code === "Space") keys["space"] = false;
});

const velocity = [0, 0, 0];
const MAX_SPEED = 4.0;
const ACCEL = 50.0;
const DAMPING = 8.0;
const GRAVITY = 20.0; // positive pulls down (y axis is flipped fix laterr)
const JUMP_SPEED = -8.0;

// Pointer lock / mouse look
if (canvasEl) {
  canvasEl.addEventListener("click", async () => {
    await canvasEl.requestPointerLock();
  });
}
document.addEventListener("pointerlockchange", () => {
  mouseLocked = document.pointerLockElement === canvasEl;
});
if (canvasEl) {
  canvasEl.addEventListener("mousemove", (event) => {
    if (!mouseLocked) return;
    const mouseSensitivity = 0.005;
    cameraYaw -= event.movementX * mouseSensitivity;
    cameraPitch -= event.movementY * mouseSensitivity;
    cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch));
  });
}



//  Main draw loop (uses timestamp for dt)

let secondsPassed;
let oldTimeStamp;
let fps;

let lastTime = performance.now();
function draw(ts) {
  requestAnimationFrame(draw);

  if (!ctx) return; // nothing to draw

  if (typeof ts === "undefined") ts = performance.now();
  const dt = Math.max(0, Math.min(0.05, (ts - lastTime) / 1000));
  lastTime = ts;

  // Movement integration (horizontal)
  const forwardInput = (keys["w"] ? 1 : 0) - (keys["s"] ? 1 : 0);
  const strafeInput = (keys["d"] ? 1 : 0) - (keys["a"] ? 1 : 0);
  const fx = Math.sin(cameraYaw),
    fz = Math.cos(cameraYaw);
  const rx = Math.sin(cameraYaw - Math.PI / 2),
    rz = Math.cos(cameraYaw - Math.PI / 2);
  const desiredVx = (-fx * forwardInput - rx * strafeInput) * MAX_SPEED;
  const desiredVz = (fz * forwardInput + rz * strafeInput) * MAX_SPEED;
  const dvx = desiredVx - velocity[0];
  const dvz = desiredVz - velocity[2];
  const maxDelta = ACCEL * dt;
  velocity[0] += Math.abs(dvx) > maxDelta ? Math.sign(dvx) * maxDelta : dvx;
  velocity[2] += Math.abs(dvz) > maxDelta ? Math.sign(dvz) * maxDelta : dvz;
  const damp = Math.exp(-DAMPING * dt);
  velocity[0] *= damp;
  velocity[2] *= damp;
  camera[0] += velocity[0] * dt;
  camera[2] += velocity[2] * dt;

  // Gravity and jumping 
  const groundY = -2; 
  const jumpPressed = keys["space"];
  const isGrounded = camera[1] === groundY;
  if (jumpPressed && isGrounded) {
    velocity[1] = JUMP_SPEED;
  }

  // apply gravity 
  velocity[1] += GRAVITY * dt;
  camera[1] += velocity[1] * dt;

  // clamp to ground and stop downward velocity
  if (camera[1] > groundY) {
    camera[1] = groundY;
    velocity[1] = 0;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear scene

  // Render all registered scene objects
  for (let s = 0; s < scene.length; s++) {
    const entry = scene[s];
    const obj = typeof entry === "function" ? entry() : entry;
    if (!isRenderable(obj)) continue;
    ctx.strokeStyle = obj.strokeStyle || "#000";
    const verts = getTransformedVertices(obj);
    for (let i = 0; i < obj.edges.length; i++) {
      const edge = obj.edges[i];
      const a = verts[edge[0]];
      const b = verts[edge[1]];
      if (!a || !b) continue;
      if (a[2] > 0.1 && b[2] > 0.1) {
        const A = transform(a);
        const B = transform(b);
        ctx.beginPath();
        ctx.moveTo(A[0] + canvasOffsetX, A[1] + canvasOffsetY);
        ctx.lineTo(B[0] + canvasOffsetX, B[1] + canvasOffsetY);
        ctx.stroke();
      }
    }
  }

  // Debug info
  
  secondsPassed = (ts - oldTimeStamp) / (60 * 16.6666666667); // set to 60 fps
  oldTimeStamp = ts;
  fps = Math.round(1 / secondsPassed);
  
  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  ctx.fillText(`X: ${camera[0].toFixed(2)}`, 10, 20);
  ctx.fillText(`Y: ${camera[1].toFixed(2)}`, 10, 40);
  ctx.fillText(`Z: ${camera[2].toFixed(2)}`, 10, 60);
  ctx.fillText(`Yaw: ${(cameraYaw * (180 / Math.PI)).toFixed(2)}`, 10, 80);
  ctx.fillText(`Pitch: ${(cameraPitch * (180 / Math.PI)).toFixed(2)}`, 10, 100);
  ctx.fillText(`FPS: ${fps}`, 10, 120);

  // Draws crosshair 
  ctx.strokeStyle = "#f00";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2);
  ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, canvas.height / 2 - 10);
  ctx.lineTo(canvas.width / 2, canvas.height / 2 + 10);
  ctx.stroke();
  
}

// start the loop
requestAnimationFrame(draw);
