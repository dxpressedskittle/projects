// --- Canvas setup ---
const canvasEl = document.getElementById("gameCanvas");
const canvas = canvasEl || document.createElement("canvas");
const viewPortWidth = document.documentElement.clientWidth;
const viewPortHeight = document.documentElement.clientHeight;
const vw = viewPortWidth / 100;
const vh = viewPortHeight / 100;
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;
const ctx = canvas.getContext ? canvas.getContext("2d") : null;

const fov = Math.min(canvas.width, canvas.height) || 600;
const canvasOffsetX = canvas.width / 2;
const canvasOffsetY = canvas.height / 2;

// --- Basic scene objects ---


// color: default color for all faces
// faceColors: optional array of 6 colors (one per face)
function makeCube(center = [0, 0, 0], s = 1, color = "#000", faceColors = null, strokeStyle = "#000") {
  const [cx, cy, cz] = center;
  const verts = [
    [cx - s, cy - s, cz + s], // 0
    [cx + s, cy - s, cz + s], // 1
    [cx + s, cy + s, cz + s], // 2
    [cx - s, cy + s, cz + s], // 3
    [cx - s, cy - s, cz - s], // 4
    [cx + s, cy - s, cz - s], // 5
    [cx + s, cy + s, cz - s], // 6
    [cx - s, cy + s, cz - s], // 7
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
  // faces defined as lists of vertex indices (quad faces)
  const faces = [
    [0, 1, 2, 3], 
    [5, 4, 7, 6], 
    [4, 5, 1, 0], 
    [3, 2, 6, 7], 
    [1, 5, 6, 2], 
    [4, 0, 3, 7], 
  ];
  return {
    vertices: verts,
    edges,
    faces,
    color,
    faceColors: Array.isArray(faceColors) ? faceColors : null,
    strokeStyle: strokeStyle || "#000",
  };
}

// Floor grid generation
const gridSize = 50;
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

//  --- Scene manager ---
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

registerScene(floor);
registerScene(makeCube([0, -1, 0], 1, "red", "red", "red")); 
console.log(makeCube([0, -1, 0], 1, "red", "red", "red"));


// --- Camera & globals ---

var mouseLocked = false;
var camera = [0, -2, -5];
var cameraYaw = 0;
var cameraPitch = 0;

var totalVertices = 0;
var loadedVertices = 0;

const gameState = {
  gameplay: false,
  menu: true,
  settings: false,
  loading: false,
};

let settings = {
  gameplay: {
    playerSpeed: 10.0,
    jumpPower: 8,
    debugInfo: true,
    flying: false,
  },
  video: {},
  audio: {},
  controls: {},
};

// --- Movement variables ---

const velocity = [0, 0, 0];
var maxSpeed = settings.gameplay.playerSpeed;
const accel = 50.0;
const damping = 8.0;
const gravity = 20.0; // positive pulls down (y axis is flipped fix later)
// jumpSpeed should be derived at jump time so it follows settings changes
// (we'll use -settings.gameplay.jumpPower directly when triggering a jump)

let pointer = { x: 0, y: 0 };

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener("mousemove", onPointerMove);

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

// Project a camera-space vertex to screen-space (returns [x, y])
function projectToScreen(v) {
  const p = transform(v);
  return [p[0] + canvasOffsetX, p[1] + canvasOffsetY];
}

// Gets signed area of 2D polygon (screen-space)
function signedArea2D(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  return area / 2;
}

//  Smooth movement state
const keys = {};
document.addEventListener("keydown", (e) => {
  const k = e.key ? e.key.toLowerCase() : "";
  keys[k] = true;
  if (e.code === "Space") keys["space"] = true;
  if (e.key === "Escape") {
    if (gameState.gameplay) {
    document.exitPointerLock();
    } else if (gameState.menu) {
      gameState.gameplay = true;
      gameState.menu = false;
  }}
});
document.addEventListener("keyup", (e) => {
  const k = e.key ? e.key.toLowerCase() : "";
  keys[k] = false;
  if (e.code === "Space") keys["space"] = false;
});

// Pointer lock / mouse look
document.addEventListener("click", async () => {
  if (!mouseLocked && gameState.gameplay) {
    await canvasEl.requestPointerLock();
  }
});

document.addEventListener("pointerlockchange", () => {
  mouseLocked = document.pointerLockElement === canvasEl;
  if (!mouseLocked) {
    gameState.menu = true;
    gameState.gameplay = false;
  }
});

if (canvasEl) {
  canvasEl.addEventListener("mousemove", (event) => {
    const mouseSensitivity = 0.005;
    cameraYaw -= event.movementX * mouseSensitivity;
    cameraPitch -= event.movementY * mouseSensitivity;
    cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch));
  });
}

