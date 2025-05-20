const input = document.getElementById("input")
let numbers = []
let letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
let wordArray = []



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

for (let i = 1; i < 51; i++) {
    numbers.push(i)
}


let newWord = ""

function createWord() {
    let length = getRandomInt(4, 8)
    for (let i=0; i < length; i++) {  
        let newletter = letters[getRandomInt(0, 25)]
        newWord += newletter
    }
    wordArray.push(newWord)
    newWord = ""
}


for (let i = 0; i < 100; i++) {
    createWord();
}

input.addEventListener('change', function(){
    inputValue = document.getElementById("input")
    search(wordArray, inputValue)
    
})


function search(array, word) {
    let mainString = ""
    let searchString = ""
    let contains = ""
    let sortedArray = []

    array.forEach(element => {
        mainString = element
        searchString = word;
        if (mainString.includes(searchString)) {
            console.log("Yes")
        }

        if (contains) {
            sortedArray.push(searchString)
            
        }



        
    });
    console.log(sortedArray)
    
}


