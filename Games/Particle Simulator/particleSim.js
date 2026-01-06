import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm";

// Viewport variables
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
const vh = viewportHeight / 100;
const vw = viewportWidth / 100;

// Canvas variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = viewportWidth;
canvas.height = viewportHeight;

// Game variables
let cellSize = 5;
let cols = Math.floor(canvas.width / cellSize);
let rows = Math.floor(canvas.height / cellSize);
const flowRate = 1; // how far fluids can flow sideways per update

let particleCount = 0;

// Brush variables
let brushSizeInCells = 5; // radius

// Mouse variables
let isMouseDown = false;
let mouseX = 0;
let mouseY = 0;

// Image buffer
let imageData = ctx.createImageData(canvas.width, canvas.height);
let pixelBuffer = new Uint32Array(imageData.data.buffer);

const settings = {
  brushRandomness: 0.8, // 0 to 1
  brushSize: 10,
  brushMode: "create", // create, erase
  material: "sand", // sand, water, stone
  simulationSpeed: 3, // how many times particles are updated per frame
  cellSize: 5,

  clearGrid: () => {
    grid = Array.from({ length: cols }, () => Array(rows).fill(null));
  },
};

// Fill an 2d array of nulls
let grid = Array.from({ length: cols }, () => Array(rows).fill(null));

class Particle {
  constructor(type) {
    this.type = type;
    this.hasUpdated = false;
    this.isFluid = type === "water";
    this.isMoveable = type !== "stone";

    const densities = {
      sand: 2,
      water: 1,
      stone: 3,
      air: 0,
    };
    this.density = densities[type] || 0;

    this.color = this.initColor();
  }


initColor() { // convert HSL to ARGB
    switch (this.type) {
      case "sand":
        return hslToAbgr(
          50 + Math.random() * 15, // hue
          50 + Math.random() * 15, // saturation
          55 + Math.random() * 25 // brightness
        );

      case "water":
        return hslToAbgr(210, 80, 40 + Math.random() * 10);

      case "stone":
        return hslToAbgr(0, 0, 30 + Math.random() * 20);

      default:
        return 0xFFFFFFFF; // white for air
    }   
  }
}

function addParticle(x, y, type) {
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  if (col >= 0 && col < cols && row >= 0 && row < rows)
    if (!grid[col][row] || grid[col][row].type == "water") { // particles can replace water, fix later to move water instead
      grid[col][row] = new Particle(type);
    }
}

function getNeighbor(col, row, offsetCol, offsetRow) {
  const newCol = col + offsetCol;
  const newRow = row + offsetRow;

  // collision with boundary
  if (newCol < 0 || newCol >= cols || newRow < 0 || newRow >= rows) {
    return "boundary";
  }
  return grid[newCol][newRow];
}

let frameCount = 0;

function updateParticles() {
  frameCount++; 

  // loop from bottom to top so falling particles dont teleport down
  for (let r = rows - 1; r >= 0; r--) {
    
    // toggle horizontal direction every frame to prevent physics bias
    const leftToRight = frameCount % 2 === 0;
    
    for (let i = 0; i < cols; i++) {
      const c = leftToRight ? i : cols - 1 - i;

      let p = grid[c][r];
      
      // Skip if empty, already updated this frame, or static (stone)
      if (!p || p.lastUpdatedFrame === frameCount || !p.isMoveable) continue;

      let moved = false;
      let targetCol = c;
      let targetRow = r;


      //  Check Straight Down
      const bRow = r + 1;
      if (bRow < rows) {
        let below = grid[c][bRow];
        // Can move if air (null) or if we are heavier than whats below
        if (below === null || (p.density > below.density && below.isMoveable)) {
          targetRow = bRow;
          moved = true;
        }
      }

      // Check Diagonals (Sand Behavior)
      if (!moved && r + 1 < rows) {
        let dir = Math.random() < 0.5 ? 1 : -1;
        let diagCol1 = c + dir;
        let diagCol2 = c - dir;

        // Try first diagonal
        if (diagCol1 >= 0 && diagCol1 < cols) {
          let side1 = grid[diagCol1][r + 1];
          if (side1 === null || (p.density > side1.density && side1.isMoveable)) {
            targetCol = diagCol1;
            targetRow = r + 1;
            moved = true;
          }
        }
        // Try second diagonal
        if (!moved && diagCol2 >= 0 && diagCol2 < cols) {
          let side2 = grid[diagCol2][r + 1];
          if (side2 === null || (p.density > side2.density && side2.isMoveable)) {
            targetCol = diagCol2;
            targetRow = r + 1;
            moved = true;
          }
        }
      }

      // check Sideways (Fluid Behavior)
      if (!moved && p.isFluid) {
        let dir = Math.random() < 0.5 ? 1 : -1;
        // Check side 1
        let sideCol1 = c + dir;
        if (sideCol1 >= 0 && sideCol1 < cols) {
          let side1 = grid[sideCol1][r];
          if (side1 === null || (p.density > side1.density && side1.isMoveable)) {
            targetCol = sideCol1;
            moved = true;
          }
        }
        // Check side 2
        if (!moved) {
          let sideCol2 = c - dir;
          if (sideCol2 >= 0 && sideCol2 < cols) {
            let side2 = grid[sideCol2][r];
            if (side2 === null || (p.density > side2.density && side2.isMoveable)) {
              targetCol = sideCol2;
              moved = true;
            }
          }
        }
      }

      if (moved) {
        let targetParticle = grid[targetCol][targetRow];

        // swap them in the grid
        grid[targetCol][targetRow] = p;
        grid[c][r] = targetParticle;

        // mark as updated using frameCount so they dont move again this frame
        p.lastUpdatedFrame = frameCount;
        if (targetParticle) targetParticle.lastUpdatedFrame = frameCount;
      }
    }
  }
}

