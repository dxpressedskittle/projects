const canvas = document.getElementById("canvas");
const viewPortWidth = document.documentElement.clientWidth;
const viewPortHeight = document.documentElement.clientHeight;
const vw = viewPortWidth / 100;
const vh = viewPortHeight / 100;
const ctx = canvas.getContext("2d");
canvas.width = viewPortWidth;
canvas.height = viewPortHeight;

const unsortedList = generateList(1,100,100);
const scaledList = [];

const blockMargin = 0.5 * vw;
const yOffset = 5 * vh;
const maxBlockHeight = 143;
const blockWidth = (60 * vw) / unsortedList.length;
const blockFontSize = blockWidth / 2

let delayMS = 100 
let swapCount = 0
let stepCount = 0;

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

        drawBlocks(list);
        await delay(delayMS);
      }
    }
  }
}



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

scaleList(unsortedList, scaledList);


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
  ctx.fillRect(60 * vw, canvas.height, 40 * vw, -canvas.height);

  ctx.fillStyle = "#1f2937"
  ctx.fillRect(61 * vw, 5 * vh, 38 * vw, 15 * vh);

  ctx.fillStyle = "white";
  ctx.font = `bold ${3 * vh}px Arial`;
  ctx.fillText(`Swaps: ${swapCount}`, 62 * vw, 9.5 * vh);
  ctx.fillText(`Steps: ${stepCount}`, 62 * vw, 13.2 * vh);
  ctx.fillText(`Delay: ${delayMS} ms`, 62 * vw, 16.9 * vh);

  requestAnimationFrame(drawMenu);
}






async function algorithmVisualizer (algorithm, list, delayMS) {
  switch (algorithm) {
    case 'bubbleSort':
      const scaledList = scaleList(list);
      await bubbleSort(list, delayMS);
      drawBlocks(scaledList)
  }
  drawBlocks(list);
}

algorithmVisualizer('bubbleSort', scaledList, delayMS);
drawMenu();

//(async () => {
  //await bubbleSort(scaledList, delayMS);
  //drawBlocks(scaledList);
//})();

