/* card array */
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];

const cards = []; 

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
console.log(shuffledDeck);

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


resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', function() {
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
        money = money-bet
    }

    playerScore = calculateScore(playerCards);
    dealerScore = calculateScore(dealerCards); 
    document.getElementById('playerValue').innerText = playerScore;
    document.getElementById('dealerValue').innerText = dealerScore;
    resultDisplayReset()
    checkResults();
    count.innerText = `Card count: ${position}`;

}

function updateScores() {
    playerScore = calculateScore(playerCards); 
    dealerScore = calculateScore(dealerCards); 
    document.getElementById('playerValue').innerText = playerScore;
    document.getElementById('dealerValue').innerText = dealerScore;
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
    updateScores();
    checkResults()
    }

    count.innerText = `Card count: ${position}`;

}

standButton = document.getElementById('standButton');
standButton.addEventListener('click', function() {
    stand();
});

function stand() {
    if (checkRoundOver() == true && playerScore > dealerScore) {
        checkResults();
    } else if (playerScore == dealerScore){
        resultDisplay.innerText = "You can't stand with the same value as the dealer!"        
    } else {
        dealerCards.push(dealCard());
        updateScores();
        checkResults();

    }
};


function checkResults() {
    if (playerScore > 21 && dealerScore > 21) {
        money = money+bet; 
        updateMoneyDisplay();
        resultDisplay.innerText = "Both busted. It's a tie!";
        keepBet();
    } else if (playerScore === 21 && dealerScore !== 21) {
        money = money+(bet*2); 
        updateMoneyDisplay();
        resultDisplay.innerText = "Blackjack! You win!";
        keepBet();
    } else if (playerScore > 21 && dealerScore < 21) {
        updateMoneyDisplay();
        resultDisplay.innerText = "You busted. Dealer wins!";
        keepBet();
    } else if (dealerScore === 21 && playerScore !== 21) {
        updateMoneyDisplay();
        resultDisplay.innerText = "Dealer got Blackjack. You lose!";
        keepBet();
    } else if (dealerScore > 21 && playerScore < 21) {
        money = money+(bet*2); 
        updateMoneyDisplay();
        resultDisplay.innerText = "Dealer busted. You win!";
        keepBet();
    } else if (playerScore === 21 && dealerScore === 21) {
        money += bet;
        updateMoneyDisplay();
        resultDisplay.innerText = "Both got Blackjack. It's a tie!";
        keepBet();
    } else if (playerScore > dealerScore && dealerScore >= 17) {
        money = money+(bet*2) ; 
        updateMoneyDisplay();
        resultDisplay.innerText ='You win! dealer cant hit!';
        keepBet();
}}

hitButton = document.getElementById('hitButton');
hitButton.addEventListener('click', function() {
    if (dealerScore >= 17 && playerScore > dealerScore) {
        checkResults();
    } else  {
        hit() 
    }
});

/* game functionality */

function calculateScore(cards) {
    let score = 0;
    let aces = 0;

    for (let card of cards) {
        if (card.value === 'Ace') {
            aces++;
            score += 11; 
        } else if (['Jack', 'Queen', 'King'].includes(card.value)) {
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

function updateMoneyDisplay() {
    document.getElementById('moneyDisplay').innerText = `Money: $${money}`;
}

document.getElementById('betButton').addEventListener('click', function () {
    const betInput = parseInt(document.getElementById('betAmount').value);

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
        bet += bet
    }
});

/* keepBet */


let keepBox = document.getElementById('keepBet');

function keepBet() {
    if (keepBox.checked) {
        money += bet;
        bet = 10;
        updateMoneyDisplay();

    } else {
        bet = 0;
    }
}

const resultDisplay = document.getElementById('resultDisplay');

function resultDisplayReset() {
    resultDisplay.innerText = "Result:"; 
}

let roundOver = false;
function checkRoundOver() {
    if (playerScore >= 21 || dealerScore >= 21) {
        roundOver = true;
    } else if (dealerScore >= 17 && playerScore > dealerScore) {
        roundOver = true;
    } else {
        roundOver = false;
    }
    return roundOver;
}


shuffleButton = document.getElementById('shuffleButton');
shuffleButton.addEventListener('click', function() {
    shuffledDeck = shuffleArray(cards); 
    position = 0;
    resultDisplayReset()
    updateScores();
    count.innerText = 'Card count: 0';
    resultDisplay.innerText = "Deck shuffled. Ready to play!";
});

cardCount = document.getElementById('count');