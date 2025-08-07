document.addEventListener("DOMContentLoaded", function () {
  const resultDisplay = document.getElementById("result");
  const input = document.getElementById("input");
  let result = document.getElementById("results");
  let letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  let wordArray = [];

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
 

  let newWord = "";

  function createWord() {
    let length = getRandomInt(4, 8);
    for (let i = 0; i < length; i++) {
      let newletter = letters[getRandomInt(0, 25)];
      newWord += newletter;
    }
    wordArray.push(newWord);
    newWord = "";
  }

  for (let i = 0; i < 1000; i++) {
    createWord();
  }

  function search(array, word) {
    let mainString = "";
    let searchString = "";
    let contains = "";
    let sortedArray = [];

    array.forEach((element) => {
      mainString = element;
      searchString = word;
      if (mainString.includes(searchString)) {
        sortedArray.push(mainString);
      }
    });
    console.log(sortedArray);
  }
  let inputValue = "";

  input.addEventListener("input", function () {
    inputValue = document.getElementById("input").value;
    search(wordArray, inputValue);
    
  });
});


function showText() {
  for (i=0;i<sortedArray.length;i++) {
    div = document.createElement("div")
    div.innerText = wordArray[i]
    result.appendChild(div)
  }
}


