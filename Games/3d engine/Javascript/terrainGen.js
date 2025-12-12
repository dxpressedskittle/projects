class Perlin {
  constructor(seed = 0) {
    this.p = new Uint8Array(512);
    this.perm = new Uint8Array(512);
    // simple LCG for reproducible permutation
    let s = seed >>> 0;
    for (let i = 0; i < 256; i++) {
      s = (1664525 * s + 1013904223) >>> 0;
      this.p[i] = i;
    }
    // shuffle
    for (let i = 255; i > 0; i--) {
      s = (1664525 * s + 1013904223) >>> 0;
      const r = s & 255;
      const tmp = this.p[i];
      this.p[i] = this.p[r];
      this.p[r] = tmp;
    }
    for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  lerp(a, b, t) {
    return a + t * (b - a);
  }
  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = this.fade(xf);
    const v = this.fade(yf);
    const aa = this.perm[this.perm[X] + Y];
    const ab = this.perm[this.perm[X] + Y + 1];
    const ba = this.perm[this.perm[X + 1] + Y];
    const bb = this.perm[this.perm[X + 1] + Y + 1];

    const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u);
    const x2 = this.lerp(
      this.grad(ab, xf, yf - 1),
      this.grad(bb, xf - 1, yf - 1),
      u
    );
    return this.lerp(x1, x2, v);
  }

  // octave fBm
  fbm(x, y, octaves = 4, lacunarity = 2.0, gain = 0.5) {
    let amp = 1.0;
    let freq = 1.0;
    let sum = 0;
    let max = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.noise2D(x * freq, y * freq);
      max += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return sum / max;
  }
}
function generateUniqeSeed() {
  return Math.floor(Math.random * 125213534532)
}




// Note: This rewrite assumes the Perlin class is available in scope.

function generateVoxelTerrain(options = {}) {
  const {
    size = 80, // extent of the world in x/z directions (cubes)
    heightScale = 20, // max possible height of the terrain (cubes)
    seed = 1337,
    octaves = 5,
    lacunarity = 2.0,
    gain = 0.5,
    // New option for minimum terrain level
    minHeight = 0, 
  } = options;

  const perlin = new Perlin(seed);
  const voxels = []; 

  const halfSize = size / 2;

  // Iterate over every possible cube coordinate in our 3D space
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      
      // Calculate the noise input coordinates (normalized and scaled for 'zoom')
      // We scale by a factor (e.g., 0.05 or 4/size depending on desired terrain scale)
      const noiseX = x * 0.05; 
      const noiseZ = z * 0.05; 

      // Use fBm to get the base terrain height
      // The fbm function returns a value usually between -1 and 1
      const rawHeightNoise = perlin.fbm(
        noiseX, 
        noiseZ, 
        octaves, 
        lacunarity, 
        gain
      );

      // Normalize the noise from [-1, 1] range to [0, 1] range
      const normalizedHeight = (rawHeightNoise + 1) / 2;

      // Scale the normalized height to the desired max integer height 
      const terrainHeight = Math.floor(normalizedHeight * heightScale);

      // Place solid cubes from the bottom up to the calculated terrain height
      for (let y = minHeight; y < terrainHeight; y++) {
        // Adjust x and z coordinates to center the terrain around the world origin 
        const worldX = x - halfSize;
        const worldZ = z - halfSize;
        
        voxels.push([worldX, y, worldZ]);
      }
    }
  }

  console.log(
    `Voxel Terrain generated, seed: ${seed}, size: ${size}, cubes generated: ${voxels.length}`
  );

  return {
    voxels: voxels,
  };
}

export const voxelTerrain = generateVoxelTerrain({
  size: 100,
  spacing: 5,
  heightScale: 10,
  minHeight: 0,
  seed: generateUniqeSeed(),
  octaves: 1000,
})


// --- Terrain generation ---
export function generateTerrain(options = {}) {
  const {
    size = 80, // number of quads per side
    spacing = 1.0,
    heightScale = 8.0,
    seed = 1337,
    octaves = 5,
    lacunarity = 2.0,
    gain = 0.5,
  } = options;

  const perlin = new Perlin(seed);
  const verts = [];
  const faces = [];
  const edges = [];

  const half = size / 2;
  // generate grid vertices
  for (let z = 0; z <= size; z++) {
    for (let x = 0; x <= size; x++) {
      const worldX = (x - half) * spacing;
      const worldZ = (z - half) * spacing;
      // scale coords down to get larger hills
      const nx = x / size;
      const nz = z / size;
      // use fbm for natural terrain
      const e = perlin.fbm(nx * 4, nz * 4, octaves, lacunarity, gain);
      const height = e * heightScale;
      verts.push([worldX, -height, worldZ]);
    }
  }

  const rowLen = size + 1;
  // faces (represented as quads)
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      const a = z * rowLen + x;
      const b = a + 1;
      const c = a + rowLen + 1;
      const d = a + rowLen;
      faces.push([a, b, c, d]);
    }
  }

  // edges - build grid lines for wireframe overlay
  for (let z = 0; z <= size; z++) {
    for (let x = 0; x <= size; x++) {
      const idx = z * rowLen + x;
      if (x < size) edges.push([idx, idx + 1]);
      if (z < size) edges.push([idx, idx + rowLen]);
    }
  }

  // per-face coloring based on average height
  const faceColors = faces.map((face) => {
    const h =
      (verts[face[0]][1] +
        verts[face[1]][1] +
        verts[face[2]][1] +
        verts[face[3]][1]) /
      4;
    // positive is down so h is negative
    const hh = -h;
    if (hh < heightScale * 0.25) return "#2e8b57"; // low: dark green
    if (hh < heightScale * 0.5) return "#6b8e23"; // mid: olive
    if (hh < heightScale * 0.75) return "#c2b280"; // upper: sandy
    return "#ffffff"; // peaks: white
  });

  console.log(
    `Terrain generated, seed: ${seed}, size: ${size}, vertices: ${verts.length}, faces: ${faces.length}, seed ${new Perlin(seed).noise2D(0, 0)}`
  );

  return {
    vertices: verts,
    edges,
    faces,
    color: "#888",
    faceColors,
    strokeStyle: "#333",
  };
}

