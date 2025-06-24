let unsortedArray = [];

// randomizes array
for (let i = 0; i < 100; i++) {
  unsortedArray.push(Math.floor(Math.random() * 1000));
}


/*

function selectionSort(arr) {
  let sortedArray = [];
  for (i = 0; i < arr.length; i++) {
    let smallestNum = -1
    arr.forEach((element) => {
      if (smallestNum == -1) {
        smallestNum = element
      } else if (element < smallestNum) {
        smallestNum = element
      }
    })
    console.log(smallestNum)

  }
}
  */



// Merge sort

let arrayStorage = [];
let tempArrayStorage = [];

function mergeSort(arr) {
  arrayStorage = [];
  arrayStorage = tempArrayStorage;
  
  if (arrayStorage.length == 0) {
    // If there arrayStorage is empty then it sets the first unit in the array to the unsorted array
    arrayStorage.splice(0, 0, arr);
  } else if (arrayStorage.length >= 1) {
    // else it goes through every array in arraystorage and puts it into two temporary arrays, l and r, then pushes those back into ArrayStorage, doing this over and over again will completely divide the array\
    let arrayStorageLength = arrayStorage.length;
    for (i = 0; i < arrayStorageLength; i++) {
      let currentArray = arrayStorage[i];
      let r = [];
      let l = [];

      for (let j = 0; j < currentArray.length / 2; j++) {
        r.push(currentArray[j]);
      }
      for (let j = 0; j < currentArray.length / 2; j++) {
        l.push(currentArray[j + r.length]);
      }
      tempArrayStorage.splice(i, 1, l);
      tempArrayStorage.splice(i + 1, 0, r);
    }
   // console.log(arrayStorage);
  }
}


mergeSort(unsortedArray)
mergeSort(unsortedArray)
mergeSort(unsortedArray)





