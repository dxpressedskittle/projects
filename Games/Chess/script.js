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

const board = [
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


function drawBoard() {
  for (let i = 0; i < 8; i++) {
    // row
    for (let j = 0; j < 8; j++) {
      // column
      const x = j * blockSize + boardXOffset;
      const y = i * blockSize + boardYOffset;

      if ((i + j) % 2 !== 0) {
        ctx.fillStyle = "#769656";
      } else {
        ctx.fillStyle = "#eeeed2";
      }
      ctx.fillRect(x, y, blockSize, blockSize);
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

function dragPiece(startIndex, toIndex) {
  if (startIndex !== null && board[startIndex]) {
    board[toIndex] = board[startIndex];
    board[startIndex] = null;
  }
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

canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  heldPieceIndex = getBoardIndex(clickX, clickY);

  if (heldPieceIndex === null || heldPieceIndex === "Out of bounds") {
    heldPieceIndex = null;
  }
});

canvas.addEventListener("mouseup", (event) => {
  const rect = canvas.getBoundingClientRect();
  const releaseX = event.clientX - rect.left;
  const releaseY = event.clientY - rect.top;

  const targetIndex = getBoardIndex(releaseX, releaseY);

  if (heldPieceIndex !== null && targetIndex !== "Out of bounds") {
    dragPiece(heldPieceIndex, targetIndex);
  } else if (targetIndex === "Out of bounds") {
    console.log("Out of bounds")
  }
  
  heldPieceIndex = null; 
});

drawBoard();
drawPieces();
