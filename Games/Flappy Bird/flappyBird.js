
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
  x: 10*vw,
  y: 30*vh,
  yVel: 1,
  height: 20*vh,
  width: 10*vw
};

const birdImg = new Image();
const pipeImg = new Image();
const pipeImg2 = new Image();

birdImg.onload = function drawBird() {
  ctx.drawImage(birdImg, bird.x, bird.y,bird.height,bird.width); // Draws the image at x=0, y=0
};

function main(ts) {
  bird.y += bird.yVel

  requestAnimationFrame(main)
}      

main()
birdImg.src = '/imgs/FlappyBird/FlappyBird.jpg';
