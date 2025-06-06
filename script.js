// Global functions
//get random integer between min and max
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Adds text to a anything

function addText(size, text, div) {
  let newText = document.createElement("div");
  newText.style.fontSize = size;
  newText.innerText = text;
  div.appendChild(newText);
}
