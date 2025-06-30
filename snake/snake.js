// Viewport variables
const viewportWidth = window.innerWidth;
const viewPortHeight = window.innerHeight;
const vh = viewPortHeight / 100;
const vw = viewportWidth / 100;

// Canvas variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = Math.floor((viewportWidth/50)*50); // Set canvas width
canvas.height = Math.floor((viewPortHeight/50)*50);; // Set canvas height

const cellSize = 50; // Size of each square in pixels
const color1 = "#145a32"; // Squares for every other square
const color2 = "#145a32"; // Squares for every other square
// Game variables


// Snake variables
let snake = {
    x: 0,
    y: 0,
    direction: "left"

}


function drawGame() {
  for (let  )

}

function animate() {
  drawGame();
  startGame();

  requestAnimationFrame(animate);
}

i = 0;
ctx.fillRect(0, 0, 50, 50);

function startGame() {
  if (i < 600) {
    i = i + 50;
    ctx.fillRect(i, 0, 50, 50);
    ctx.clearRect(i - 50, 0, 50, 50);
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key == "h") {
    startGame();
  }

  if (controller && controller[e.keyCode]) {
    controller[e.keyCode].pressed = true;
  }
  move();
});

function move() {
  Object.keys(controller).forEach((key) => {
    if (controller[key].pressed == true) {
      controller[key].func();
    }
  });
}

controller = {
    87: {
      pressed: false,
      func: function () {
        movePaddle(1, "w");
      },
    },
    83: {
      pressed: false,
      func: function () {
        movePaddle(1, "s");
      },
    },
    38: {
      pressed: false,
      func: function () {
        movePaddle(2, "ArrowUp");
      },
    },
    40: {
      pressed: false,
      func: function () {
        movePaddle(2, "ArrowDown");
      },
    },
  };

  function changeDirection(dir) {
    if (dir == "left") {

    } else if (dir == "right") {

    } else if (dir == "up") {

    }else if (dir == "down") {

    } else {
        alert("An error has occured, please wait a second.")
    }
  }


animate();
