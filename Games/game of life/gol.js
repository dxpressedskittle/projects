// Viewport variables
const viewPortWidth =
  window.visualViewport?.width || document.documentElement.clientWidth;
const viewPortHeight =
  window.visualViewport?.height || document.documentElement.clientHeight;
const vw = viewPortWidth / 100;
const vh = viewPortHeight / 100;

// Canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = viewPortWidth;
canvas.height = viewPortHeight;
canvas.style.width = "100vw";
canvas.style.height = "100vh";

// Grid
const cellSize = 5;
let cellGrid = new Set();

const key = (r, c) => `${r},${c}`; // format all data into a string for mapping

// Camera 
let cameraX = 0;
let cameraY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let isDragging = false;
let zoom = 1;

// FPS control
let fps = 5;
let lastTime = 0;
let fpsInterval = 1000 / fps;

// Game variables
const populateChance = 0.1; // 20% chance to populate a cell in the begining
let generation = 0;


let patterns = {}; // initalize and store RLE patterns

loadRLENonBlocking(`x = 3, y = 3, rule = B3/S23
bo$2bo$3o!`, 0, 0); // test pattern (glider)

fetch("/Games/game of life/rles/rle.json")
  .then(r => r.json()) // use .json for json file and .text for .rle files
  .then(data => {

  });





// Controls
const fpsSlider = document.getElementById("fps-slider");
const fpsValue = document.getElementById("fps-val");

const btnPlay = document.getElementById("btn-play");
const btnStep = document.getElementById("btn-step");
const btnClear = document.getElementById("btn-clear");
const btnReset = document.getElementById("btn-reset");
const btnMovement = document.getElementById("btn-movement");
const generationCounter = document.getElementById("stat-gen");
const cellsCounter = document.getElementById("stat-cells");

btnClear.addEventListener("click", () => {
  cellGrid.clear();
});

btnReset.addEventListener("click", () => {
  seedGrid(populateChance);
});

btnStep.addEventListener("click", () => {
  cellGrid = updateGrid();
  generation++;
  generationCounter.textContent = generation;
  cellsCounter.textContent = cellGrid.size;
});

btnMovement.addEventListener("click", () => {
  if (btnMovement.classList.contains("active")) {
    btnMovement.classList.remove("active");
    btnMovement.textContent = "🖌"; 

  } else {
    btnMovement.classList.add("active");
    btnMovement.textContent = "⤧";
  }
});

btnPlay.addEventListener("click", () => {
  if (fpsInterval) {
    fpsInterval = null;
    btnPlay.textContent = "▶";
  } else {
    fpsInterval = 1000 / fps;
    lastTime = performance.now();
    btnPlay.textContent = "◼";
  }
});

fpsSlider.addEventListener("input", (e) => {
  fps = e.target.value;
  fpsValue.textContent = fps;
  if (fpsInterval) {
    fpsInterval = 1000 / fps;
    lastTime = performance.now();
  }
});


function seedGrid(populateChance) {
  cellGrid.clear();
  generation = 0;
  // seed a finite region around the origin — grid itself is infinite
  const seedCols = Math.floor(viewPortWidth  / cellSize);
  const seedRows = Math.floor(viewPortHeight / cellSize);
  for (let r = 0; r < seedRows; r++) {
    for (let c = 0; c < seedCols; c++) {
      if (Math.random() < populateChance) {
        cellGrid.add(`${r},${c}`);
      }
    }
  }
}

//seedGrid(populateChance);

function drawGrid() {
  const cellPx = cellSize * zoom;
  // wrap offsets so lines tile seamlessly as camera moves
  const ox = ((cameraX % cellPx) + cellPx) % cellPx;
  const oy = ((cameraY % cellPx) + cellPx) % cellPx;

  // how many lines needed to fill the viewport at current zoom
  const numCols = Math.ceil(canvas.width  / cellPx) + 1;
  const numRows = Math.ceil(canvas.height / cellPx) + 1;

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;

  for (let col = 0; col <= numCols; col++) {
    ctx.beginPath();
    ctx.moveTo(col * cellPx + ox, 0);
    ctx.lineTo(col * cellPx + ox, canvas.height);
    ctx.stroke();
  }

  for (let row = 0; row <= numRows; row++) {
    ctx.beginPath();
    ctx.moveTo(0,            row * cellPx + oy);
    ctx.lineTo(canvas.width, row * cellPx + oy);
    ctx.stroke();
  }
}

function drawCells() {
  ctx.fillStyle = "#00ff00e3";
  const cellPx = cellSize * zoom;
  cellGrid.forEach(k => {
    const [r, c] = k.split(",").map(Number);
    ctx.fillRect(c * cellPx + cameraX, r * cellPx + cameraY, cellPx - 1, cellPx - 1);
  });
}

function getNeighborCount(r, c) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      if (cellGrid.has(`${r + i},${c + j}`)) count++; // 0(n) lookup time with .has
    }
  }
  return count;
}

