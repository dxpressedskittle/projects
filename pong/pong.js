let display = document.getElementById("display")



document.addEventListener('keydown', function(){
    if (event.key == "h") {
        startGame()
    }

})

function startGame() {
    display.innerHTML =""
}



const ball = document.getElementById("ball");
const box = document.getElementById("gameDisplay")
            let boxLength = box.offsetWidth
            let x = 0;
            let y = 0;
            let xSpeed = 5;
            let ySpeed = 5;
            function animate() {
            x += xSpeed;
            y += ySpeed;
            if (x + 50 > 600 || x < 0) {
               xSpeed = -xSpeed;
            }
            if (y + 50 > window.innerHeight || y < 0) {
               ySpeed = -ySpeed;
            }
            ball.style.left = x + "px";
            ball.style.top = y + "px";
            requestAnimationFrame(animate);
         }
        animate();