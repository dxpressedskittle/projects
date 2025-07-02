// Viewport variables
const viewportWidth = window.innerWidth;
const viewPortHeight = window.innerHeight;
const vh = viewPortHeight / 100;
const vw = viewportWidth / 100;

// Canvas variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = Math.floor(viewportWidth / 50) * 50; // Set canvas width
canvas.height = Math.floor(viewPortHeight / 50) * 50; // Set canvas height
const cellSize = 50; // Size of each square in pixels
const color1 = "#145a32"; // Dark green
const color2 = "#1e8449"; // Light green
const snakeColor = "black";

// Game variables
// Snake variables
let snakeStartingX =
  Math.floor((Math.floor(Math.random() * (canvas.width - 0 + 1)) + 0) / 50) *
  50;
let snakeStartingY =
  Math.floor((Math.floor(Math.random() * (canvas.height - 0 + 1)) + 0) / 50) *
  50;

let snake = [
  { x: snakeStartingX, y: snakeStartingY },
  { x: snakeStartingX - 50, y: snakeStartingY },
  { x: snakeStartingX - 100, y: snakeStartingY },
  { x: snakeStartingX - 150, y: snakeStartingY },
  { x: snakeStartingX - 200, y: snakeStartingY },
];

let snakeLength = snake.length;
let snakeDirection = "up";

// checks if it spawned off the map and if it did then move it foward until its completely on it
for (i = 0; i < snakeLength; i++) {
  if (snake[i].x < 0) {
    for (j = 0; j < snakeLength; j++) {
      snake[j].x += 50;
    }
  } else {
  }
}

// Apple variables

appleColor = "red";
apple = {
  x: Math.floor((Math.floor(Math.random() * (canvas.width - 0 + 1)) + 0) / 50) *50,
  y: Math.floor((Math.floor(Math.random() * (canvas.height - 0 + 1)) + 0) / 50) *50
}

function drawBoard() {
  for (let column = 0; column < canvas.height / cellSize; column++) {
    for (let row = 0; row < canvas.width / cellSize; row++) {
      if ((row + column) % 2 === 0) {
        ctx.fillStyle = color1;
      } else {
        ctx.fillStyle = color2;
      }
      ctx.fillRect(row * cellSize, column * cellSize, cellSize, cellSize);
    }
  }
}

function drawSnake() {
  for (i = 0; i < snakeLength; i++) {
    ctx.fillStyle = snakeColor;
    ctx.fillRect(snake[i].x, snake[i].y, 50, 50);
  }
}

function drawApple() {
  ctx.fillStyle = "red";
  ctx.fillRect(apple.x,apple.y,50,50)
}

function moveSnake(direction) {
  const head = { ...snake[0] };

  if (direction === "up") {
    head.y -= cellSize;
  } else if (direction === "down") {
    head.y += cellSize;
  } else if (direction === "left") {
    head.x -= cellSize;
  } else if (direction === "right") {
    head.x += cellSize;
  }

  snake.unshift(head);

  snake.pop();
}

function checkCollision() {
  for (i=0; i<snakeLength;i++) {
    if (snake[i].x === apple.x && snake[i].y === apple.y) {
      snake.x = Math.floor((Math.floor(Math.random() * (canvas.width - 0 + 1)) + 0) / 50) *50
      snake.y = Math.floor((Math.floor(Math.random() * (canvas.width - 0 + 1)) + 0) / 50) *50
    }
  }


  for (i = 0; i < snakeLength; i++) {
    if (snake[i].x < 0) {
      snake[i].x = canvas.width - 50;
    } else if (snake[i].x > canvas.width - 50) {
      snake[i].x = 0;
    } else if (snake[i].y < 0) {
      snake[i].y = canvas.height - 50;
    } else if (snake[i].y > canvas.height - 50) {
      snake[i].y = 0;
    }
  }
}

function checkVertical() {
  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].x !== snake[i + 1].x) {
      return false;
    }
  }
  return true;
}

function checkHorizontal() {
  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].y !== snake[i + 1].y) {
      return false;
    }
  }
  return true;
}

// Control eventlisteners

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if ((key === "a" || key === "ArrowLeft") && snakeDirection !== "right") {
    snakeDirection = "left";
  } else if ((key === "w" || key === "ArrowUp") && snakeDirection !== "down") {
    snakeDirection = "up";
  } else if ((key === "s" || key === "ArrowDown") && snakeDirection !== "up") {
    snakeDirection = "down";
  } else if (
    (key === "d" || key === "ArrowRight") &&
    snakeDirection !== "left"
  ) {
    snakeDirection = "right";
  }
});

let secondsPassed;
let oldTimeStamp;
let fps;
window.requestAnimationFrame(animate);

function animate(timeStamp) {
  if (!oldTimeStamp) oldTimeStamp = timeStamp;

  drawBoard();
  drawSnake();
  drawApple();
  moveSnake(snakeDirection);
  checkCollision();

  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;
  fps = Math.round(1 / secondsPassed);
  ctx.font = "25px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("FPS: " + fps, 10, 30);

  setTimeout(() => {
    window.requestAnimationFrame(animate);
  }, 1000 / 15);
}
