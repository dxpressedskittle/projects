document.addEventListener("DOMContentLoaded", function () {
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
  let pos = 0; // Variable for position of displaying players card
  let playerCards = document.getElementById("playerCards");
  let dealerCards = document.getElementById("dealerCards");

  for (let suit of suits) {
    for (let value of values) {
      cards.push({ suit, value });
    }
  }

  let card = "";

  card = '<div class="card"></div>';
  playerCards.innerHTML += card;
});
