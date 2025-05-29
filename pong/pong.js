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
               ySpeed: 0,

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
            xSpeed = getRandomInt(3,5)
            if (direction = 0) {
               xSpeed = xSpeed
            } else {
               xSpeed = -xSpeed
            }}
                
              
            
                

            function animate() {
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
            requestAnimationFrame(animate);
         }


         function resetBall() {
            getRandomDirection();
            x = 370;
            y = 300;

         }

    