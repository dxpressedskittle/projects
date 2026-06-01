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
const turnSpeed = 0.05
const wheelBase = 2.5 // width of wheel (maybe change later to add to car class)

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
    this.tileGrid.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        if (tile === 0 || tile === 1) {
          // Different terrain types
          ctx.fillStyle = "black";
          ctx.fillRect(
            colIndex * tileWidth, rowIndex * tileHeight, tileWidth, tileHeight,
          );
        }

          ctx.fillStyle = "green";
          ctx.fillRect(
            colIndex * tileWidth+0.25, rowIndex * tileHeight+0.25, tileWidth, tileHeight,
          );

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
  constructor(x, y, power, grip, color,  speed, rotation){ 
  this.color = color 
  this.power = power // speed of engine
  this.grip = grip // between 0-1, 0.01 being most slippery
  this.x = x,
  this.y = y
  this.speed = speed // current speed of car
  this.angle = rotation
  this.velX = 0;
  this.velY = 0;
  this.steeringAngle = 0 // agle of steering wheel
  this.speedInput = 0 // (how fast you want to go)

  this.model = new Image()
  this.model.src = '/Games/Drift 2D/models/car_models/sports2.png'
  this.isLoaded = false 
  this.model.addEventListener('load', () => {
    this.isLoaded = true 
  })
  }

  drawCar() {
  if (!this.isLoaded) return
  ctx.save();
  ctx.translate(this.x, this.y); 
  ctx.rotate(Math.PI / 2); // rotate by 90 to account for pngs
  ctx.rotate(this.angle); //rotates canvas then draws
  ctx.drawImage(this.model, -this.width / 2, -this.height / 2);
  ctx.restore(); // unrotates canvas so only cars are rotated. 
  

}

update() {
if (controller["w"]) {
    this.speedInput += this.power;
}
if (controller["s"]) {
    this.speedInput -= this.power;
}

// Clamp input speed (e.g., max forward/backward speed before physics apply)
  const maxSpeed = 5;
    const currentSpeed = Math.sqrt(this.velX ** 2 + this.velY ** 2);
    
    if (currentSpeed > maxSpeed) {
        // Normalize velocity vector and scale to maxSpeed
        const scale = maxSpeed / currentSpeed;
        this.velX *= scale;
        this.velY *= scale;
    }

// Calculate rotation speed based on steering angle
if (this.speed > 0) {
  let rotationSpeed = turnSpeed * Math.PI / 180;
  if (controller["a"]) {
      this.steeringAngle -= rotationSpeed;
  }
  if (controller["d"]) {
      this.steeringAngle += rotationSpeed;
  }
}

// Clamp steering angle to prevent over-steering (e.g., +/- 45 degrees)
const maxSteering = Math.PI / 4; // ~45 degrees
this.steeringAngle = Math.max(-maxSteering, Math.min(maxSteering, this.steeringAngle));

// spring steering wheel back to 0 when no input
if (!controller["a"] && !controller["d"]) {
    let returnSpeed = 0.001; // Adjust for how fast the wheel centers
    if (this.steeringAngle > 0) {
        this.steeringAngle -= returnSpeed;
        if (this.steeringAngle < 0) this.steeringAngle = 0; // Prevent overshoot
    } else if (this.steeringAngle < 0) {
        this.steeringAngle += returnSpeed;
        if (this.steeringAngle > 0) this.steeringAngle = 0; // Prevent overshoot
    }
}

// 3. Turn Radius & Angular Velocity
const tanVal = Math.tan(this.steeringAngle);
let turnRadius;

if (Math.abs(tanVal) < 0.001) {
    // If steering is nearly 0, radius is effectively infinite (no rotation)
    turnRadius = Infinity; 
} else {
    turnRadius = wheelBase / tanVal;
}

// Calculate angular velocity (how fast the car rotates)
let angularVelocity = 0;
if (turnRadius !== Infinity && Math.abs(turnRadius) > 0) {
    // Use actual speed (from velocity vector) to determine rotation speed
    const currentSpeed = Math.sqrt((this.velX**2) + (this.velY**2));
    angularVelocity = currentSpeed / turnRadius;
}

// Apply rotation to car angle
this.angle += angularVelocity;

let intendedVelX = Math.cos(this.angle) * this.speedInput;
let intendedVelY = Math.sin(this.angle) * this.speedInput;

// drag + Grip 
let drag = 0.98; // Base air resistance
this.velX *= drag;
this.velY *= drag;

// Calculate Lerp Factor (0.0 = no traction, 1.0 = full grip)
// Multiplier (0.2) controls how snappy the grip feels
let lerpFactor = this.grip * 0.2;

// Blend current velocity with intended velocity
this.velX = this.velX + (intendedVelX - this.velX) * lerpFactor;
this.velY = this.velY + (intendedVelY - this.velY) * lerpFactor;

this.x += this.velX;
this.y += this.velY;


this.speed = Math.sqrt((this.velX**2) + (this.velY**2));

console.log("X:", this.x.toFixed(2), "Y:", this.y.toFixed(2), "Speed:", this.speed.toFixed(2), "Steering angle:", this.steeringAngle.toFixed(2), "speed input:", this.speedInput);
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

let x = 200
let y = 200
let power = 100
let grip = 0.01
let color = "red"
let speed = 0 
let rotation = 24

const myCar = new Car(x,y,power,grip,color,speed,rotation);
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
