const cells = document.querySelectorAll(".cell");
const resetButton = document.getElementById("restartBtn");
const swapBtn = document.getElementById("swapBtn");
const playerText = document.getElementById("playerText");
const p1Score = document.getElementById("p1Score");
const p2Score = document.getElementById("p2Score");
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
  7: [2, 4, 6],
};
let player1Choice = "X";
let player2Choice = "O";
let player1Score = 0;
let player2Score = 0;
let turn = 1;

let clickedCell = 0;
cells.forEach((cell) => {
  cell.addEventListener("click", function (event) {
    let clickedCellIndex = event.target.getAttribute("cellIndex");
    clickedCell = cells[clickedCellIndex];
    click();
  });
});

function swap() {
  if (checkActive() == false) {
    if (swapText.innerText === "X") {
      swapText.innerText = "O";
      player1Choice = "O";
      player2Choice = "X";
    } else {
      swapText.innerText = "X";
      player1Choice = "X";
      player2Choice = "O";
    }
  } else {
    statusText.innerHTML = "Please restart or finish the game before swapping.";
  }
}

swapBtn.addEventListener("click", function () {
  swap();
});

function startGame() {
  swapText.innerText = "X";
  statusText.innerText = "Player 1 Turn";
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

function click() {
  if (turn == 1) {
    clickedCell.innerHTML = player1Choice;
    statusText.innerHTML = "Player 2 Turn";
    turn = 2
    
  } else {
    clickedCell.innerHTML = player2Choice;
    statusText.innerHTML = "Player 1 Turn";
    turn = 1
  }
}

resetButton.addEventListener("click", function () {
  cells.forEach((cell) => {
    cell.innerHTML = "";
  });
  statusText.innerText = "Player 1 Turn";
  turn = 1;
});

function checkActive() {
  let count = 0;
  cells.forEach((cell) => {
    if (cell.innerHTML !== "") {
      count++;
    }
  });

  if (count > 0) {
    return true;
  } else {
    return false;
  }
}


function addCount(player) {
  if (player === 1) {
    player1Score++;
    p1Score.innerHTML = player1Score;
  } else if (player === 2) {
    player2Score++;
    p2Score.innerHTML = player2Score;
  }
}

startGame();
