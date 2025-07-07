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
const appleImage = new Image();

// Animation variables
let animationID;

// Game variables
// Snake variables

function randomizeSnake() {
  snakeStartingX =
    Math.floor((Math.floor(Math.random() * (canvas.width - 0 + 1)) + 0) / 50) *
    50;
  snakeStartingY =
    Math.floor((Math.floor(Math.random() * (canvas.height - 0 + 1)) + 0) / 50) *
    50;

  snake = [
    { x: snakeStartingX, y: snakeStartingY },
    { x: snakeStartingX - 50, y: snakeStartingY },
    { x: snakeStartingX - 100, y: snakeStartingY },
    { x: snakeStartingX - 150, y: snakeStartingY },
    { x: snakeStartingX - 200, y: snakeStartingY },
  ];
}
randomizeSnake();

let snakeLength = snake.length;
let snakeDirection = "right";
let snakeScore = 0;

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

let apple = {
  x:
    Math.floor((Math.floor(Math.random() * (canvas.width - 0 + 1)) + 0) / 50) *
    50,
  y:
    Math.floor((Math.floor(Math.random() * (canvas.height - 0 + 1)) + 0) / 50) *
    50,
};

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
  ctx.fillStyle = appleColor 
  ctx.fillRect(apple.x,apple.y,50,50)
}


function randomizeApple() {
  apple = {
    x:
      Math.floor(
        (Math.floor(Math.random() * (canvas.width - 0 + 1)) + 0) / 50
      ) * 50,
    y:
      Math.floor(
        (Math.floor(Math.random() * (canvas.height - 0 + 1)) + 0) / 50
      ) * 50,
  };
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
  if (snake[0].x === apple.x && snake[0].y === apple.y) {
    apple.x =
      Math.floor(
        (Math.floor(Math.random() * (canvas.width - 0 + 1)) + 0) / 50
      ) * 50;
    apple.y =
      Math.floor(
        (Math.floor(Math.random() * (canvas.height - 0 + 1)) + 0) / 50
      ) * 50;
    snakeScore++;

    const tail = snake[snake.length - 1];
    snake.push({ x: tail.x, y: tail.y });
    snakeLength = snake.length;
  }

  for (i = 1; i < snakeLength; i++) {
    if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
      gameOver();
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

function drawScore() {
  ctx.font = "bold 50px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(`Score: ${snakeScore}`, (canvas.width/2)-50 , 50);
}

function startGame() {
  randomizeSnake();
  snakeLength = snake.length;
  randomizeApple();
  drawApple();
  drawSnake();
  isGameOver = false;
  direction = "right";
}

function gameOver() {
  snakeScore = 0;
  ctx.font = "bold 25px Arial";
  ctx.fillText(
    "Game Over, Please press e to play again.",
    canvas.width / 3,
    canvas.height / 2
  );
  stopAnimation();
}

let isGameOver = false;
function stopAnimation() {
  window.cancelAnimationFrame(animationID);
  animationID = undefined;
  isGameOver = true;
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
  } else if (key === "e" || key === "E") {
    startGame();
    animationID = window.requestAnimationFrame(animate);
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
  drawScore();
  

  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;
  fps = Math.round(1 / secondsPassed);
  ctx.font = "25px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("FPS: " + fps, 10, 30);

  setTimeout(() => {
    if (isGameOver === false) {
      animationID = window.requestAnimationFrame(animate);
    }
  }, 1000 / 20);
}

