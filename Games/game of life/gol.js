

// Viewport variables
const viewPortWidth = window.visualViewport?.width || document.documentElement.clientWidth;
const viewPortHeight = window.visualViewport?.height || document.documentElement.clientHeight;
const vw = viewPortWidth / 100;
const vh = viewPortHeight / 100;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = viewPortWidth;
canvas.height = viewPortHeight;
canvas.style.width = '100vw';
canvas.style.height = '100vh';

const cellSize = 20;
const rows = Math.floor(canvas.height / cellSize);
const cols = Math.floor(canvas.width / cellSize);
let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
let bufferGrid = Array.from({length: rows}, () => Array(cols).fill(0))
const cellGrid = new Set()

const key = (r,c) => `${r},${c}` // format all data into a string for mapping

let cameraX = 0
let cameraY = 0
let lastMouseX = 0 
let lastMouseY = 0
let offsetX, offsetY
let isDragging = false

let fps = 5
let lastTime = 0
let fpsInterval = 1000 / fps

const populateChance = 0.2; // 20% chance to populate a cell in the begining

function seedGrid(populateChance) {

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < populateChance) {
        cellGrid.add(key(r,c))
      }
    }
  }

  for (const value of cellGrid) {
    cellX = value[0]
    cellY = value[1]
    console.log(cellX,cellY)
  }

}

function drawGrid() {
  ctx.strokeStyle = '#cccccce3';
  ctx.lineWidth = 1;

  const offsetX = cameraX % cellSize
  const offsetY = cameraY % cellSize


  for (let col = 0; col <= cols; col++) {
    ctx.beginPath();
    ctx.moveTo(col * cellSize + offsetX, 0); 
    ctx.lineTo(col * cellSize + offsetX, canvas.height);
    ctx.stroke();
}

for (let row = 0; row <= rows; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * cellSize + offsetY);
    ctx.lineTo(canvas.width, row * cellSize + offsetY);
    ctx.stroke();
}
}

function drawCells() {
  ctx.fillStyle = '#00ff00e3';

   
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        ctx.fillRect((c* cellSize) + cameraX, (r * cellSize) + cameraY, cellSize, cellSize);
      }
    }
  }
  ctx.fillStyle = "black"
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
    ctx.strokeStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let elapsed = currentTime - lastTime;
    drawGrid(); // update grid outside of fps loop
    drawCells()


    if (elapsed > fpsInterval) {
      lastTime = currentTime - (elapsed % fpsInterval);
      grid = updateGrid(grid)
    }


}

function getCell(x,y) {
  gridX = x - cameraX
  gridY = y - cameraY 

  return {
        col: Math.floor(gridX / cellSize),
        row: Math.floor(gridY / cellSize)
    };
}



function placeCell(row,col) {
  grid[row][col] = 1
}

window.addEventListener('click', function(event) {
    const { row, col } = getCell(event.clientX, event.clientY);
    console.log(`Cell placed: ${row}, ${col}`)  
    placeCell(row,col)
})

window.addEventListener('mousedown', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    isDragging = true;
});

window.addEventListener('mouseup', (e) => { isDragging = false })

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        distDraggedX = e.clientX - lastMouseX;
        distDraggedY = e.clientY - lastMouseY;

        cameraX += distDraggedX
        cameraY += distDraggedY 

        lastMouseX = e.clientX
        lastMouseY = e.clientY

      
    }
});


  requestAnimationFrame(gameLoop)

