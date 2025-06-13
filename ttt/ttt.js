const cells = document.querySelectorAll(".cell");
const resetButton = document.getElementById("restartBtn");
const swapBtn = document.getElementById("swapBtn");
const playerText = document.getElementById("playerText");
const p1Score = document.getElementById("p1Score");
const p2Score = document.getElementById("p2Score");
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
      return true;
    }
  }
  return false;
}

function click() {
  // Check if already filled
  if (clickedCell.innerHTML != "") {
    statusText.innerHTML = "Square already filled! Pick another one.";
  }
  // turn system
  if (turn == 1 && clickedCell.innerHTML == "") {
    clickedCell.innerHTML = player1Choice;
    statusText.innerHTML = "Player 2 Turn";
    turn = 2;
  } else if (turn == 2 && clickedCell.innerHTML == "") {
    clickedCell.innerHTML = player2Choice;
    statusText.innerHTML = "Player 1 Turn";
    turn = 1;
  }

  // Check if anyone has won the game
  if (checkWin("X") == true) {
    addCount("X", player1Choice, player2Choice);
    statusText.innerHTML = "Player 1 Wins!";
    disableCells();
  } else if (checkWin("O") == true) {
    addCount("O", player1Choice, player2Choice);
    statusText.innerHTML = "Player 2 Wins!";
    disableCells();
    return;
  }

  if (checkActive() == true) {
    let count = 0;
    cells.forEach((cell) => {
      if (cell.innerHTML !== "") {
        count++;
      }
    });
    if (count == 9) {
      statusText.innerHTML = "It's a Draw!";
      disableCells();
    }
  }
}
function disableCells() {
  cells.forEach((cell) => {
    cell.style.pointerEvents = "none";
    cell.style.disabled = true;
  });
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

function addCount(player, player1Choice, player2Choice) {
  if (player == player1Choice) {
    player1Score++;
    p1Score.innerText = player1Score;
  } else if (player == player2Choice) {
    player2Score++;
    p2Score.innerText = player2Score;
  }
}

startGame();
