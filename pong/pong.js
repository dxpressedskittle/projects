document.addEventListener('DOMContentLoaded', (event) =>{

let pScore = document.getElementById("pScore")
let p2Score = document.getElementById("p2Score")
let display = document.getElementById("display")
const paddle1 = document.getElementById("paddle1")
const paddle2 = document.getElementById("paddle2")

    const animate = () => {
      move()
      window.requestAnimationFrame(animate)
    }

    window.requestAnimationFrame(animate)


// event listeners

document.addEventListener('keydown', function(e){
    if (e.key == "h") {
        startGame();
    } 
    
    if(controller && controller[e.keyCode]) {
      controller[e.keyCode].pressed = true
    }
})

document.addEventListener('keyup', function(e){
   if(controller && controller[e.keyCode]) {
      controller[e.keyCode].pressed = false
    }
})

function move() {
   Object.keys(controller).forEach(key=> {
      if (controller[key].pressed == true){
         controller[key].func()
      }
   })
   requestAnimationFrame(move);
}



function startGame() {
    display.innerHTML =""
    ball.style.visibility = "visible"
    paddle1.style.visibility = "visible"
    paddle2.style.visibility = "visible"
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
let xSpeed = getRandomInt(3,5)
let ySpeed = 0;
ball.style.left = x + "px";
ball.style.top = y + "px";
ball.style.visibility = "hidden";

// Paddle starting pos and physics
let paddleOne = {
   x: 10,
   y: 270,
   ySpeed: -10
}
paddle1.style.left = paddleOne.x + "px";
paddle1.style.top = paddleOne.y + "px";
paddle1.style.visibility = "hidden"

let paddleTwo = {
   x: 770,
   y: 270,
   ySpeed: -10
}
paddle2.style.left = paddleTwo.x + "px";
paddle2.style.top = paddleTwo.y + "px";
paddle2.style.visibility = "hidden"


controller = {
  87: {pressed: false, func: function() { movePaddle(1, "w") }},
  83: {pressed: false, func: function() { movePaddle(1, "s") }},
  38: {pressed: false, func: function() { movePaddle(2, "ArrowUp") }},
  40: {pressed: false, func: function() { movePaddle(2, "ArrowDown") }},
};



            
            function getRandomDirection() {
            let direction = getRandomInt(0,1)
            xSpeed = getRandomInt(3,5)
            if (direction == 0) {
               xSpeed = xSpeed
            } else {
               xSpeed = -xSpeed
            }}
                
              
            
                

            function moveBall() {
            x += xSpeed;
            y += ySpeed;
            if (x + 50 > 800 || x < 0) {
               resetBall();
            }
            if (y + 50 > 650 || y < 0) {
               ySpeed = -ySpeed;
            }
            ball.style.left = x + "px";
            ball.style.top = y + "px";
            requestAnimationFrame(moveBall);
         }

         

            function movePaddle(player, direction) {
               if (player == 1) {
                  if (direction == "w") {
                     paddleOne.y += paddleOne.ySpeed
                  } else if (direction == "s") {
                     paddleOne.y -= paddleOne.ySpeed
                  }
               } else if (player == 2) {
                  if (direction == "ArrowUp") {
                     paddleTwo.y += paddleTwo.ySpeed
                     console.log(paddleTwo.ySpeed)
                  } else if (direction == "ArrowDown") {
                     paddleTwo.y -= paddleTwo.ySpeed
                  }

               }
               paddle1.style.top = paddleOne.y + "px";
               paddle2.style.top = paddleTwo.y + "px"
               requestAnimationFrame(movePaddle)

            }


         function resetBall() {
            getRandomDirection();
            x = 370;
            y = 300;

         }

    })




