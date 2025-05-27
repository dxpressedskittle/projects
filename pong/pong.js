let pScore = document.getElementById("pScore")
let p2Score = document.getElementById("p2Score")
let display = document.getElementById("display")



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


            let boxLength = 600
            let x = 370;
            let y = 300;
            let xSpeed = 3.5;
            let ySpeed = 0;
            ball.style.left = x + "px";
            ball.style.top = y + "px";
            ball.style.visibility = "hidden";
            
            function getRandomDirection() {
            if (getRandomInt(0, 3) == 0) {
                xSpeed = -xSpeed; 
             } else if (getRandomInt(0, 3) == 1) {
                ySpeed = -ySpeed;
             } else if (getRandomInt(0, 3) == 2) {
                ySpeed = ySpeed;
             } else if (getRandomInt(0, 3) == 3) {
                xSpeed = xSpeed;
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

    