let secondsPassed = 0;
let oldTimeStamp;
let fps;

function drawDebugInfo(ts) {
  secondsPassed = (ts - oldTimeStamp) / 1003; // set to 60 fps
  oldTimeStamp = ts;
  fps = Math.round(1 / secondsPassed);

  // Memory performance
  const memoryUsage = performance.memory;

  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  ctx.fillText(
    `Velocity: ${velocity[0].toFixed(2)}, ${velocity[1].toFixed(
      2
    )}, ${velocity[2].toFixed(2)}`,
    10,
    20
  );
  ctx.fillText(`X: ${camera[0].toFixed(2)}`, 10, 40);
  ctx.fillText(`Y: ${camera[1].toFixed(2)}`, 10, 60);
  ctx.fillText(`Z: ${camera[2].toFixed(2)}`, 10, 80);
  ctx.fillText(`Yaw: ${(cameraYaw * (180 / Math.PI)).toFixed(2)}`, 10, 100);
  ctx.fillText(`Pitch: ${(cameraPitch * (180 / Math.PI)).toFixed(2)}`, 10, 120);
  ctx.fillText(`FPS: ${fps}`, 10, 140);
  ctx.fillText(
    `Loaded vertices: ${loadedVertices} / ${totalVertices}`,
    10,
    160
  );
  ctx.fillText(
    `JS Heap: ${
      memoryUsage
        ? (memoryUsage.usedJSHeapSize / 1048576).toFixed(2) + " MB"
        : "N/A"
    } / ${(memoryUsage.jsHeapSizeLimit / 1048576).toFixed(2) + " MB"}`,
    10,
    180
  );
}

class Button {
  constructor(x, y, width, height, label, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.label = label;
    this.color = color;
  }

  draw(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);

    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "18px Arial";
    context.fillText(
      this.label,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }

  // Method to check if a point is inside the button
  isClicked(mouseX, mouseY) {
    return (
      mouseX >= this.x &&
      mouseX <= this.x + this.width &&
      mouseY >= this.y &&
      mouseY <= this.y + this.height
    );
  }
}

