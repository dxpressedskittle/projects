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
let imageLoaded = false;

// Bird Variables

let bird = {
  x: 200,
  y: 200,
  yVel: 1,
};

const birdImg = new Image();
const pipeImg = new Image();
const pipe2Img = new Image();
birdImg.src = "../imgs/FlappyBird/FlappyBird.jpg";
pipeImg.src = "../imgs/FlappyBird/pipe.jpg";
pipe2Img.src = "../imgs/FlappyBird/pipe2.jpg";

// Game variables
let isGameOver = true;

//Pipe variables

pipes = [];

let birdLoaded = false;
let pipeLoaded = false;
let pipe2Loaded = false;

birdImg.onload = () => {
  birdLoaded = true;
};
pipeImg.onload = () => {
  pipeLoaded = true;
};
pipe2Img.onload = () => {
  pipe2Loaded = true;
};

function clearFrame() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBird() {
  if (birdLoaded) {
    ctx.drawImage(birdImg, bird.x, bird.y, 10 * vw, 20 * vh);
  }
}

function moveBird() {
  bird.y += bird.yVel;
}

function checkCollision() {
  // If the bird goes off the screen
  for (i=0;i<pipes.length;i++) {
    
  }
}

function flapBird() {
  if (isGameOver == false) {
    bird.yVel = -13;
  }
}

function gameOver() {
  ctx.font = "25px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(
    "GAME OVER, PRESS E TO START AGAIN.",
    50 * vh,
    canvas.height / 2 - 25
  );
  cancelAnimationFrame(animationID);
  isGameOver = true;
}

// Spawns pipes
setInterval(function () {
  const pipeGap = 53 * vh;
  const minPipeHeight = 15 * vh;
  const maxPipeHeight = canvas.height - pipeGap - minPipeHeight;
  const topPipeHeight =
    Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) +
    minPipeHeight;
  const bottomPipeY = topPipeHeight + pipeGap;
  const pipeX = canvas.width;
  const topPipe = { x: pipeX, y: topPipeHeight, flipped: true };
  const bottomPipe = { x: pipeX, y: bottomPipeY, flipped: false };
  pipes.push(topPipe, bottomPipe);
}, 3000);

function drawPipes() {
  for (i = 0; i < pipes.length; i++) {
    if (pipes[i].flipped == true && pipe2Loaded == true) {
      ctx.drawImage(pipe2Img, pipes[i].x, pipes[i].y - 400, 200, 500);
    } else if (pipes[i].flipped == false) {
      ctx.drawImage(pipeImg, pipes[i].x, pipes[i].y, 200, 500);
    }
  }

  // If it goes out of render it despawns and moving physics
  for (i = 0; i < pipes.length; i++) {
    pipes[i].x -= 3;
    if (pipes[i].x < -200) {
      pipes.splice(i, 1);
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Input handling and animation

document.addEventListener("keypress", function (event) {
  const code = event.code;
  if (code == "Space") {
    flapBird();
  } else if (code == "KeyE") {
    startGame();
  }
});

function animate() {
  clearFrame();
  drawBird();
  drawPipes();
  moveBird();
  gravity();
  checkCollision();

  animationID = requestAnimationFrame(animate);
  if (isGameOver == true) {
    cancelAnimationFrame(animationID);
  }


  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;
  fps = Math.round(1 / secondsPassed);
  ctx.font = "25px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("FPS: " + fps, 10, 30);
}

function startGame() {
  if (isGameOver == true) {
    isGameOver = false;
    animationID = requestAnimationFrame(animate);
    bird.y = getRandomInt(20 * vh, 60 * vh);
    bird.yVel = 0;
  }
}

startGame();

function gravity() {
  if (isGameOver == false) {
    bird.yVel += 0.5;
  }
}
