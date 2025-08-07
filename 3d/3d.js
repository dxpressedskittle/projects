// Viewport variables
const viewPortWidth = document.documentElement.clientWidth;
const viewPortHeight = document.documentElement.clientHeight;
const vh = viewPortHeight / 100;
const vw = viewPortWidth / 100;

// Canvas variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("webgl");
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;
