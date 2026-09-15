// Viewport variables
const viewPortWidth = window.innerWidth;
const viewPortHeight = window.innerHeight;
const vw = viewPortWidth / 100;
const vh = viewPortHeight / 100;

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;

// Game setup
const boardSize = Math.min(viewPortWidth, viewPortHeight) * 0.8;
const blockSize = boardSize / 8;
const boardXOffset = (viewPortWidth - boardSize) / 2; // Center horizontally
const boardYOffset = (viewPortHeight - boardSize) / 2; // Center vertically

let board = [
  "br",
  "bn",
  "bb",
  "bq",
  "bk",
  "bb",
  "bn",
  "br",
  "bp",
  "bp",
  "bp",
  "bp",
  "bp",
  "bp",
  "bp",
  "bp",
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  "wp",
  "wp",
  "wp",
  "wp",
  "wp",
  "wp",
  "wp",
  "wp",
  "wr",
  "wn",
  "wb",
  "wq",
  "wk",
  "wb",
  "wn",
  "wr",
];

let heldPieceIndex = null;
let playerTurn = "white";


// Sound variables

const checkSound = new Audio("UI sounds/move-check.wav")
const captureSound = new Audio("UI sounds/capture.wav")
const illegalMoveSound = new Audio("UI sounds/illegal.wav")
const promoteSound = new Audio("UI sounds/promote.wav")
const castleSound = new Audio("UI sounds/castle.wav")
const gameEndSound = new Audio("UI sounds/game-end.wav")
const gameStartSound = new Audio("UI sounds/game-start.wav")


function drawBoard() {
  for (let i = 0; i < 8; i++) {
    // row
    ctx.fillStyle = "black";
    

    
    for (let j = 0; j < 8; j++) {
      // column
      const x = j * blockSize + boardXOffset;
      const y = i * blockSize + boardYOffset;

      if ((i + j) % 2 !== 0) {
        ctx.fillStyle = "#773F1A";
      } else {
        ctx.fillStyle = "#E5C4A1";
      }
      ctx.fillRect(x, y, blockSize, blockSize);
      
      ctx.font = "14px Arial";
      ctx.fillText(
      i + 1, boardXOffset, i * blockSize + boardYOffset + blockSize, // FIX LATER : text moves places when board is clicked. keep working on sound
      ); // Draw row numbers
    }
  }
}

