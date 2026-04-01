
// Viewport variables
const viewPortWidth = window.visualViewport?.width || document.documentElement.clientWidth;
const viewPortHeight = window.visualViewport?.height || document.documentElement.clientHeight;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = viewPortWidth;
canvas.height = viewPortHeight;
canvas.style.width = '100vw';
canvas.style.height = '100vh';

const cellSize = 8;
const rows = Math.floor(canvas.height / cellSize);
const cols = Math.floor(canvas.width / cellSize);
let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
let bufferGrid = Array.from({length: rows}, () => Array(cols).fill(0))

let fps = 5
let lastTime = 0
let fpsInterval = 1000 / fps

const populateChance = 0.2; // 20% chance to populate a cell in the begining

function seedGrid(populateChance) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c] = Math.random() < populateChance ? 1 : 0;
    }
  }
}

function drawGrid() {

  for (let col = 0; col <= cols; col++) {
    ctx.beginPath();
    ctx.moveTo(col * cellSize, 0);
    ctx.lineTo(col * cellSize, canvas.height);
    ctx.stroke();
  }
  for (let row = 0; row <= rows; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * cellSize);
    ctx.lineTo(canvas.width, row * cellSize);
    ctx.stroke();
  }
}

function drawCells() {
  ctx.fillStyle = 'black';
  ctx.beginPath();

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        ctx.rect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }

  ctx.fill();
}

function getNeighborCount(grid, row, col) {
  let neighbors = 0

  for (let i=-1; i<=1; i++) {
    for (let j = -1; j<=1; j++) {
      if (i=== 0 && j === 0) continue

      let r = row + i
      let c = col + j 

       if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
        if (grid[r][c]) {
           neighbors++;
        }
         
        }
      }
    }
  return neighbors;
}
    

function updateGrid(grid) {
  let bufferGrid = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(0));

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const neighbors = getNeighborCount(grid, r, c)
      let currentState = grid[r][c]

        if (currentState === 1) {
           // cells died if not occupied by 3 neighbors
            if (neighbors < 2 || neighbors > 3) {
                bufferGrid[r][c] = 0; // Die
              } else {
                // cell survives
                bufferGrid[r][c] = 1;
              }
          } else {
              // dead cell with 3 neighbors is born
              if (neighbors === 3) {
                  bufferGrid[r][c] = 1;
              }
            }
        }
    }
  return bufferGrid
}


seedGrid(populateChance);


function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    let elapsed = currentTime - lastTime;

    if (elapsed > fpsInterval) {
      lastTime = currentTime - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#ccc';
      drawCells();
      drawGrid()
      grid = updateGrid(grid)
    }
    
   

}

  requestAnimationFrame(gameLoop)

