class nueralNetwork {
  // inputSize: number of inputs per sample 
  // outputSize: number of output neurons 
  // weights: outputSize x inputSize (each output neuron has a weight vector)
  constructor(inputSize, outputSize = 1, inputs = []) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    // include bias weight per neuron
    this.useBias = true;
    this.weights = new Array(outputSize)
      .fill(0)
      .map(() => new Array(inputSize + (this.useBias ? 1 : 0)).fill(0).map(() => Math.random() * 2 - 1));
    this.inputs = inputs;
  }

  // Pass the weighted sum of the inputs to normalise them between 0 and 1
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  // How confident the network is about its predicition. Higher values mean more confidence.
  sigmoidDerivative(x) {
    return x * (1 - x);
  }

  dot(a, b) {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same length.");
    }
    return a.map((val, i) => val * b[i]).reduce((sum, val) => sum + val, 0);
  }


  // - learningRate: step size for weight updates
  train(trainingInputs, trainingOutputs, iterations = 10000, learningRate = 0.1) {
    if (!Array.isArray(trainingInputs) || !Array.isArray(trainingOutputs)) {
      throw new Error("trainingInputs and trainingOutputs must be arrays of vectors");
    }

    const nSamples = trainingInputs.length;
    if (nSamples === 0 || trainingOutputs.length !== nSamples) {
      throw new Error("trainingInputs and trainingOutputs must have the same non-zero length");
    }

    for (let iter = 0; iter < iterations; iter++) {
      // Loop through samples 
      for (let s = 0; s < nSamples; s++) {
        const rawInput = trainingInputs[s];
        if (!Array.isArray(rawInput) || rawInput.length !== this.inputSize) {
          throw new Error(`Each input must be an array of length ${this.inputSize}`);
        }
        const input = this.useBias ? [...rawInput, 1] : rawInput;
        let desired = trainingOutputs[s];

        // Allow desired to be a scalar or a single-element array (0/1)
        if (typeof desired === 'number') {
          desired = [desired];
        }

        // compute outputs for each neuron
  const outputs = this.think(this.weights, input);

        // ensure shapes
        if (!Array.isArray(outputs) || !Array.isArray(desired) || outputs.length !== desired.length) {
          throw new Error("Output vector shape mismatch between network and desired outputs");
        }

        // update each neuron's weight vector
        for (let j = 0; j < this.weights.length; j++) {
          const error = desired[j] - outputs[j];
          const delta = error * this.sigmoidDerivative(outputs[j]);
          // weights[j] is the weight vector for neuron j
          for (let k = 0; k < this.weights[j].length; k++) {
            this.weights[j][k] += learningRate * delta * input[k];
          }
        }
      }
    }

    return this.weights;
  }

  think(weights, inputs) {
    // Ensure inputs include bias if the network uses a bias 
    let inVec = inputs;
    if (this.useBias && Array.isArray(inputs) && inputs.length === this.inputSize) {
      inVec = [...inputs, 1];
    }

    if (Array.isArray(weights) && Array.isArray(weights[0])) {
      // weights is a 2D array: [ [w00, w01, ...], [w10, w11, ...], ... ]
      return weights.map((w) => this.sigmoid(this.dot(w, inVec)));
    }

    // weights is a 1D array (single neuron) — return array for consistency
    return [this.sigmoid(this.dot(weights, inVec))];
  }

}

let nnInstance = null;

function parseInputs(text) {
  return (text || '')
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const nums = (line.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
      return nums;
    })
    .filter((arr) => arr.length > 0);
}

function parseOutputs(text) {
  // Return flat array of numbers (one per sample). Accepts numbers separated by commas or newlines.
  const nums = (text.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  return nums;
}

function parseSinglePattern(text) {
  return (text.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
}

function showMessage(msg) {
  alert(msg);
}

function renderWeights(instance) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('weights-display');
  if (!container || !instance) return;
  const weights = instance.weights;
  // Format weights per neuron, show bias as last value
  const lines = weights.map((w, idx) => {
    const bias = instance.useBias ? w[w.length - 1] : null;
    const vals = instance.useBias ? w.slice(0, w.length - 1) : w;
    const valsStr = vals.map((v) => v.toFixed(4)).join(', ');
    return `Neuron ${idx}: [${valsStr}]${instance.useBias ? ` (bias: ${bias.toFixed(4)})` : ''}`;
  });
  container.textContent = lines.join('\n');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const trainBtn = document.getElementById('train-btn');
    const testBtn = document.getElementById('test-btn');
    const inputTA = document.getElementById('input-pattern');
    const outputTA = document.getElementById('output-pattern');

    if (trainBtn) {
      trainBtn.addEventListener('click', () => {
        const inputs = parseInputs(inputTA.value);
        const outputs = parseOutputs(outputTA.value);

        if (inputs.length === 0) {
          showMessage('No training inputs found. Please enter one pattern per line.');
          return;
        }

        const inputSize = inputs[0].length;
        for (const row of inputs) {
          if (row.length !== inputSize) {
            showMessage('All input patterns must have the same number of values.');
            return;
          }
        }

        if (outputs.length !== inputs.length) {
          showMessage('Number of output values must match number of input patterns.');
          return;
        }

        // For boolean classification we expect scalar outputs (0/1)
        const outputSize = 1;

  nnInstance = new nueralNetwork(inputSize, outputSize);
  // render initial random weights
  renderWeights(nnInstance);

        // Convert outputs to scalars (0/1)
        const scalarOutputs = outputs.map((v) => (v ? 1 : 0));

        // Default training parameters
        const iterations = 100000000 // 10 million;
        const learningRate = 0.01;

        // Disable button while training to avoid re-entrancy
        trainBtn.disabled = true;
        try {
          nnInstance.train(inputs, scalarOutputs, iterations, learningRate);
        } catch (err) {
          showMessage('Training error: ' + err.message);
          trainBtn.disabled = false;
          return;
        }
        trainBtn.disabled = false;

        // Evaluate training accuracy quickly
        let correct = 0;
        for (let i = 0; i < inputs.length; i++) {
          const out = nnInstance.think(nnInstance.weights, inputs[i]);
          const prob = Array.isArray(out) ? out[0] : out;
          const pred = prob >= 0.5 ? 1 : 0;
          if (pred === scalarOutputs[i]) correct++;
        }

        renderWeights(nnInstance);
        showMessage(`Training finished. Accuracy on training set: ${correct}/${inputs.length}`);
      });
    }

    if (testBtn) {
      testBtn.addEventListener('click', () => {
        if (!nnInstance) {
          showMessage('No trained network available. Train first.');
          return;
        }
        const pattern = window.prompt('Enter test pattern as comma-separated values (e.g. 1,0,1)');
        if (!pattern) return;
        const input = parseSinglePattern(pattern);
        if (input.length !== nnInstance.inputSize) {
          showMessage(`Test pattern must have ${nnInstance.inputSize} values.`);
          return;
        }
        const out = nnInstance.think(nnInstance.weights, input);
        const prob = Array.isArray(out) ? out[0] : out;
        renderWeights(nnInstance);
        showMessage(`Output probability: ${prob.toFixed(4)}\nCalculated guess: ${prob >= 0.5 ? "True" : "False"}`);
      });
    }
  });
}