function drawPieces() {
  ctx.font = `${blockSize * 0.9}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const symbols = {
    br: "♜",
    bn: "♞",
    bb: "♝",
    bq: "♛",
    bk: "♚",
    bp: "♟",
    wr: "♖",
    wn: "♘",
    wb: "♗",
    wq: "♕",
    wk: "♔",
    wp: "♙",
  };

  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece) {
      const row = Math.floor(i / 8) + 0.1; // weird offset
      const col = i % 8;
      const x = col * blockSize + boardXOffset + blockSize / 2;
      const y = row * blockSize + boardYOffset + blockSize / 2;

      ctx.fillStyle = piece.startsWith("w") ? "white" : "black";
      ctx.fillText(symbols[piece], x, y);
    }
  }
}

function dragPiece(startIndex, targetIndex) {
  const piece = board[startIndex];

  if (
    !piece ||
    !isLegalMove(piece, startIndex, targetIndex) ||
    startIndex === targetIndex
  ) {
    return;
  }

  if (
    (piece.startsWith("w") && playerTurn === "black") ||
    (piece.startsWith("b") && playerTurn === "white")
  ) {
    return;
  }

  board[targetIndex] = piece;
  board[startIndex] = null;

  if (isPlayerInCheck("b")) {
    checkSound.play()
  } else if (isPlayerInCheck("w")) {
    checkSound.play()
  }

  swapTurn();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPieces();
}

function getBoardIndex(x, y) {
  const col = Math.floor((x - boardXOffset) / blockSize);
  const row = Math.floor((y - boardYOffset) / blockSize);

  if (col < 0 || col >= 8 || row < 0 || row >= 8) {
    return "Out of bounds";
  } else {
    return row * 8 + col;
  }
}

function isLegalMove(piece, startIndex, targetIndex) {
  const moveFunctions = {
    p: isPawnLegalMove,
    r: isRookLegalMove,
    n: isKnightLegalMove,
    b: isBishopLegalMove,
    q: isQueenLegalMove,
    k: isKingLegalMove,
  };

  const moveFunction = moveFunctions[piece[1]];
  return moveFunction ? moveFunction(startIndex, targetIndex, piece) : false; // sends out move function to set piece
}

function swapTurn() {
  if (playerTurn === "white") {
    playerTurn = "black";
  } else {
    playerTurn = "white";
  }
  board = board.toReversed(); // switch board so other color is on bottom
}

function getPosition(index) {
  // calculates row and col from index
  return {
    row: Math.floor(index / 8),
    col: index % 8,
  };
}

function isTargetAvailable(piece, targetIndex) {
  const targetPiece = board[targetIndex];
  return !targetPiece || targetPiece[0] !== piece[0];
}

function checkPath(startIndex, targetIndex) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);

  const rowDiff = target.row - start.row;
  const colDiff = target.col - start.col;

  const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
  const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

  let currentRow = start.row + rowStep;
  let currentCol = start.col + colStep;

  while (currentRow !== target.row || currentCol !== target.col) {
    const currentIndex = currentRow * 8 + currentCol;
    if (board[currentIndex]) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }

  return true;
}

function isPawnLegalMove(startIndex, targetIndex, piece) {
  let direction;
  let startingRow;

  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);

  const rowDiff = target.row - start.row;
  const colDiff = target.col - start.col;

  if (playerTurn === "black") {
    direction = piece[0] === "b" ? -1 : 1;
    startingRow = piece[0] === "w" ? 1 : 6;
  } else if (playerTurn === "white") {
    direction = piece[0] === "w" ? -1 : 1;
    startingRow = piece[0] === "w" ? 6 : 1;
  }

  if (colDiff === 0 && !board[targetIndex]) {
    const canMoveOne = rowDiff === direction;
    const canMoveTwo = rowDiff === direction * 2 && start.row === startingRow;

    if (canMoveOne || (canMoveTwo && !board[startIndex + direction * 8])) {
      return true;
    }
  }

  const targetPiece = board[targetIndex];
  const canCapture = targetPiece && targetPiece[0] !== piece[0];

  return Math.abs(colDiff) === 1 && rowDiff === direction && canCapture;
}

function isRookLegalMove(startIndex, targetIndex, piece) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);
  const movesStraight = start.row === target.row || start.col === target.col;

  return (
    movesStraight &&
    checkPath(startIndex, targetIndex) &&
    isTargetAvailable(piece, targetIndex)
  );
}

function isKnightLegalMove(startIndex, targetIndex, piece) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);
  const rowDiff = Math.abs(target.row - start.row);
  const colDiff = Math.abs(target.col - start.col);

  return (
    ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) &&
    isTargetAvailable(piece, targetIndex)
  );
}

function isBishopLegalMove(startIndex, targetIndex, piece) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);
  const movesDiagonally =
    Math.abs(target.row - start.row) === Math.abs(target.col - start.col);

  return (
    movesDiagonally &&
    checkPath(startIndex, targetIndex) &&
    isTargetAvailable(piece, targetIndex)
  );
}

function isQueenLegalMove(startIndex, targetIndex, piece) {
  return (
    isRookLegalMove(startIndex, targetIndex, piece) ||
    isBishopLegalMove(startIndex, targetIndex, piece)
  );
}

function isKingLegalMove(startIndex, targetIndex, piece) {
  const start = getPosition(startIndex);
  const target = getPosition(targetIndex);
  const rowDiff = Math.abs(target.row - start.row);
  const colDiff = Math.abs(target.col - start.col);

  return rowDiff <= 1 && colDiff <= 1 && isTargetAvailable(piece, targetIndex);
}

function findKing(color) {
  for (x = 0; x < 64; x++) {
    if (board[x]) {
      if (board[x].startsWith(`${color}k`)) {
        return x;
      }
    }
  }
}

function isPlayerInCheck(color) {
    const kingIndex = findKing(color);
    const enemyColor = color === 'white' ? 'b' : 'w';

    for (let i = 0; i < 64; i++) {
        const piece = board[i];

        // Only check pieces that belong to the opponent
        if (piece && piece.startsWith(enemyColor)) { 
            // Check if this enemy piece can attack the kings square 
            if (isLegalMove(piece, i, kingIndex)) { 
                return true; 
            } 
        } 
    } 
    return false; 
}


function previewPossibleMoves(index) {
  const piece = board[index];
  if (!piece) return;

  const possibleMoves = [];

  for (let targetIndex = 0; targetIndex < 64; targetIndex++) {
    if (isLegalMove(piece, index, targetIndex)) {
      if (
        (piece.startsWith("w") && playerTurn === "black") ||
        (piece.startsWith("b") && playerTurn === "white")
      ) {
        return;
      }
      possibleMoves.push(targetIndex);
    }
  }

  // Highlights all possible moves for selected piece
  possibleMoves.forEach((targetIndex) => {
    const row = Math.floor(targetIndex / 8);
    const col = targetIndex % 8;
    const x = col * blockSize + boardXOffset;
    const y = row * blockSize + boardYOffset;

    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    ctx.fillRect(x, y, blockSize, blockSize);
  });
}

function clearHighlights() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPieces();
}

canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  heldPieceIndex = getBoardIndex(clickX, clickY);

  if (heldPieceIndex === null || heldPieceIndex === "Out of bounds") {
    heldPieceIndex = null;
  }

  previewPossibleMoves(heldPieceIndex);
});

canvas.addEventListener("mouseup", (event) => {
  const rect = canvas.getBoundingClientRect();
  const releaseX = event.clientX - rect.left;
  const releaseY = event.clientY - rect.top;

  const targetIndex = getBoardIndex(releaseX, releaseY);

  if (heldPieceIndex !== null && targetIndex !== "Out of bounds") {
    dragPiece(heldPieceIndex, targetIndex);
  } else if (targetIndex === "Out of bounds") {
    console.log("Piece dragged out of bounds");
  }

  heldPieceIndex = null;

  clearHighlights();
});

drawBoard();
drawPieces();
