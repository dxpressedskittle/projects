/* calculator buttons */



const btn1 = document.getElementById("1");
const btn2 = document.getElementById("2"); 
const btn3 = document.getElementById("3");
const btn4 = document.getElementById("4");
const btn5 = document.getElementById("5");
const btn6 = document.getElementById("6");
const btn7 = document.getElementById("7");
const btn8 = document.getElementById("8");
const btn9 = document.getElementById("9");
const btn0 = document.getElementById("0");
const btnPlus = document.getElementById("+");
const btnMinus = document.getElementById("-");
const btnMultiply = document.getElementById("*");
const btnDivide = document.getElementById("/");
const btnDot = document.getElementById(".");
const equals = document.getElementById("=");
const clear = document.getElementById("C");

let display = document.getElementById("display");
let opType = "";
let a = "";
let b = "";
let table = {
    ["+"]: function(a, b) { return a + b; }, 
    ["-"]: function(a, b) { return a - b; },
    ["*"]: function(a, b) { return a * b; },
    ["/"]: function(a, b) { 
        if (b === 0) {
            return display.innerHTML = "Error! Division by zero.";
        }
        return a / b; 
    }
};














[btn0, btn1, btn2, btn3, btn4, btn5, btn6, btn7, btn8, btn9].forEach(btn => {
    btn.addEventListener("click", function() {
        if (display.innerHTML === "0" || display.innerHTML === "Error! Invalid operation." || display.innerHTML === "Error! Invalid numbers.") {
            display.innerHTML = btn.id; 
        } else {
            display.innerHTML += btn.id; 
        }
    });
});

/* start operation button event listeners */
btnPlus.addEventListener("click", function() {
    if (!opType && display.innerHTML !== "0") {
        opType = "+";
        display.innerHTML += "+";
        if (a !== "" && b !== "") {
            const result = table[opType](a, b);
            display.innerHTML = result += "+";

    }
}});
btnMinus.addEventListener("click", function() {
    if (!opType && display.innerHTML !== "0") {
        opType = "-";
        display.innerHTML += "-"; 
    }
});
btnMultiply.addEventListener("click", function() {
    if (!opType && display.innerHTML !== "0") {
        opType = "*";
        display.innerHTML += "*"; 
    }
});
btnDivide.addEventListener("click", function() {
    if (!opType && display.innerHTML !== "0") {
        opType = "/";
        display.innerHTML += "/"; 
    }
});

btnDot.addEventListener("click", function() {
    if (!display.innerHTML.includes(".")) {
        display.innerHTML += "."; 
    }
});

/* end operation button event listeners */

equals.addEventListener("click", function() {
    const displayContent = display.innerHTML;
    const operatorIndex = displayContent.indexOf(opType);

    if (operatorIndex === -1 || !opType) {
        display.innerHTML = "Error! Invalid operation.";
        return;
    }

    const a = parseFloat(displayContent.slice(0, operatorIndex));
    const b = parseFloat(displayContent.slice(operatorIndex + 1));

    if (isNaN(a) || isNaN(b)) {
        display.innerHTML = "Error! Invalid numbers.";
        return;
    }

    const result = table[opType](a, b);

    display.innerHTML = result;
    opType = ""; 
});

clear.addEventListener("click", function() {
    display.innerHTML = "0"; 
    opType = "";
});



/* Bugs */