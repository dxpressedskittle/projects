document.addEventListener("DOMContentLoaded", (event) => {
  let pScore = document.getElementById("pScore");
  let p2Score = document.getElementById("p2Score");
  let display = document.getElementById("display");
  const paddle1 = document.getElementById("paddle1");
  const paddle2 = document.getElementById("paddle2");

  const animate = () => {
    move();
    movePaddle();
    window.requestAnimationFrame(animate);
  };

  window.requestAnimationFrame(animate);

  // event listeners

  document.addEventListener("keydown", function (e) {
    if (e.key == "h") {
      startGame();
    }

    if (controller && controller[e.keyCode]) {
      controller[e.keyCode].pressed = true;
    }
    move();
  });

  document.addEventListener("keyup", function (e) {
    if (controller && controller[e.keyCode]) {
      controller[e.keyCode].pressed = false;
    }
  });

  function move() {
    Object.keys(controller).forEach((key) => {
      if (controller[key].pressed == true) {
        controller[key].func();
      }
    });
  }

  function startGame() {
    display.innerHTML = "";
    ball.style.visibility = "visible";
    paddle1.style.visibility = "visible";
    paddle2.style.visibility = "visible";
    moveBall();
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  

  const ball = document.getElementById("ball");
  const box = document.getElementById("box");

  // starting Ball position and physics
  let x = 400;
  let y = 300;
  let xSpeed = getRandomInt(5, 7);
  let ySpeed = getRandomInt(4, 7);
  ball.style.left = x + "px";
  ball.style.top = y + "px";
  ball.style.visibility = "hidden";

  // Paddle starting pos and physics
  let paddleOne = {
    x: 10,
    y: 270,
    ySpeed: -10,
  };
  paddle1.style.left = paddleOne.x + "px";
  paddle1.style.top = paddleOne.y + "px";
  paddle1.style.visibility = "hidden";

  let paddleTwo = {
    x: 770,
    y: 270,
    ySpeed: -10,
  };
  paddle2.style.left = paddleTwo.x + "px";
  paddle2.style.top = paddleTwo.y + "px";
  paddle2.style.visibility = "hidden";

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

  function getRandomDirection() {
    let direction = getRandomInt(0, 1);
    if (direction == 0) {
      xSpeed = getRandomInt(5, 7);
      ySpeed = getRandomInt(0, 7);
    } else {
      xSpeed = getRandomInt(5, 7);
      ySpeed = getRandomInt(0, 7);
      xSpeed = -xSpeed;
      ySpeed = -ySpeed;
    }
  }

  let hitCount = 0;

  function moveBall() {
    x += xSpeed;
    y += ySpeed;

    // Top and bottom collision
    if (y <= 0 || y + 50 >= 650) {
      ySpeed = -ySpeed;
    }

    // Paddle collision
    // Left paddle
    if (
      x <= paddleOne.x + 20 &&
      y + 50 >= paddleOne.y &&
      y <= paddleOne.y + 100 &&
      x > paddleOne.x
    ) {
      xSpeed = Math.abs(xSpeed);
      hitCount++;
      console.log(hitCount);
      if (hitCount % 3 == 0) {
        xSpeed = xSpeed * 1.1;
        ySpeed = ySpeed * 1.1;
        console.log(ySpeed, xSpeed);
      }
    }
    // Right paddle
    if (
      x + 50 >= paddleTwo.x &&
      y + 50 >= paddleTwo.y &&
      y <= paddleTwo.y + 100 &&
      x < paddleTwo.x + 20
    ) {
      xSpeed = -Math.abs(xSpeed);
      hitCount++;
      console.log(hitCount);
      if (hitCount % 3 == 0) {
        xSpeed = xSpeed * 1.1;
        ySpeed = ySpeed * 1.1;
        console.log(ySpeed, xSpeed);
      }
    }

    // Score
    if (x < 0) {
      // Player 2 scores
      let score = parseInt(p2Score.textContent) + 1;
      p2Score.textContent = score;
      resetBall();
      return;
    }
    if (x + 50 > 800) {
      // Player 1 scores
      let score = parseInt(pScore.textContent) + 1;
      pScore.textContent = score;
      resetBall();
      return;
    }

    ball.style.left = x + "px";
    ball.style.top = y + "px";
    requestAnimationFrame(moveBall);
  }

  function movePaddle(player, direction) {
    if (player == 1) {
      if (direction == "w" && paddleOne.y > 0) {
        paddleOne.y += paddleOne.ySpeed;
      } else if (direction == "s" && paddleOne.y < 540) {
        paddleOne.y -= paddleOne.ySpeed;
      }
      paddle1.style.top = paddleOne.y + "px";
    } else if (player == 2) {
      if (direction == "ArrowUp" && paddleTwo.y > 0) {
        paddleTwo.y += paddleTwo.ySpeed;
      } else if (direction == "ArrowDown" && paddleTwo.y < 540) {
        paddleTwo.y -= paddleTwo.ySpeed;
      }
      paddle2.style.top = paddleTwo.y + "px";
    }
  }

  function resetBall() {
    getRandomDirection();
    x = 400;
    y = 300;
    ball.style.left = x + "px";
    ball.style.top = y + "px";
    hitCount = 0;
  }
});
