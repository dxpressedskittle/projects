let pScore = document.getElementById("pScore")
let p2Score = document.getElementById("p2Score")
let display = document.getElementById("display")
const paddle1 = document.getElementById("paddle1")
const paddle2 = document.getElementById("paddle2")



document.addEventListener('keydown', function(){
    if (event.key == "h") {
        startGame();
    }

})

function startGame() {
    display.innerHTML =""
    ball.style.visibility = "visible"
    animate();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


const ball = document.getElementById("ball");
const box = document.getElementById("gameDisplay")

            // starting Ball position and physics
            pong = {
               x: 400,
               y: 300,
               xSpeed: getRandomInt(3,5),
               ySpeed: 0
               
            }
            let x = 400;
            let y = 300;
            let xSpeed = getRandomInt(3,5)
            let ySpeed = 0;
            ball.style.left = x + "px";
            ball.style.top = y + "px";
            ball.style.visibility = "hidden";


            // Paddle starting pos and physics
             paddleOne = {
               x: 10,
               y: 270,
               ySpeed: 0

             }
             paddle1.style.left = paddleOne.x + "px";
             paddle1.style.top = paddleOne.y + "px";
             paddle1.style.visibility = "hidden"

             paddleTwo = {
               x: 770,
               y: 270,
               ySpeed: 0

             }
             paddle2.style.left = paddleTwo.x + "px";
             paddle2.style.top = paddleTwo.y + "px";
             //paddle2.style.visibility = "hidden"



            
            function getRandomDirection() {
            let direction = getRandomInt(0,1)
            pong.xSpeed = getRandomInt(3,5)
            if (direction = 0) {
               pong.xSpeed = pong.xSpeed
            } else {
               pong.xSpeed = -pong.xSpeed
            }}
                
              
            
                

            function animate() {
            pong.x += pong.xSpeed;
            pong.y += pong.ySpeed;
            if (pong.x + 50 > 800 || pong.x < 0) {
               pong.x = -pong.xSpeed;
            }
            if (pong.y + 50 > 650 || pong.y < 0) {
               pong.ySpeed = -pong.ySpeed;
            }
            ball.style.left = pong.x + "px";
            ball.style.top = pong.y + "px";
            requestAnimationFrame(animate);
         }


         function resetBall() {
            getRandomDirection();
            pong = {
               x: 400,
               y: 300,
               xSpeed: getRandomInt(3,5),
               ySpeed: 0

            }

         }

    