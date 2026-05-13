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

const random = (min, max) => Math.random() * (max - min) + min;
const randomColor = () =>
  `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;


//contoller
const controller = {
  w: false, 
  s: false, 
  a: false ,
  d: false
}

//map variables
const spectators = [];

const defaultGrid = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

let tileWidth = viewPortWidth / defaultGrid[0].length;
let tileHeight = viewPortHeight / defaultGrid.length;

const crowdSize = 50 // 50% of max

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
      this.x + this.size / 2, // x center
      this.y - this.size / 4, // y center
      this.size / 3, // radiusX
      this.size / 3, // radiusY
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

class obstacle {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

class Map {
  constructor(tileGrid) {
    this.tileGrid = tileGrid;
  }
  drawMap() {
    let xOffset = tileWidth / 2;
    let yOffset = tileHeight / 2;
    this.tileGrid.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        if (tile === 0 || tile === 1) {
          // Different terrain types
          ctx.fillStyle = "green";
          ctx.fillRect(
            colIndex * tileWidth,
            rowIndex * tileHeight,
            tileWidth,
            tileHeight,
          );
        }
      });
    });

    if (spectators.length > 0) {
      for (let s of spectators) {
        s.drawSpectator();
      }
    }

    myCar.drawCar()
  }
}

class Car {
  constructor(x, y, height, width , power, grip, color,  speed, rotation){ 
  this.color = color 
  this.height = height
  this.width = width 
  this.power = power // speed of engine
  this.grip = grip // between 0-1, 0.01 being most slipper
  this.x = x,
  this.y = y
  this.speed = speed //current speed of car
  this.angle = rotation

  }

  drawCar() {
  ctx.save();
  ctx.translate(this.x, this.y); //rotates canvas then draws
  ctx.rotate(this.angle);
  ctx.fillStyle = this.color;
  ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
  ctx.restore(); // unrotates canvas so only cars are rotated.
}

  update() {
     let dragCoefficient = 0.98 - (this.grip * 0.15); 
    this.speed *= dragCoefficient;
    console.log(dragCoefficient)
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    if (controller["w"]) {
      this.speed += this.power
    } else if (controller["s"]) {
      this.speed -= this.power
    } else if (controller["a"]) {
      this.angle += 1
    }
  }
}

let mapInstance = new Map(defaultGrid);

function setup() {
  let currentMap = mapInstance.tileGrid;

  currentMap.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile === 1) {
        let xOffset = tileWidth / 2;
        let yOffset = tileHeight / 2;
        // Calculate position based on grid index
        for (let i=0;i<100;i++) { // 100 max population 
        if (random(0,100) < crowdSize) {
        const x = random(colIndex * tileWidth, colIndex * tileWidth + tileWidth)
        const y = random(rowIndex * tileHeight, rowIndex * tileHeight + tileHeight);
        spectators.push(new Spectator(x, y));
           }        
        }
      } else if (tile === 2) {
      }
    });
  });
}

function draw() {
  ctx.fillStyle = "rgb(220, 220, 220)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  mapInstance.drawMap();
  myCar.drawCar()
  myCar.update()

}

const myCar = new Car(200,200, 80, 150, 0.5,0.01, "red", 0, 24);
myCar.speed = 0;
myCar.angle = 180; // 45 degrees

window.addEventListener('keydown', (event) => {
    let key = event.key; 
    if (key === "w") {
        controller[key] = true;
    } else if (key === "s") {
      controller[key] = true 
    } else if (key === "a") {
      controller[key] = true 
    } else if (key === "d") {
      controller[key] = true
    }
});

window.addEventListener('keyup', (event) => {
    let key = event.key;
    if (key === "w") {
        controller[key] = false;
    } else if (key === "s") {
      controller[key] = false 
    } else if (key === "a") {
      controller[key] = false 
    } else if (key === "d") {
      controller[key] = false
    }
});

function gameLoop() {
  draw()

  requestAnimationFrame(gameLoop)
}


requestAnimationFrame(gameLoop)
