const cells = document.querySelectorAll(".cell");
const resetButton = document.getElementById("restartBtn"); 
const swapBtn = document.getElementById("swapBtn");
let computerCellChoice = 0;
let statusText = document.getElementById("statusText");
let winningArrays = {
    0: [0, 1, 2],
    1: [3, 4, 5],
    2: [6, 7, 8],
    3: [0, 3, 6],
    4: [1, 4, 7],
    5: [2, 5, 8],
    6: [0, 4, 8],
    7: [2, 4, 6]
}
let playerChoice = "X";
let computerChoice = "O";
let playerScore = 0;
let computerScore = 0;
let counter = 0;

let clickedCell = 0;
cells.forEach(cell => {
    cell.addEventListener("click", function(event) {
        const clickedCellIndex = event.target.getAttribute("cellIndex");
        let clickedCell = cells[clickedCellIndex];
        click();
    });
});

function swap() {
    if (swapText.innerText === "X") {
        swapText.innerText = "O";
        playerChoice = "O";
        computerChoice = "X";
    } else {
        swapText.innerText = "X";
        playerChoice = "X";
        computerChoice = "O";
    }
}

swapBtn.addEventListener("click", function() {
    swap();
});


function startGame() {
    swapText.innerText = "X"

}

function checkWin(player) {
    for (let key in winningArrays) {
        const [a, b, c] = winningArrays[key];
        if (
            cells[a].innerText === player &&
            cells[b].innerText === player &&
            cells[c].innerText === player
        ) {
            addCount(player);
            return true; 
        }
    }
    return false; 
}

function addCount(player) {
    if (player === playerChoice) {
        playerScore++;
        document.querySelector(".counter").innerText = playerScore;
    } else if (player === computerChoice) {
        computerScore++;
        document.querySelector(".counter").innerText = computerScore;
    }
}

function click() {
    event.target.classList.add("userClicked");

    if (event.target.innerText === "") {
        event.target.innerText = playerChoice;

        if (checkWin(playerChoice)) {
            statusText.innerText = "Player Wins!";
            return;
        }

        computerMove();

        if (checkWin(computerChoice)) {
            statusText.innerText = "Computer Wins!";
        }
    } else if (
        event.target.classList.contains("computerClicked") ||
        event.target.classList.contains("userClicked")
    ) {
        statusText.innerText = "Cell already clicked!";
    }
}

resetButton.addEventListener("click", function() {
    resetGame();
    resetButton.classList.remove("userClicked");
});

function resetGame() {
    statusText.innerText = "";
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("userClicked");
        cells[i].classList.remove("computerClicked");
    }
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = "";
    }

    let computerChoiceFirst = Math.floor(Math.random() * 3);
    if (computerChoiceFirst === 0) {
        computerMove();
    } else {
        
    }

}


function computerMove() {
    let computerCellChoice = Math.floor(Math.random() * cells.length);
    event.target.classList.add("computerClicked");
    if (cells[computerCellChoice].innerText === "") {
        cells[computerCellChoice].innerText = computerChoice;
        cells[computerCellChoice].classList.add("computerClicked");
    } else {
        computerMove();
    }

}

startGame();