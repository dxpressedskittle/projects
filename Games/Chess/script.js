// Viewport variables
// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const viewPortWidth = canvas.clientWidth;
const viewPortHeight = canvas.clientHeight;
const vw = viewPortWidth / 100;
const vh = viewPortHeight / 100;
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
let boardIsFlipped = false;

let heldPieceIndex = null;
let playerTurn = "white";
let playerColor = "w";

const whitePremoves = [];
const blackPremoves = [];

// Sound variables

const checkSound = new Audio("UI sounds/move-check.wav");
const moveSound = new Audio("UI sounds/move-self.wav");
const captureSound = new Audio("UI sounds/capture.wav");
const illegalMoveSound = new Audio("UI sounds/illegal.wav");
const promoteSound = new Audio("UI sounds/promote.wav");
const castleSound = new Audio("UI sounds/castle.wav");
const gameEndSound = new Audio("UI sounds/game-end.wav");
const gameStartSound = new Audio("UI sounds/game-start.wav");
const chessPieceDown = new Audio("UI sounds/chessPieceDown.wav");

const ws = new WebSocket("ws://localhost:8080/game");
const connectionParams = new URLSearchParams(window.location.search);
let roomCode = Number(connectionParams.get("room"));
let clientKey = Number(connectionParams.get("client"));

async function joinRoom(requestedRoomCode) {
  const response = await fetch("http://localhost:8080/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestedRoomCode),
  });

  if (!response.ok) throw new Error("Could not join room");

  const data = await response.json();
  roomCode = requestedRoomCode;
  clientKey = data.key;
  playerColor = data.playerColor;
  playerTurn = playerColor === "b" ? "black" : "white";
  boardIsFlipped = playerColor === "b";
  board = data.board;
  drawBoard();
  drawPieces();
  requestBoard(roomCode);
  return clientKey;
}

async function createRoom() {
  const response = await fetch("http://localhost:8080/room", {
    method: "POST",
  });

  if (!response.ok)
    throw new Error(`Could not create room (${response.status})`);

  const room = await response.json();
  roomCode = room.code;
  clientKey = room.client1;
  playerColor = "w";
  playerTurn = "white";
  boardIsFlipped = false;
  requestBoard(roomCode);
  return { roomCode, clientKey };
}

window.joinRoom = joinRoom;
window.createRoom = createRoom; // globalize function

const startMatchButton = document.getElementById("start-match");
const joinMatchForm = document.getElementById("join-match");
const roomCodeInput = document.getElementById("room-code");
const matchStatus = document.getElementById("match-status");

if (roomCode >= 10000 && roomCode <= 99999) {
  roomCodeInput.value = String(roomCode);
}

startMatchButton.addEventListener("click", async () => {
  startMatchButton.disabled = true;
  matchStatus.textContent = "Creating match...";
  try {
    const room = await createRoom();
    roomCodeInput.value = String(room.roomCode);
    matchStatus.textContent = `Share room code ${room.roomCode} to invite Black`;
  } catch (error) {
    matchStatus.textContent = error.message;
  } finally {
    startMatchButton.disabled = false;
  }
});

joinMatchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const requestedRoomCode = Number(roomCodeInput.value);
  if (!Number.isInteger(requestedRoomCode) || requestedRoomCode < 10000 || requestedRoomCode > 99999) {
    matchStatus.textContent = "Enter a valid five-digit room code";
    return;
  }

  const joinButton = joinMatchForm.querySelector("button[type=submit]");
  joinButton.disabled = true;
  matchStatus.textContent = "Joining match...";
  try {
    await joinRoom(requestedRoomCode);
    matchStatus.textContent = `Joined room ${requestedRoomCode} as Black`;
  } catch (error) {
    matchStatus.textContent = error.message;
  } finally {
    joinButton.disabled = false;
  }
});

window.chessDebug = () => {
  const snapshot = {
    roomCode,
    clientKey,
    board: [...board],
    playerTurn,
    boardIsFlipped,
    heldPieceIndex,
    whitePremoves: [...whitePremoves],
    blackPremoves: [...blackPremoves],
    webSocketState: ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][ws.readyState],
    viewport: { width: viewPortWidth, height: viewPortHeight },
  };

  console.log("[Chess Client Debug]", snapshot);
  console.table(
    snapshot.board.map((piece, index) => ({
      row: Math.floor(index / 8),
      col: index % 8,
      piece,
    })),
  );
  return snapshot;
};

window.chessDebugRooms = async () => {
  const response = await fetch("http://localhost:8080/debug/rooms");
  if (!response.ok)
    throw new Error(`Could not load server rooms (${response.status})`);

  const rooms = await response.json();
  console.log("[Chess Server Debug]", rooms);
  for (const room of rooms) {
    console.log(`Room ${room.code}, turn ${room.clientTurn}`);
    console.table(
      room.board.map((piece, index) => ({
        row: Math.floor(index / 8),
        col: index % 8,
        piece,
      })),
    );
  }
  return rooms;
};

