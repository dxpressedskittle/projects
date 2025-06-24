/* card array */
const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "Jack",
  "Queen",
  "King",
  "Ace",
];
const cards = [];
pCards = document.getElementById("playerCards");
dCards = document.getElementById("dealerCards");
let pos = 0; // Variable for position of displaying players card

for (let suit of suits) {
  for (let value of values) {
    cards.push({ suit, value });
  }
}
/* end card array */

/* dealcard() */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let shuffledDeck = shuffleArray(cards);
let position = 0;

function dealCard() {
  if (position < shuffledDeck.length) {
    return shuffledDeck[position++];
  } else {
    shuffledDeck = shuffleArray(cards);
    position = 0;
    return shuffledDeck[position++];
  }
}
/* end dealcard() */

/* Declare global variables */
let playerCards = [];
let dealerCards = [];
let playerScore = 0;
let dealerScore = 0;

/* game functionality */

resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", function () {
  resetGame();
});

function resetGame() {
  playerScore = 0;
  dealerScore = 0;
  playerCards = [];
  dealerCards = [];

  for (let i = 0; i < 2; i++) {
    playerCards.push(dealCard());
    dealerCards.push(dealCard());
  }

  if (keepBox.checked) {
    money = money - bet;
  }

  pos = 0;
  playerScore = calculateScore(playerCards);
  dealerScore = calculateScore(dealerCards);
  document.getElementById("playerValue").innerText = playerScore;
  document.getElementById("dealerValue").innerText = dealerScore;
  resultDisplayReset();
  checkResults();
  count.innerText = `Card count: ${position}`;
  pCards.innerText = `
    Card ${pos + 1}: ${playerCards[pos].value} of ${playerCards[pos].suit}`;
  dCards.innerText = `
    Card ${pos + 1}: ${dealerCards[pos].value} of ${dealerCards[pos].suit}`;
  pos++;
  pCards.innerText += `
    Card ${pos + 1}: ${playerCards[pos].value} of ${playerCards[pos].suit}`;
  dCards.innerText += `
    Card ${pos + 1}: ${dealerCards[pos].value} of ${dealerCards[pos].suit}`;
  pos++;

  updateMoneyDisplay();
}

function updateScores() {
  playerScore = calculateScore(playerCards);
  dealerScore = calculateScore(dealerCards);
  document.getElementById("playerValue").innerText = playerScore;
  document.getElementById("dealerValue").innerText = dealerScore;
}

function hit() {
  if (checkRoundOver() == true) {
    checkResults();
  } else if (dealerScore >= 17) {
    playerCards.push(dealCard());
    updateScores();
    checkResults();
  } else {
    playerCards.push(dealCard());
    dealerCards.push(dealCard());
    addCard();
    updateScores();
    checkResults();
  }

  count.innerText = `Card count: ${position}`;
}

standButton = document.getElementById("standButton");
standButton.addEventListener("click", function () {
  stand();
});

function stand() {
  if (playerScore < dealerScore) {
    resultDisplay.innerText =
      "You can't stand when the dealer has a higher score! Hit again!";
  } else if (dealerScore == playerScore) {
    resultDisplay.innerText =
      "You can't stand when the dealer has the same score! Hit again!";
  } else if (dealerScore < playerScore && playerScore > 17) {
    dealerCards.push(dealCard());
    checkResults();
  }
}

function checkResults() {
  if (playerScore > 21 && dealerScore > 21) {
    money = money + bet;
    updateMoneyDisplay();
    resultDisplay.innerText = "Both busted. It's a tie!";
    keepBet();
  } else if (playerScore === 21 && dealerScore !== 21) {
    money = money + bet * 2;
    updateMoneyDisplay();
    resultDisplay.innerText = "Blackjack! You win!";
    keepBet();
  } else if (playerScore > 21 && dealerScore < 21) {
    updateMoneyDisplay();
    resultDisplay.innerText = "You busted. Dealer wins!";
    keepBet();
  } else if (dealerScore === 21 && playerScore > 21) {
    updateMoneyDisplay();
    resultDisplay.innerText = "Dealer got Blackjack. You lose!";
    keepBet();
  } else if (dealerScore > 21 && playerScore < 21) {
    money = money + bet * 2;
    updateMoneyDisplay();
    resultDisplay.innerText = "Dealer busted. You win!";
    keepBet();
  } else if (playerScore === 21 && dealerScore === 21) {
    money += bet;
    updateMoneyDisplay();
    resultDisplay.innerText = "Both got Blackjack. It's a tie!";
    keepBet();
  } else if (playerScore > dealerScore && dealerScore >= 17) {
    money = money + bet * 2;
    updateMoneyDisplay();
    resultDisplay.innerText = "You win! dealer cant hit!";
    keepBet();
  }
}

