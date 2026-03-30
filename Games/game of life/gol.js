// Viewport variables
const viewPortWidth = document.documentElement.clientWidth;
const viewPortHeight = document.documentElement.clientHeight;
const vh = viewPortHeight / 100;
const vw = viewPortWidth / 100;

// Canvas variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;
const width = canvas.width
const height = canvas.height

console.log(canvas.height,canvas.width)
// Game variables
const cellSize = 8
const rows = Math.round(canvas.height / cellSize)
const cols = Math.round(canvas.width / cellSize);

let grid = Array.from({ length: rows }, () => Array(cols).fill(0));

const populateChance = 0.2 // 20% chance of cell population at the start




function seedGrid(populateChance) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 20% chance of being alive
      grid[r][c] = Math.random() < populateChance ? 1 : 0;
    }
  }
}

function drawGrid() {
    

  for (let x = 0; x <= width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y <= height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawCells() {
  ctx.fillStyle = 'black';
  ctx.beginPath(); 

  
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (grid[x][y]) {
        ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  ctx.fill(); 
}


seedGrid(populateChance);
drawGrid()
drawCells()