function sendMove(
  roomCode,
  clientKey,
  color,
  piece,
  startRow,
  startCol,
  targetRow,
  targetCol,
) {
  if (ws.readyState === WebSocket.OPEN) {
    const moveData = `${color}${piece}${startRow}${startCol}${targetRow}${targetCol}`;
    const movePayload = {
      room: roomCode,
      client: clientKey,
      message: "move",
      data: moveData,
    };
    console.log("[Move Attempt]", moveData);
    console.log("[Client -> Server]", movePayload);
    ws.send(JSON.stringify(movePayload));
  } else {
    console.warn("Websocket not connected");
  }
}

function requestBoard(roomCode) {
  if (
    !Number.isInteger(roomCode) ||
    roomCode < 10000 ||
    roomCode > 100000 || //  validate codes
    !Number.isInteger(clientKey) ||
    clientKey < 10000 ||
    clientKey > 100000 ||
    ws.readyState !== WebSocket.OPEN
  ) {
    return;
  }

  const requestPayload = {
    room: roomCode,
    client: clientKey,
    message: "reqBoard",
    data: "none",
  };
  ws.send(JSON.stringify(requestPayload));
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        i + 1,
        boardXOffset,
        i * blockSize + boardYOffset + blockSize, // FIX LATER : text moves places when board is clicked. keep working on sound
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
    //illegalMoveSound.play();
    return;
  }

  let start = getPosition(startIndex);
  let target = getPosition(targetIndex);

  if (roomCode) {
    sendMove(
      roomCode,
      clientKey,
      piece[0],
      piece[1],
      start.row,
      start.col,
      target.row,
      target.col,
    );
  }

  requestBoard(roomCode);

  /*
  if (isPlayerInCheck("b")) {
    if (isPlayerInCheckmate("b", "w")) {
      gameEndSound.play(); // Checkmate
    } else {
      checkSound.play();
    }
  } else if (isPlayerInCheck("w")) {
    if (isPlayerInCheckmate("w", "b")) {
      gameEndSound.play();
    } else {
      checkSound.play();
    }
  }
  let pawnPromoted = checkPromotion(targetIndex)
  if (pawnPromoted) {
    promotePawn(targetIndex, "wq") // FIX LATER
    pawnPromoted = false
  }
*/

  // moveSound.play();

  drawBoard();
  drawPieces();
}

function getIndex(x, y) {
  const col = Math.floor((x - boardXOffset) / blockSize);
  const row = Math.floor((y - boardYOffset) / blockSize);

  if (col < 0 || col >= 8 || row < 0 || row >= 8) {
    return "Out of bounds";
  } else {
    return row * 8 + col;
  }
}

function getPosition(index) {
  return {
    row: Math.floor(index / 8),
    col: index % 8,
  };
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


function checkPromotion(index) {
  let promoted = false;
  const piece = board[index];
  if (!piece || (piece !== "wp" && piece !== "bp")) return false;

  const row = Math.floor(index / 8);

  if (!boardIsFlipped) {
    if (piece.startsWith("w") && row == 0) {
      promoted = true;
    }
  } else if (piece.startsWith("b") && row == 0) {
    promoted = true;
  }

  return promoted;
}

function promotePawn(index, newPiece) {
  board[index] = newPiece; // Replace pawn with new piece
  promoteSound.play();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPieces();
}

function previewPossibleMoves(index) {
  const piece = board[index];
  if (!piece || piece[0] !== playerColor) return;

  const possibleMoves = [];

  for (let targetIndex = 0; targetIndex < 64; targetIndex++) {
    if (isLegalMove(piece, index, targetIndex)) {
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

function drawCheck(index) {
  ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
  const checkPos = getPosition(index)
  ctx.fillRect(checkPos.col * blockSize + boardXOffset, checkPos.row * blockSize + boardYOffset, blockSize, blockSize)
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

  heldPieceIndex = getIndex(clickX, clickY);

  if (heldPieceIndex === null || heldPieceIndex === "Out of bounds") {
    heldPieceIndex = null;
  }

  previewPossibleMoves(heldPieceIndex);
});

canvas.addEventListener("mouseup", (event) => {
  const rect = canvas.getBoundingClientRect();
  const releaseX = event.clientX - rect.left;
  const releaseY = event.clientY - rect.top;

  const targetIndex = getIndex(releaseX, releaseY);

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

ws.onopen = () => {
  console.log("[WebSocket] Connected");
  matchStatus.textContent = roomCode && clientKey
    ? "Reconnecting to match..."
    : "Connected. Start or join a match.";
  requestBoard(roomCode);
};

ws.onmessage = (event) => {
  console.log(event)

  let response = JSON.parse(event.data);

  if (response.type === "board" && Array.isArray(response.data)) {
    if (response.playerColor) {
      playerColor = response.playerColor;
      playerTurn = playerColor === "b" ? "black" : "white";
      boardIsFlipped = playerColor === "b";
    }
    board = response.data;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPieces();
    matchStatus.textContent = `Connected to room ${roomCode} as ${playerColor === "b" ? "Black" : "White"}`;
  } else if (response.check === true) {
    let kingInCheck
    for (let x = 0; x < 64; x++) {
      if (board[x] && board[x]?.startsWith(`${response.color}k`)) {
        kingInCheck = board[x]
      }
    }
    drawCheck(kingInCheck)
  } else {
    console.log("[Server -> Client]", response);
  }
};

ws.onerror = (event) => {
  console.error("[WebSocket] Error", event);
};

ws.onclose = (event) => {
  console.log("[WebSocket] Closed", event.code, event.reason);
};