// Simple canvas slider UI
class Slider {
  constructor(x, y, width, min, max, step, value, label) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 28;
    this.min = min;
    this.max = max;
    this.step = step;
    this.value = value;
    this.label = label;
    this.dragging = false;
  }

  draw(ctx) {
    // label
    ctx.fillStyle = "#000";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${this.label}: ${this.value.toFixed(2)}`, this.x, this.y - 8);

    // track
    ctx.fillStyle = "#ccc";
    ctx.fillRect(this.x, this.y, this.width, this.height / 3);

    // knob
    const t = (this.value - this.min) / (this.max - this.min);
    const knobX = this.x + t * this.width;
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.arc(knobX, this.y + this.height / 6, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  contains(mx, my) {
    const t = (this.value - this.min) / (this.max - this.min);
    const knobX = this.x + t * this.width;
    const dx = mx - knobX;
    const dy = my - (this.y + this.height / 6);
    return dx * dx + dy * dy <= 12 * 12;
  }

  setFromX(mx) {
    const t = (mx - this.x) / this.width;
    const clamped = Math.max(0, Math.min(1, t));
    const stepped = Math.round((this.min + clamped * (this.max - this.min)) / this.step) * this.step;
    this.value = Math.max(this.min, Math.min(this.max, stepped));
  }
}

let menuButtons = [];
let settingsButtons = [];
// sliders for settings UI
let sliders = [];

// mouse state for sliders
let mouseDown = false;
// current settings page/tab
let settingsPage = "gameplay";

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (gameState.menu) {
    for (const b of menuButtons) {
      if (b && b.isClicked(mouseX, mouseY) && typeof b.onClick === "function") {
        b.onClick();
        break; 
      }
    }
  } else if (gameState.settings) {
    for (const b of settingsButtons) {
      if (b && b.isClicked(mouseX, mouseY) && typeof b.onClick === "function") {
        b.onClick();
        break;
      }
    }
    // slider clicks
    for (const s of sliders) {
      if (s && s.contains(mouseX, mouseY)) {
        s.dragging = true;
        mouseDown = true;
        s.setFromX(mouseX);
        // apply to settings immediately
        if (s.label === "Player Speed") settings.gameplay.playerSpeed = s.value;
        if (s.label === "Jump Power") settings.gameplay.jumpPower = s.value;
        if (s.label === "Master Volume") settings.audio.masterVolume = s.value;
        break;
      }
    }
  }
});

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  for (const s of sliders) {
    if (s && s.contains(mx, my)) {
      s.dragging = true;
      mouseDown = true;
      s.setFromX(mx);
      if (s.label === "Player Speed") settings.gameplay.playerSpeed = s.value;
      if (s.label === "Jump Power") settings.gameplay.jumpPower = s.value;
      break;
    }
  }
});

window.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  for (const s of sliders) {
    if (s && s.dragging) {
      s.setFromX(mx);
      if (s.label === "Player Speed") settings.gameplay.playerSpeed = s.value;
      if (s.label === "Jump Power") settings.gameplay.jumpPower = s.value;
    }
  }
});

window.addEventListener("mouseup", () => {
  mouseDown = false;
  for (const s of sliders) if (s) s.dragging = false;
});

function drawMenu() {
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";
  ctx.font = "100px Arial";
  ctx.textAlign = "center";
  ctx.fillText("3D Game engine", canvas.width / 2, canvas.height / 2 - 300);
  const startButton = new Button(
    canvas.width / 2 - 100,
    canvas.height / 2 - 200,
    200,
    50,
    "Start Render",
    "white"
  );
  const settingsButton = new Button(
    canvas.width / 2 - 100,
    canvas.height / 2 - 130,
    200,
    50,
    "Settings",
    "white"
  );
  const exitButton = new Button(
    canvas.width / 2 - 100,
    canvas.height / 2 - 60,
    200,
    50,
    "Github",
    "white"
  );

  startButton.draw(ctx);
  settingsButton.draw(ctx);
  exitButton.draw(ctx);

  menuButtons = [startButton, settingsButton, exitButton];
  startButton.onClick = () => {
    gameState.menu = false;
    gameState.gameplay = true;
    document.requestPointerLock();
    cameraYaw = 0;
    cameraPitch = 0;
  };
  settingsButton.onClick = () => {
    gameState.menu = false;
    gameState.settings = true;
    settingsPage = "gameplay";
  };
  exitButton.onClick = () => {
    window.open("https://github.com/dxpressedskittle", "_blank");
  };
}

function drawSettings() {
  // background
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // title
  ctx.fillStyle = "#fff";
  ctx.font = "64px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Settings", canvas.width / 2, 100);

  // top tab buttons
  const tabLabels = ["Gameplay", "Video", "Audio", "Controls"];
  const tabWidth = 160;
  const tabStartX = canvas.width / 2 - (tabLabels.length * tabWidth) / 2;
  const tabY = 140;
  const tabButtons = [];
  for (let i = 0; i < tabLabels.length; i++) {
    const x = tabStartX + i * tabWidth;
    const b = new Button(x, tabY, tabWidth - 10, 36, tabLabels[i], settingsPage.toLowerCase() === tabLabels[i].toLowerCase() ? "#666" : "#ddd");
    b.onClick = () => {
      settingsPage = tabLabels[i].toLowerCase();
      sliders = [];
    };
    tabButtons.push(b);
    b.draw(ctx);
  }

  if (settingsPage === "gameplay") {
    if (sliders.length === 0) {
      const sliderWidth = Math.min(600, canvas.width * 0.6);
      const cx = canvas.width / 2 - sliderWidth / 2;

      sliders.push(new Slider(cx, 260, sliderWidth, 2, 30, 0.5, settings.gameplay.playerSpeed, "Player Speed"));
      sliders.push(new Slider(cx, 340, sliderWidth, 2, 20, 0.5, settings.gameplay.jumpPower, "Jump Power"));
    }
      
    for (const s of sliders) s.draw(ctx);
  } else if (settingsPage === "audio") {
    ctx.fillText("Audio settings soon", canvas.width / 2, canvas.height / 2);

  } else if (settingsPage === "video") {
    ctx.fillText("Video settings soon", canvas.width / 2, canvas.height / 2);
  } else if (settingsPage === "controls") {
    ctx.fillText("Controls settings soon", canvas.width / 2, canvas.height / 2);
  }

  // buttons
  const backButton = new Button(canvas.width / 2 - 100, canvas.height - 120, 200, 50, "Back", "#fff");
  const resetButton = new Button(canvas.width / 2 - 330, canvas.height - 120, 140, 50, "Reset", "#fff");
  const toggleDebug = new Button(canvas.width / 2 + 190, canvas.height - 120, 140, 50, `Debug: ${settings.gameplay.debugInfo ? "On" : "Off"}`, "#fff");
  const flyToggle = new Button(canvas.width / 2 - 20*vw, 420, 200, 50, `Flying: ${settings.gameplay.flying ? "Enabled" : "Disabled"}`, "#fff");

  flyToggle.draw(ctx)
  backButton.draw(ctx);
  resetButton.draw(ctx);
  toggleDebug.draw(ctx);

  settingsButtons = [backButton, resetButton, toggleDebug, flyToggle, ...tabButtons];

  backButton.onClick = () => {
    gameState.settings = false;
    gameState.menu = true;
  };
  resetButton.onClick = () => {
    settings.gameplay.playerSpeed = 10.0;
    settings.gameplay.jumpPower = 8;
    // update sliders to reflect reset
    for (const s of sliders) {
      if (s.label === "Player Speed") s.value = settings.gameplay.playerSpeed;
      if (s.label === "Jump Power") s.value = settings.gameplay.jumpPower;
    }
  };
  toggleDebug.onClick = () => {
    settings.gameplay.debugInfo = !settings.gameplay.debugInfo;
  };
  flyToggle.onClick = () => {
    settings.gameplay.flying = !settings.gameplay.flying;
    camera[1] = -2;
  }
}

//  --- Main draw loop ---
//     (Uses ts for dt)

let lastTime = performance.now();
function draw(ts) {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  if (gameState.menu) {
    drawMenu();

    requestAnimationFrame(draw);
  } else if (gameState.settings) {
    drawSettings();

    requestAnimationFrame(draw);
  } else if (gameState.gameplay) {
    // gameplay rendering

    if (!ctx || !scene) return; // nothing to draw

    if (typeof ts === "undefined") ts = performance.now();
    const dt = Math.max(0, Math.min(0.05, (ts - lastTime) / 1000));
    lastTime = ts;

    // Movement integration

    if (!settings.gameplay.flying) {
      // walking / grounded movement
      const forwardInput = (keys["w"] ? 1 : 0) - (keys["s"] ? 1 : 0);
      const strafeInput = (keys["d"] ? 1 : 0) - (keys["a"] ? 1 : 0);
      const fx = Math.sin(cameraYaw),
        fz = Math.cos(cameraYaw);
      const rx = Math.sin(cameraYaw - Math.PI / 2),
        rz = Math.cos(cameraYaw - Math.PI / 2);
      const desiredVx = (-fx * forwardInput - rx * strafeInput) * maxSpeed;
      const desiredVz = (fz * forwardInput + rz * strafeInput) * maxSpeed;
      const dvx = desiredVx - velocity[0];
      const dvz = desiredVz - velocity[2];
      const maxDelta = accel * dt;
      velocity[0] += Math.abs(dvx) > maxDelta ? Math.sign(dvx) * maxDelta : dvx;
      velocity[2] += Math.abs(dvz) > maxDelta ? Math.sign(dvz) * maxDelta : dvz;
      const damp = Math.exp(-damping * dt);
      velocity[0] *= damp;
      velocity[2] *= damp;
      camera[0] += velocity[0] * dt;
      camera[2] += velocity[2] * dt;

      // Jumping
      const groundY = -2;
      const jumpPressed = keys["space"];
      const isGrounded = camera[1] >= groundY - 0.001;
      if (jumpPressed && isGrounded) {
        velocity[1] = -settings.gameplay.jumpPower;
      }

      // apply gravity
      velocity[1] += gravity * dt;
      camera[1] += velocity[1] * dt;

      // Make sure 0 <= Yaw <= 360
      if (cameraYaw * (180 / Math.PI) > 360) {
        cameraYaw = 0;
      } else if (cameraYaw * (180 / Math.PI) < 0) {
        cameraYaw = 360 / (180 / Math.PI);
      }



      // clamp to ground and stop downward velocity
      if (camera[1] > groundY) {
        camera[1] = groundY;
        velocity[1] = 0;
      }
    } else {

      maxSpeed = settings.gameplay.playerSpeed * 2;

      const forwardInput = (keys["w"] ? 1 : 0) - (keys["s"] ? 1 : 0);
      const strafeInput = (keys["d"] ? 1 : 0) - (keys["a"] ? 1 : 0);
      const fx = Math.sin(cameraYaw),
        fz = Math.cos(cameraYaw);
      const rx = Math.sin(cameraYaw - Math.PI / 2),
        rz = Math.cos(cameraYaw - Math.PI / 2);
      const desiredVx = (-fx * forwardInput - rx * strafeInput) * maxSpeed;
      const desiredVz = (fz * forwardInput + rz * strafeInput) * maxSpeed;
      const dvx = desiredVx - velocity[0];
      const dvz = desiredVz - velocity[2];
      const maxDelta = accel * dt;
      velocity[0] += Math.abs(dvx) > maxDelta ? Math.sign(dvx) * maxDelta : dvx;
      velocity[2] += Math.abs(dvz) > maxDelta ? Math.sign(dvz) * maxDelta : dvz;
      const damp = Math.exp(-damping * dt);
      velocity[0] *= damp;
      velocity[2] *= damp;
      camera[0] += velocity[0] * dt;
      camera[2] += velocity[2] * dt;

      const ascend = keys["space"];
      const descend = keys["shift"] || keys["shiftleft"] || keys["shiftright"];

      const flyAccel = 30.0;
      const flyDamping = 6.0;

      let dvY = 0;
      if (ascend) dvY -= flyAccel * dt;
      if (descend) dvY += flyAccel * dt;

      // apply to velocity
      velocity[1] += dvY;

      // apply vertical damping
      velocity[1] *= Math.exp(-flyDamping * dt);

      // update camera position
      camera[1] += velocity[1] * dt;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear scene

    for (const entry of scene) {
      if (totalVertices === 0) {
        const obj = typeof entry === "function" ? entry() : entry;
        if (isRenderable(obj)) {
          totalVertices += obj.vertices.length;
        }
      }
    }

    // Render all registered scene objects
    for (let s = 0; s < scene.length; s++) {
      const entry = scene[s];
      const obj = typeof entry === "function" ? entry() : entry;
      if (!isRenderable(obj)) continue;
      ctx.strokeStyle = obj.strokeStyle || "#000";
      const verts = getTransformedVertices(obj);

      // If object has faces, draw filled faces first
      if (Array.isArray(obj.faces)) {
        for (let fi = 0; fi < obj.faces.length; fi++) {
          const face = obj.faces[fi];
          // compute camera-space average z for culling
          let avgZ = 0;
          const camPoints = [];
          for (let k = 0; k < face.length; k++) {
            const v = verts[face[k]];
            if (!v) continue;
            avgZ += v[2];
            camPoints.push(v);
          }
          avgZ /= face.length;
          if (avgZ <= 0.1) continue; // behind camera or too close

          // project to screen
          const screenPts = camPoints.map(projectToScreen);

          // simple backface culling using signed area
          const area = signedArea2D(screenPts);
          if (area <= 0) continue; // backface

          // choose color: per-face overrides object color
          const fillColor = (obj.faceColors && obj.faceColors[fi]) || obj.color || obj.strokeStyle || "#000";

          // draw filled polygon
          ctx.beginPath();
          ctx.moveTo(screenPts[0][0], screenPts[0][1]);
          for (let p = 1; p < screenPts.length; p++) ctx.lineTo(screenPts[p][0], screenPts[p][1]);
          ctx.closePath();
          ctx.fillStyle = fillColor;
          ctx.fill();
          ctx.strokeStyle = obj.strokeStyle || "#000";
          ctx.stroke();
        }
      }

      const isVisible = new Array(verts.length).fill(false); // Checks if vertice is in front of camera
      for (let i = 0; i < verts.length; i++) {
        const v = verts[i];
        if (v[2] > 0.1) {
          const A = transform(v);
          const xOnScreen = A[0] + canvasOffsetX;
          const yOnScreen = A[1] + canvasOffsetY;

          if (
            xOnScreen >= 0 &&
            xOnScreen < canvas.width &&
            yOnScreen >= 0 &&
            yOnScreen < canvas.height
          ) {
            isVisible[i] = true;
            loadedVertices++;
          }
        }
      }

      for (let i = 0; i < obj.edges.length; i++) {
        const edge = obj.edges[i];
        const a = verts[edge[0]];
        const b = verts[edge[1]];
        if (isVisible[edge[0]] || isVisible[edge[1]]) {
          if (!a || !b) continue;
          if (a[2] > 0.1 && b[2] > 0.1) {
            const A = transform(a);
            const B = transform(b);
            ctx.strokeStyle = obj.strokeStyle || "#000";
            ctx.beginPath();
            ctx.moveTo(A[0] + canvasOffsetX, A[1] + canvasOffsetY);
            ctx.lineTo(B[0] + canvasOffsetX, B[1] + canvasOffsetY);
            ctx.stroke();
          }
        }
      }
    }
    if (settings.gameplay.debugInfo) {
      drawDebugInfo(ts);
    }

    // Draws crosshair
    ctx.strokeStyle = "#f00";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, canvas.height / 2 - 10);
    ctx.lineTo(canvas.width / 2, canvas.height / 2 + 10);
    ctx.stroke();

    loadedVertices = 0; // clear loaded vertices each frame

    requestAnimationFrame(draw);
  }
}

requestAnimationFrame(draw);
