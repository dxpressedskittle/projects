import { getDigit, mostDigits, digitCount } from "./saHelpers.js";

const canvas = document.getElementById("canvas");
const viewPortWidth = document.documentElement.clientWidth;
const viewPortHeight = document.documentElement.clientHeight;
const vw = viewPortWidth / 100;
const vh = viewPortHeight / 100;
const ctx = canvas.getContext("2d");
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;
const textFontSize = Math.max(12, Math.min(viewPortWidth / 65, 25));

const listLength = 152;
const listMin = 1;
const listMax = 1000;

const unsortedList = generateList(listMin, listMax, listLength);
let isSorting = false;
const scaledList = [];
const stateList = new Array(listLength).fill("unsorted"); // used to color blocks

let functionTime = 0;

const blockMargin = 0.5 * vw;
const yOffset = 5 * vh;
const maxBlockHeight = 143;
const blockWidth = (60 * vw) / unsortedList.length;
const blockFontSize = viewPortWidth/ 150;

let delayMS = 5;
let swapCount = 0;
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
      this.y + this.height / 2,
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

const buttons = [
  new Button(62 * vw, 32 * vh, 150, 50, "Bubble Sort", "#4ade80"),
  new Button(62 * vw, 40 * vh, 150, 50, "Quick Sort", "#60a5fa"),
  new Button(62 * vw, 48 * vh, 150, 50, "Radix Sort", "#bd1eccff"),

  new Button(82 * vw, 52 * vh, 150, 50, "Shuffle List", "#ec4545ff"),
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bubbleSort(list, delayMS = 100) {
  let len = list.length;
  swapCount = 0;
  stepCount = 0;

  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      stepCount++;

      // mark active
      stateList[j] = "active";
      stateList[j + 1] = "active";

      if (list[j] > list[j + 1]) {
        [list[j], list[j + 1]] = [list[j + 1], list[j]];
        swapCount++;
      }

      drawBlocks(list, stateList);
      await delay(delayMS);

      stateList[j] = "unsorted";
      stateList[j + 1] = "unsorted";
    }

    stateList[len - i - 1] = "sorted";
  }
}

async function quickSort(
  list,
  start = 0,
  end = list.length - 1,
  delayMS = 100,
) {
  if (start >= end) {
    if (start >= 0 && start < list.length) {
      stateList[start] = "sorted";
    }
    return;
  }

  let index = await partition(list, start, end, delayMS);

  // Mark pivot as sorted (it's now in final position)
  stateList[index] = "sorted";

  await quickSort(list, start, index - 1, delayMS);
  await quickSort(list, index + 1, end, delayMS);
}

async function partition(list, start, end, delayMS) {
  const pivotValue = list[end];
  let pivotIndex = start;

  stateList[end] = "active"; // mark pivot

  for (let i = start; i < end; i++) {
    stepCount++;
    stateList[i] = "active";
    stateList[pivotIndex] = "active";

    let swapped = false;

    if (list[i] < pivotValue) {
      [list[i], list[pivotIndex]] = [list[pivotIndex], list[i]];
      pivotIndex++;
      swapped = true;
      swapCount++;
    }

    drawBlocks(list, stateList);
    await delay(delayMS);

    // reset states
    stateList[i] = "unsorted";

    if (swapped) {
      stateList[pivotIndex - 1] = "unsorted";
    } else {
      stateList[pivotIndex] = "unsorted";
    }
  }

  // place pivot box in correct position
  [list[pivotIndex], list[end]] = [list[end], list[pivotIndex]];
  swapCount++;

  stateList[end] = "unsorted";
  stateList[pivotIndex] = "active";

  drawBlocks(list, stateList);
  await delay(delayMS);

  return pivotIndex;
}

