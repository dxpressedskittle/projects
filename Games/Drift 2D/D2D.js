// Viewport variables
const viewPortWidth = window.innerWidth;
const viewPortHeight = window.innerHeight;
const vw = viewPortWidth / 100
const vh = viewPortHeight / 100

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;


const random = (min, max) => Math.random() * (max - min) + min;
const randomColor = () => `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;

//map variables



class Spectator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.shirtColor = randomColor();
        this.size = random(10, 20);
    }

    drawSpectator() {
        // Draw shirt
        ctx.fillStyle = this.shirtColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // Draw head
        ctx.fillStyle = "rgb(255, 218, 185)";
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.size / 2,                // x center
            this.y - this.size / 4,                // y center
            this.size / 3,                         // radiusX
            this.size / 3,                         // radiusY
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

class obstacle {
    constructor(type, x, y) {
        this.type = type
        this.x = x 
        this.y = y
    }
}

class map {
    constructor(tileGrid) {
        this.tileGrid = tileGrid
    }

    drawMap() {
    let xOffset = tileWidth / 2
    let yOffset = tileHeight / 2
    this.tileGrid.forEach((row, rowIndex) => {
        row.forEach((title, colIndex) => {
            if (title === 0) {
        
            ctx.fillStyle = green 
            ctx.fillRect(rowIndex * tileWidth + xOffset, colIndex * tileHiehgt + yOffset, tileWidth, tileHeight)
      }
    });
  });
    }
}


const spectators = [];
const defaultGrid = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 1], 
  [1, 2, 0, 0, 0, 2, 1], 
  [1, 2, 0, 0, 0, 2, 1],
  [1, 2, 0, 0, 0, 0, 0]
]

let tileWidth = viewPortWidth / defaultGrid[0].length
let tileHeight = viewPortHeight / defaultGrid.length

function setup() {
    let map = new Map(defaultGrid); 
    let currentMap = map.tileGrid


  currentMap.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile === 1) {
        let xOffset = tileWidth / 2
        let yOffset = tileHeight / 2
        // Calculate position based on grid index
        const x = (colIndex * tileWidth) + xOffset;
        const y = (rowIndex * tileHeight) + yOffset;
        console.log(colIndex,rowIndex)
        spectators.push(new Spectator(x, y));
      } else if (tile === 2) {

      }
    });
  });

  
}

function draw() {
    ctx.fillStyle = "rgb(220, 220, 220)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let s of spectators) {
        s.drawSpectator();
    }
}

setup();
draw();