hitButton = document.getElementById("hitButton");
hitButton.addEventListener("click", function () {
  if (dealerScore >= 17 && playerScore > dealerScore) {
    checkResults();
  } else {
    hit();
  }
});

/* game functionality */

function calculateScore(cards) {
  let score = 0;
  let aces = 0;

  for (let card of cards) {
    if (card.value === "Ace") {
      aces++;
      score += 11;
    } else if (["Jack", "Queen", "King"].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
}

/* money */

let money = 1000;
let bet = 0;
let type = "";

function updateMoneyDisplay() {
  if (money <= 0) {
    resultDisplay.innerText = "You are out of money! Please reset the game.";
    document.getElementById("betButton").disabled = true;
    document.getElementById("hitButton").disabled = true;
    document.getElementById("standButton").disabled = true;
  } else {
    document.getElementById("betButton").disabled = false;
    document.getElementById("hitButton").disabled = false;
    document.getElementById("standButton").disabled = false;
  }

  if (typeof money == "string") {
    money = parseInt(money);
  } else if (typeof money == "number") {
    money = money;
    document.getElementById("moneyDisplay").innerText = `Money: $${money}`;
  } else {
    resultDisplay.innerText = "Error: Invalid money type.";
  }
}

document.getElementById("betButton").addEventListener("click", function () {
  const betInput = parseInt(document.getElementById("betAmount").value);

  if (isNaN(betInput) || betInput <= 0) {
    resultDisplay.innerText = "Please enter a valid positive bet amount.";
  } else if (betInput > money) {
    resultDisplay.innerText = "You don't have enough money to place that bet.";
  } else {
    bet = betInput;
    money -= bet;
    updateMoneyDisplay();
    resultDisplay.innerText = `You placed a bet of $${bet}. Your remaining balance is $${money}.`;
  }

  if (bet !== 0) {
    bet += bet;
  }
});

/* keepBet */

let keepBox = document.getElementById("keepBet");

function keepBet() {
  if (keepBox.checked) {
    money += bet;
    bet = 10;
    updateMoneyDisplay();
  } else {
    bet = 0;
  }
}

const resultDisplay = document.getElementById("resultDisplay");

function resultDisplayReset() {
  // clear results
  resultDisplay.innerText = "Result:";
}

let roundOver = false;
function checkRoundOver() {
  if (dealerScore >= 17 && playerScore > dealerScore) {
    roundOver = true;
  } else if (dealerScore > 21 && playerScore < 21) {
    roundOver = true;
  } else if (playerScore > 21 && dealerScore < 21) {
    roundOver = true;
  } else if (dealerScore === 21 && playerScore > 21) {
    roundOver = true;
  } else if (playerScore === 21 && dealerScore !== 21) {
    roundOver = true;
  } else if (dealerScore === 21 && playerScore === 21) {
    roundOver = true;
  } else if (playerScore > dealerScore && dealerScore >= 17) {
    roundOver = true;
  } else {
    roundOver = false;
  }
  return roundOver;
}

shuffleButton = document.getElementById("shuffleButton");
shuffleButton.addEventListener("click", function () {
  //shuffle addEventListener
  shuffledDeck = shuffleArray(cards); // uses the array i used to shuffle cards originally agian
  position = 0; // resets pos
  resultDisplayReset(); // clears result
  updateScores(); // gives new scores
  count.innerText = "Card count: 0";
  resultDisplay.innerText = "Deck shuffled. Ready to play!";
});

function startGame() {
  resetGame();
  resultDisplayReset();
  resultDisplay.innerText =
    "Welcome to Blackjack! Place your bet or play for free to try it out!";
  updateScores();
  count.innerText = position;
  checkResults();
}

function addCard() {
  if (pos + 1 < 63) {
    if (checkRoundOver() == false) {
      if (dealerScore >= 17) {
        pCards.innerText += `
            Card ${pos + 1}: ${playerCards[pos].value} of ${
          playerCards[pos].suit
        }`;
        pos++;
      } else if (dealerScore < 17) {
        pCards.innerText += `
            Card ${pos + 1}: ${playerCards[pos].value} of ${
          playerCards[pos].suit
        }`;
        dCards.innerText += `
            Card ${pos + 1}: ${dealerCards[pos].value} of ${
          dealerCards[pos].suit
        }`;
        pos++;
      }
    } else {
      checkResults();
    }
  } else {
    // if card count is over 64
    pos = 0;
    addCard();
  }
}

cardCount = document.getElementById("count");
startGame();


