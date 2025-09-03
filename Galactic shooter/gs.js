// Viewport variables
const viewPortWidth = document.documentElement.clientWidth;
const viewPortHeight = document.documentElement.clientHeight;
const vh = viewPortHeight / 100;
const vw = viewPortWidth / 100;

// Canvas variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;

// Animation variables
let animationID;
let imageLoaded = false;

// Img variables
let ship = new Image()

ship.src = "imgs/Galactic Shooter/ship.png"