function updateParticleSize(newSize) {
  cellSize = newSize;
  cols = Math.floor(canvas.width / cellSize);
  rows = Math.floor(canvas.height / cellSize);
  grid = Array.from({ length: cols }, () => Array(rows).fill(null));
  settings.clearGrid()
}

function drawParticles() {
  // clear frame
  pixelBuffer.fill(0); 

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let p = grid[c][r];
      if (p) {
        // Calculate where this particle starts on the actual canvas
        const startX = c * cellSize;
        const startY = r * cellSize;
        const color = p.color; // ABGR number

        // fill the square for this cell
        for (let dy = 0; dy < cellSize; dy++) {
          for (let dx = 0; dx < cellSize; dx++) {
            const pixelIndex = (startY + dy) * canvas.width + (startX + dx);
            
            // bounds check to prevent errors at the very edge of the screen
            if (pixelIndex < pixelBuffer.length) {
              pixelBuffer[pixelIndex] = color;
            }
          }
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

canvas.addEventListener("mousedown", () => (isMouseDown = true));
canvas.addEventListener("mouseup", () => (isMouseDown = false));

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "e") {
    settings.brushMode = "erase";
  } else if (e.key === "c") {
    settings.brushMode = "create";
  }
});

function updateParticleCount() {
  let count = 0;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (grid[c][r]) {
        count++;
      }
    }
  }
  particleCount = count;
}

const gui = new GUI();
const brushFolder = gui.addFolder("Brush Settings");

gui.title("Particle Simulator Controls");
brushFolder
  .add(settings, "brushSize", 1, 20, 1)
  .name("Brush Size (cells)")
  .onChange((v) => (brushSizeInCells = v));
brushFolder
  .add(settings, "brushMode", ["create", "erase"])
  .name("Brush Mode")
  .onChange((v) => (settings.brushMode = v));
brushFolder
  .add(settings, "brushRandomness", 0.01, 1, 0.01)
  .name("Brush Randomness")
  .onChange((v) => (settings.brushRandomness = v));
gui
  .add(settings, "material", ["sand", "water", "stone"])
  .onChange((v) => ((settings.material = v), console.log("Material:", v)));

gui
  .add(settings, "simulationSpeed", 1, 50, 1)
  .name("Simulation Speed")
  .onChange((v) => (settings.simulationSpeed = v));
gui
  .add(settings, "cellSize", 1, 20, 1)
  .name("Cell Size")
  .onChange((v) => (updateParticleSize(v)));

gui.add(settings, "clearGrid");

function drawDebugInfo() {
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText(`Particles: ${particleCount} / ${cols * rows}`, 1*vw, 3*vh);
}

function gameLoop() {
  if (isMouseDown) {
    switch (settings.brushMode) {
      case "erase":
        deleteParticles(mouseX, mouseY);
        break;
      case "create":
        fillParticles(mouseX, mouseY);
    }
  }

  for (let i = 0; i < settings.simulationSpeed; i++) {
    updateParticles(); // update multiple times per frame
  } 
  updateParticleCount();
  drawParticles();
  drawDebugInfo();
  drawBrush(mouseX, mouseY);
  requestAnimationFrame(gameLoop);
}

function fillParticles(x, y) {
  for (let dx = -brushSizeInCells; dx <= brushSizeInCells; dx++) {
    for (let dy = -brushSizeInCells; dy <= brushSizeInCells; dy++) {

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= brushSizeInCells && Math.random() > settings.brushRandomness) { // add randomness to filling
        addParticle(x + dx * cellSize, y + dy * cellSize, settings.material);
      }
    }
  }
}
  


function deleteParticles(x, y) {
  for (let dx = -brushSizeInCells; dx <= brushSizeInCells; dx++) {
    for (let dy = -brushSizeInCells; dy <= brushSizeInCells; dy++) {

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= brushSizeInCells) {

        const col = Math.floor((x + dx * cellSize) / cellSize);
        const row = Math.floor((y + dy * cellSize) / cellSize);

        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          grid[col][row] = null;
        }
      }
    }
  }
}

function drawBrush(x, y) {
  ctx.beginPath();
  // Multiply by cellSize to get actual pixel radius
  const radius = brushSizeInCells * cellSize; 
  
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(114, 108, 108, 0.5)"; 
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = "rgba(221, 13, 13, 0.1)";
  ctx.fill();
  ctx.closePath();

}



// Start the game loop
gameLoop();


// use unit32Array to represent grid instead of objects 



function hslToAbgr(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));

  // Pack into 0xAABBGGRR 
  // 255 << 24 is the Alpha channel (fully opaque)
  return (255 << 24) | (b << 16) | (g << 8) | r;
}
