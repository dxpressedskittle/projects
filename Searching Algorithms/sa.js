
const canvas = document.getElementById("canvas");
const viewPortWidth = document.documentElement.clientWidth;
const viewPortHeight = document.documentElement.clientHeight;
const vw = viewPortWidth / 100;
const vh = viewPortHeight / 100;
const ctx = canvas.getContext("2d");
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;

const listLength = 100;
const listMin = 1;
const listMax = 100;


const unsortedList = generateList(listMin, listMax, listLength);
const scaledList = [];

const functionTime = timeFunctionExecution(bubbleSort, unsortedList);

const blockMargin = 0.5 * vw;
const yOffset = 5 * vh;
const maxBlockHeight = 143;
const blockWidth = (60 * vw) / unsortedList.length;
const blockFontSize = blockWidth / 2

let delayMS = 1 
let swapCount = 0
let stepCount = 0;


class Button {
  constructor(x, y, width, height, label, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.label = label;
    this.color = color;
  }

  draw(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);

    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "18px Arial";
    context.fillText(
      this.label,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }

  // Method to check if a point is inside the button
  isClicked(mouseX, mouseY) {
    return (
      mouseX >= this.x &&
      mouseX <= this.x + this.width &&
      mouseY >= this.y &&
      mouseY <= this.y + this.height
    );
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


async function bubbleSort(list, delayMS = 100) {
  
  let len = list.length;
  swapCount = 0;
  stepCount = 0;

  for (let i = 0; i < len; i++) {
    // After each pass the largest element is at the end, so i can
    // reduce the inner loop by i for a small optimization
    for (let j = 0; j < len - i - 1; j++) {
      // each comparison is a step
      stepCount++;
      // Swap if the current element is greater than the next
      if (Number(list[j]) > Number(list[j + 1])) {
        // swap scaled list values
        let temp = list[j];
        list[j] = list[j + 1];
        list[j + 1] = temp;

        // keep the displayed (unsortedList) values in sync so labels
        // continue to match their blocks
        let tempLabel = unsortedList[j];
        unsortedList[j] = unsortedList[j + 1];
        unsortedList[j + 1] = tempLabel;
        swapCount++;

        drawBlocks(scaledList);
        await delay(delayMS);
      }
    }
  }
}

async function quickSort(list, start = 0, end = list.length - 1, delayMS = 100) {
  if (start >= end) return;


  let index = await partition(list, start, end, delayMS);


  await quickSort(list, start, index - 1, delayMS);
  await quickSort(list, index + 1, end, delayMS);
}

async function partition(list, start, end, delayMS) {
  const pivotValue = list[end];
  let pivotIndex = start;

  for (let i = start; i < end; i++) {
    if (list[i] < pivotValue) {
      // Swap elements
      [list[i], list[pivotIndex]] = [list[pivotIndex], list[i]];
      pivotIndex++;
    }
    
    // Draw the entire global list so the visualization stays full size
    drawBlocks([...list]); 
    await delay(delayMS);
  }

  // Swap the pivot into its final place
  [list[pivotIndex], list[end]] = [list[end], list[pivotIndex]];
  
  drawBlocks([...list]);
  await delay(delayMS);

  return pivotIndex;
}

/*
async function quickSort(list, delayMS = 100) {
  const len = list.length

  if (len <= 1) {
    return list
  }
  
  const p = list[len - 1]

  const leftArr = []
  const rightArr = []
  for (let i = 0; i < len - 1; i++){
    if (list[i] <= p) {
      leftArr.push(list[i])
    } else {
      rightArr.push(list[i])
    }

    drawBlocks([...leftArr, ...rightArr])
    await delay(delayMS)
  }
  return [...quickSort(leftArr), p,  ...quickSort(rightArr)]
}
*/



function scaleList(list, destination = []) {
  destination.length = 0;
  const largestNum = Math.max(...list);
  for (let i = 0; i < list.length; i++) {
    const scaledValue = (Number(list[i]) / largestNum) * maxBlockHeight;
    destination.push(Number(scaledValue.toFixed(2)));
  }
}

function generateList(min, max, length) {
  const randomList = [];
  for (let i = 0; i < length; i++) {
    const randomNum = Math.random() * (max - min) + min;
    randomList.push(Math.round(randomNum));
  }
  return randomList;
}

scaleList(unsortedList, scaledList); // only work with scaled list to draw


function drawBlocks(list = [1,2,3,4,5]) {
    
  ctx.clearRect(0, 0, 60 * vw, canvas.height);

  for (let i = 0; i < list.length; i++) {
    ctx.font = `${blockFontSize}px Arial`;
    blockHeight = list[i] * 5;
    ctx.fillStyle = "green";
    ctx.fillRect(blockWidth * i, canvas.height - yOffset, blockWidth, -blockHeight); 

    // Box border
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(blockWidth * i, canvas.height - 5 * vh);
    ctx.lineTo(blockWidth * i, canvas.height - (blockHeight + yOffset));
    ctx.lineTo(blockWidth * i + blockWidth,canvas.height - (blockHeight + yOffset));
    ctx.lineTo(blockWidth * i + blockWidth, canvas.height - 5 * vh);
    ctx.stroke();

    // Box amount
    ctx.fillStyle = "rgba(0, 255, 0, 1)";
    ctx.fillText(unsortedList[i], blockWidth * i + 8, canvas.height - 5 * vh);
    // use non-scaled value

    // Box number
    ctx.font = `${blockFontSize}px Arial`;
    ctx.fillStyle = "black";
    ctx.fillText(i+1, (blockWidth * i) + blockWidth / 2, canvas.height - 2 * vh);

  }
}

function drawMenu() {
  ctx.fillStyle = "rgba(12, 20, 35, 0.75)";
  ctx.fillRect(60 * vw, canvas.height, 40 * vw, -canvas.height); // draw menu background

  ctx.fillStyle = "#1f2937"
  ctx.fillRect(61 * vw, 5 * vh, 38 * vw, 15 * vh); // draw menu box

  ctx.fillStyle = "white";
  ctx.font = `bold ${3 * vh}px Arial`;
  ctx.fillText(`Swaps: ${swapCount}`, 62 * vw, 9.5 * vh);
  ctx.fillText(`Steps: ${stepCount}`, 62 * vw, 13.2 * vh);
  ctx.fillText(`Delay: ${delayMS} ms`, 62 * vw, 16.9 * vh);
  ctx.fillText(`Function execution time: ${functionTime.toFixed(2)} ms`, 72 * vw, 9.5 * vh);


  const buttons = [
 
  ]

  for (let button of buttons) {
    button.draw(ctx);
  }


  requestAnimationFrame(drawMenu);
}

function timeFunctionExecution(func, ...args) {
  const startTime = performance.now();
  func(...args);
  const endTime = performance.now();
  return endTime - startTime;
}






async function algorithmVisualizer(algorithm = 'bubbleSort', list, delayMS = 100) {
  
  switch (algorithm) {
    case 'bubbleSort':
      sortedList = await bubbleSort(list, delayMS);
      break;
    case 'quickSort':
      await quickSort(list, 0, list.length - 1, delayMS);
      console.log(scaledList)
      break;
  }


}

algorithmVisualizer('quickSort', scaledList, delayMS);



drawMenu();

