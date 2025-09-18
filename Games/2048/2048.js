// Viewport variables
const viewPortWidth = document.documentElement.clientWidth;
const viewPortHeight = document.documentElement.clientHeight;
const vh = viewPortHeight / 100;
const vw = viewPortWidth / 100;

// Canvas variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;

// Animation variables
let animationID;

// Game Variables
let board = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

let blocks = [
  { value: 2, x: 0, y: 0 },
  { value: 2, x: 1, y: 0 },
];
let playerScore = 0;
let playerMoves = 0;

function drawGame() {
  //Draws board
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gridSize = 4;
  const boxSize = 10 * vw;
  const gap = 1 * vw;
  const gridWidth = gridSize * boxSize + (gridSize - 1) * gap;
  const gridHeight = gridSize * boxSize + (gridSize - 1) * gap;
  const startX = (viewPortWidth - gridWidth) / 2;
  const startY = (viewPortHeight - gridHeight) / 2;

  ctx.fillStyle = "#bbada0";
  ctx.fillRect(
    startX - gap / 2,
    startY - gap / 2,
    gridWidth + gap,
    gridHeight + gap
  );

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = startX + col * (boxSize + gap);
      const y = startY + row * (boxSize + gap);
      ctx.fillStyle = "#cdc1b4";
      ctx.fillRect(x, y, boxSize, boxSize);
    }
  }

  // Draws score
  ctx.font = "50px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(`Score: ${playerScore}`, 10 * vw, 40 * vh);
  // Draws moves
  ctx.fillText(`Moves: ${playerMoves}`, 10 * vw, 60 * vh);

  // Draws blocks
  for (i = 0; i < blocks.length; i++) {
    const x = blocks[i].x;
    const y = blocks[i].y;
    ctx.fillStyle = "orange";
    ctx.fillRect(
      startX + x * (10 * vw + 1 * vw),
      startY + y * (10 * vw + 1 * vw),
      10 * vw,
      10 * vw
    );

    const tileSize = 10 * vw;
    const tileGap = 1 * vw;
    // Draws text on block
    ctx.fillStyle = "#776e65"; // Text color
    ctx.font = `${5 * vw}px Arial`; // Adjust font size based on vw
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      blocks[i].value,
      startX + x * (tileSize + tileGap) + tileSize / 2,
      startY + y * (tileSize + tileGap) + tileSize / 2
    );
  }
}

function generateBlock() {
  let odds = Math.floor(Math.random() * 10) + 1;
  let blockX = Math.floor(Math.random() * 3) + 0;
  let blockY = Math.floor(Math.random() * 3) + 0;
  let block4 = { value: 4, x: blockX, y: blockY };
  let block2 = { value: 2, x: blockX, y: blockY };

  // checks if occupied
  for (i = 0; i < blocks.length; i++) {
    if (blocks[i].x == blockX && blocks[i].y == blockY) {
      generateBlock();
    }
  }

  // 90% chance for 2 block 10% chance for 4
  if (odds == 1) {
    blocks.push(block4);
  } else if (odds > 1) {
    blocks.push(block2);
  }

  for (i = 0; i < blocks.length; i++) {
    const x = blocks[i].x;
    const y = blocks[i].y;
    const value = blocks[i].value;
    board[y][x] = value;
  }
}

function compress(board, dir) {
  if (dir === "left" || dir === "right") {
    for (let y = 0; y < 4; y++) {
      let rowBlocks = blocks
        .filter((b) => b.y === y)
        .sort((a, b) => (dir === "left" ? a.x - b.x : b.x - a.x));

      let newX = dir === "left" ? 0 : 3;
      for (let b of rowBlocks) {
        board[b.y][b.x] = 0;
        b.x = newX;
        board[b.y][b.x] = b.value;
        newX += dir === "left" ? 1 : -1;
      }
    }
  }

  if (dir === "up" || dir === "down") {
    for (let x = 0; x < 4; x++) {
      let colBlocks = blocks
        .filter((b) => b.x === x)
        .sort((a, b) => (dir === "up" ? a.y - b.y : b.y - a.y));

      let newY = dir === "up" ? 0 : 3;
      for (let b of colBlocks) {
        board[b.y][b.x] = 0;
        b.y = newY;
        board[b.y][b.x] = b.value;
        newY += dir === "up" ? 1 : -1;
      }
    }
  }

  playerMoves++;
}

  function merge(board, dir) {
    if (dir === "left" || dir === "right") {
      for (let y = 0; y < 4; y++) {
        let rowBlocks = blocks
          .filter((b) => b.y === y)
          .sort((a, b) => (dir === "left" ? a.x - b.x : b.x - a.x));

        for (let i = 0; i < rowBlocks.length - 1; i++) {
          let current = rowBlocks[i];
          let next = rowBlocks[i + 1];

          if (
            current.value === next.value &&
            current.x === next.x + (dir === "left" ? -1 : 1)
          ) {
            current.value *= 2;
            playerScore += current.value;

            // Remove merged block
            let index = blocks.indexOf(next);
            if (index !== -1) blocks.splice(index, 1);

            // Clear merged tile from board
            board[next.y][next.x] = 0;

            // Update board with new value
            board[current.y][current.x] = current.value;
          }
        }
      }
    }

    if (dir === "up" || dir === "down") {
      for (let x = 0; x < 4; x++) {
        let colBlocks = blocks
          .filter((b) => b.x === x)
          .sort((a, b) => (dir === "up" ? a.y - b.y : b.y - a.y));

        for (let i = 0; i < colBlocks.length - 1; i++) {
          let current = colBlocks[i];
          let next = colBlocks[i + 1];

          if (
            current.value === next.value &&
            current.y === next.y + (dir === "up" ? -1 : 1)
          ) {
            current.value *= 2;
            playerScore += current.value;

            let index = blocks.indexOf(next);
            if (index !== -1) blocks.splice(index, 1);

            board[next.y][next.x] = 0;
            board[current.y][current.x] = current.value;
          }
        }
      }
    }
  }


function move(dir) {
  compress(board, dir);
  merge(board, dir);
  compress(board, dir);
  generateBlock();
}

document.addEventListener("keydown", function (event) {
  const code = event.code;
  console.log(code);
  if (code == "KeyD" || code == "ArrowRight") {
    move("right");
  } else if (code == "KeyS" || code == "ArrowDown") {
    move("down")
  } else if (code == "KeyA" || code == "ArrowLeft") {
    move("left")
  } else if (code == "KeyW" || code == "ArrowUp") {
    move("up")
  }
});

function animate() {
  drawGame();
  animationID = requestAnimationFrame(animate);
}

animate();