async function radixSort(list, delayMS = 100) {
  let maxDigits = mostDigits(list); // Helper to find max length
  swapCount = 0; // In Radix, this tracks "placements"
  stepCount = 0;

  for (let k = 0; k < maxDigits; k++) {
    // Create 10 buckets
    let digitBuckets = Array.from({ length: 10 }, () => []);

    for (let i = 0; i < list.length; i++) {
      stepCount++;

      // Highlight current element being inspected
      stateList[i] = "active";
      drawBlocks(list, stateList);
      if (delayMS != 0) {
        await delay(delayMS);
      }

      let digit = getDigit(list[i], k);
      digitBuckets[digit].push(list[i]);

      stateList[i] = "unsorted";
    }

    // Reconstruct list from buckets
    let idx = 0;
    for (let b = 0; b < digitBuckets.length; b++) {
      for (let val of digitBuckets[b]) {
        list[idx] = val;

        // visual feedback as elements are placed back
        stateList[idx] = "active";
        drawBlocks(list, stateList);

        if (delayMS != 0) {
          await delay(delayMS);
        }

        stateList[idx] = k === maxDigits - 1 ? "sorted" : "unsorted";
        idx++;
      }
    }
  }
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

function drawBlocks(list, states = []) {
  ctx.clearRect(0, 0, 60 * vw, canvas.height);

  for (let i = 0; i < list.length; i++) {
    let color = "green"; // default

    if (states[i] === "active") color = "red";
    else if (states[i] === "sorted") color = "rgba(14, 173, 9, 1)";
    else if (states[i] === "unsorted") color = "grey";
    else if (states[i] === "bright") color = "rgba(13, 214, 23, 1)";

    const blockHeight = list[i] * 5;

    ctx.fillStyle = color;
    ctx.fillRect(
      blockWidth * i,
      canvas.height - yOffset,
      blockWidth,
      -blockHeight,
    );

    // border
    ctx.strokeStyle = "black";
    ctx.strokeRect(
      blockWidth * i,
      canvas.height - (blockHeight + yOffset),
      blockWidth,
      blockHeight,
    );

    ctx.fillStyle = "black";
    ctx.font = `${blockFontSize}px Arial`;
    // count by 1's when less than 100
    if (list.length / 50 < 1) {
      // index label
      ctx.fillText(
        i + 1,
        blockWidth * i + blockFontSize,
        canvas.height - 2 * vh,
      ); // else count's by 10's, 100's, ect...
    } else if ((i + 1) % 10 == 0) {
      ctx.fillText(
        i + 1,
        blockWidth * i - blockFontSize ,
        canvas.height - 2 * vh,
      );
      
    }
      
  }
}

async function drawMenu() {
  ctx.fillStyle = "rgba(12, 20, 35, 0.75)";
  ctx.fillRect(60 * vw, canvas.height, 40 * vw, -canvas.height); // draw menu background

  ctx.fillStyle = "#1f2937";
  ctx.fillRect(61 * vw, 5 * vh, 38 * vw, 15 * vh); // draw stats box

  ctx.fillRect(61 * vw, 30 * vh, 38 * vw, 70 * vh);
  ctx.fillStyle = "rgba(12, 20, 35, 0.75)";
  ctx.fillRect(80 * vw, 30 * vh, 20 * vw, 30 * vh);
  ctx.fillStyle = "rgba(6, 12, 22, 0.75)";
  ctx.fillRect(79.8 * vw, 30 * vh, 15, 30 * vh);
  ctx.fillRect(79.8 * vw, 60 * vh, 19.2 * vw, 15);

  ctx.fillStyle = "white";
  ctx.font = `bold ${textFontSize}px Arial`;
  ctx.fillText(`Swaps: ${swapCount}`, 65 * vw, 7.5 * vh);
  ctx.fillText(`Steps: ${stepCount}`, 65 * vw, 10.5 * vh);
  ctx.fillText(`Delay: ${delayMS} ms`, 66 * vw, 13.5 * vh);
  ctx.fillText(
    `Total execution time: ${functionTime.toFixed(2)} Ms`,
    85 * vw,
    7.5 * vh,
  );
  ctx.fillText(
    `Function execution time: ${Math.max(0, functionTime - stepCount * delayMS).toFixed(2)} ms`,
    85 * vw,
    10.5 * vh,
  );
  ctx.fillText(
    `Average time per step: ${Math.max(0, (functionTime - stepCount * delayMS) / stepCount).toFixed(2)} ms`,
    85 * vw,
    13.5 * vh,
  ); // function execution time / steps to find average

  for (let button of buttons) {
    button.draw(ctx);
  }

  requestAnimationFrame(drawMenu);
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  buttons.forEach((button) => {
    if (
      mouseX >= button.x &&
      mouseX <= button.x + button.width &&
      mouseY >= button.y &&
      mouseY <= button.y + button.height
    ) {
      if (button.label === "Bubble Sort") {
        algorithmVisualizer("bubbleSort", scaledList, delayMS);
      } else if (button.label === "Quick Sort") {
        algorithmVisualizer("quickSort", scaledList, delayMS);
      } else if (button.label === "Radix Sort") {
        algorithmVisualizer("radixSort", scaledList, delayMS);
      } else if (button.label === "Shuffle List") {
        location.reload();
      }
    }
  });
});

class functionTimer {
  constructor() {
    this.startTime = 0;
    this.endTime = 0;
    this.duration = 0;
  }

  start() {
    this.startTime = performance.now();
  }

  stop() {
    this.endTime = performance.now();
    this.duration = this.endTime - this.startTime;
    return this.duration;
  }
}

const timer = new functionTimer();

async function algorithmVisualizer(algorithm, list, delayMS = 100) {
  swapCount = 0; // Reset stats
  stepCount = 0;
  timer.start();
  if (!isSorting) {
    // if active
    isSorting = true;

    if (algorithm === "bubbleSort") {
      await bubbleSort(list, delayMS);
    } else if (algorithm === "quickSort") {
      await quickSort(list, 0, list.length - 1, delayMS);
    } else if (algorithm === "radixSort") {
      await radixSort(list, delayMS);
    }

    functionTime = timer.stop();
    await verifySort(list); // Wait for the animation to finish

    isSorting = false;
  }
}

async function verifySort(list) {
  // set all blocks to gray
  stateList.fill("unsorted");
  drawBlocks(list, stateList);

  for (let i = 0; i < stateList.length; i++) {
    stateList[i] = "sorted";
    drawBlocks(list, stateList);
    await delay(1000 / list.length); // 1 second total verify time
  }

  stateList.fill("bright");
  drawBlocks(list, stateList);
  await delay(250);
  stateList.fill("sorted");
  drawBlocks(list, stateList);
}

drawBlocks(scaledList, stateList);
drawMenu();
