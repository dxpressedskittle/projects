let unsortedArray = [];

// randomizes array
for (let i = 0; i < 100; i++) {
  unsortedArray.push(Math.floor(Math.random() * 1000));
}

// Merge sort

let arrayStorage = [];

function mergeSort(arr) {
  if (arrayStorage.length < 1) { // If there arrayStorage is empty then it sets the first unit in the array to the unsorted array
    arrayStorage[0] = arr;
  } else if (arrayStorage.length >= 1) { // else it goes through every array in arraystorage and puts it into two temporary arrays, l and r, then pushes those back into ArrayStorage, doing this over and over again will completely divide the array
    for (i = 0; i < arrayStorage.length; i++) {
      let currentArray = arrayStorage[i]; 
      let r = [];
      let l = [];
      for (let j = 0; j < currentArray.length / 2; j++) {
        r.push(currentArray[j]);
      }
      for (let j = 0; j < currentArray.length / 2; j++) {
        l. push(currentArray[j + r.length]);
      }
      
    }
  }

  /* let arrayLength = arr.length;
  for (i = 0; i < arrayLength / 2; i++) {
    r.push(unsortedArray[i]);
  }
  for (i = 0; i < arrayLength / 2; i++) {
    l.push(unsortedArray[i + r.length]);
  }

  */
}
mergeSort(unsortedArray);
mergeSort(unsortedArray);
