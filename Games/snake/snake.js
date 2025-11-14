// Viewport variables
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
const vh = viewportHeight / 100;
const vw = viewportWidth / 100;

// Canvas variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = viewportWidth;
canvas.height = viewportHeight;

// Game variables

settings = {
    map: [],
    snake: [],
    food: []
}



function drawBoard() {
  ctx.fillStyle = "#2d9718ff";
  ctx.fillRect(25 * vw, 15 * vh, 50 * vw, 70 * vh);

  ctx.fillStyle = "#238110ff"
  ctx.fillRect(25*vw, 15*vh, 50*vw, 7*vh);

  // checkerboard

  const squareSize = 5 * vw
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if ((row + col) % 2 === 0) {
                ctx.fillStyle = "#39c01eff";
            } else {
                ctx.fillStyle = "#2fa517ff";
            }
            ctx.fillRect(27.5 * vw + col * squareSize, 22 * vh + row * squareSize, squareSize, squareSize);
        }

    }
}

function main() {
    drawBoard();

    requestAnimationFrame(main);
}

main()