function updateGrid() {
    const newCellGrid = new Set();
    const neighborCounts = new Map(); // Use Map to track neighbors
    const candidates = new Set();

    cellGrid.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nr = r + i;
                const nc = c + j;
                const neighborKey = `${nr},${nc}`;
                
                candidates.add(neighborKey);
                neighborCounts.set(neighborKey, (neighborCounts.get(neighborKey) || 0) + 1);
            }
        }
    });
    candidates.forEach(key => {
        const count = neighborCounts.get(key);
        const isAlive = cellGrid.has(key);
      
        if (isAlive) {
            if (count == 3 || count == 4) { // Survives: 2+1, 3+1
                newCellGrid.add(key);
            }
        } else {
            if (count == 3 ) { // Birthed: 3
                newCellGrid.add(key);
            }
        }
    });

    return newCellGrid;
  }



function gameLoop(currentTime) {
  requestAnimationFrame(gameLoop);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let elapsed = currentTime - lastTime;
  drawGrid(); // update grid outside of fps loop
  drawCells();

  if (fpsInterval && elapsed > fpsInterval) {
    lastTime = currentTime - (elapsed % fpsInterval);
    cellGrid = updateGrid();
    generation++;
    generationCounter.textContent = generation;
    cellsCounter.textContent = cellGrid.size;
  }
}

requestAnimationFrame(gameLoop);

function getCell(x, y) {
  const cellPx = cellSize * zoom;
  return {
    col: Math.floor((x - cameraX) / cellPx),
    row: Math.floor((y - cameraY) / cellPx),
  };
}

function placeCell(row, col) {
  if (cellGrid.has(`${row},${col}`)) {
    cellGrid.delete(`${row},${col}`);
    return;
  }else {
    cellGrid.add(`${row},${col}`); 

  }
}

window.addEventListener("click", function (event) {
  if (event.target.closest("#hud")) return; // ignore clicks on the gui
  if (!btnMovement.classList.contains("active")) {
        const { row, col } = getCell(event.clientX, event.clientY);
        placeCell(row, col)
  }; // only place cells when movement mode is off
   
});

window.addEventListener("mousedown", (e) => {
  if (e.target.closest("#hud")) return;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  isDragging = true;
});

window.addEventListener("mouseup", (e) => {
  isDragging = false;
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  if (btnMovement.classList.contains("active")) {
    cameraX += e.clientX - lastMouseX;
    cameraY += e.clientY - lastMouseY;
  } 
  else {
    if (e.clientX === lastMouseX && e.clientY === lastMouseY) return;

    const { row, col } = getCell(e.clientX, e.clientY);
    placeCell(row, col); 
  }
  
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(0.2, Math.min(5, zoom * delta));

  // anchor zoom to mouse position so it doesn't jump
  cameraX = e.clientX - (e.clientX - cameraX) * (newZoom / zoom);
  cameraY = e.clientY - (e.clientY - cameraY) * (newZoom / zoom);

  zoom = newZoom;
}, { passive: false });



function loadRLE(rle, originRow = 0, originCol = 0) {
  const newCells = [];

  const lines = rle.split("\n").filter(l => !l.startsWith("#") && !l.startsWith("x"));
  const data = lines.join("").split("!")[0];

  let row = 0, col = 0, count = "";

  for (const ch of data) {
    if (ch >= "0" && ch <= "9") {
      count += ch;
    } else {
      const n = count === "" ? 1 : parseInt(count);
      count = "";

      if (ch === "b") {
        col += n;
      } else if (ch === "o") {
        for (let i = 0; i < n; i++) {
          newCells.push(`${originRow + row},${originCol + col + i}`);
        }
        col += n;
      } else if (ch === "$") {
        row += n;
        col = 0;
      }
    }
  }
  // batch insert (faster than adding one by one during parsing)
  for (const cell of newCells) {
    cellGrid.add(cell);
  }
}


async function loadRLENonBlocking(rle, originRow = 0, originCol = 0) {
  const lines = rle.split("\n").filter(l => !l.startsWith("#") && !l.startsWith("x"));
  const data = lines.join("").split("!")[0];

  let row = 0, col = 0, count = "";
  let buffer = [];

  for (let idx = 0; idx < data.length; idx++) {
    const ch = data[idx];

    if (ch >= "0" && ch <= "9") {
      count += ch;
    } else {
      const n = count === "" ? 1 : parseInt(count);
      count = "";

      if (ch === "b") {
        col += n;
      } else if (ch === "o") {
        for (let i = 0; i < n; i++) {
          buffer.push(`${originRow + row},${originCol + col + i}`);
        }
        col += n;
      } else if (ch === "$") {
        row += n;
        col = 0;
      }
    }

    // yield every ~5000 cells
    if (buffer.length > 5000) {
      for (const c of buffer) cellGrid.add(c);
      buffer = [];
      await new Promise(r => setTimeout(r, 0)); // yield to UI
    }
  }

  for (const c of buffer) cellGrid.add(c);
}

