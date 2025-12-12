import {fov, canvasOffsetX, canvasOffsetY, cameraYaw, cameraPitch, camera} from "./main.js"

// 3D to 2D projection

export function transform(v) {
  const z = v[2];
  const safeZ = z <= 0.001 ? 0.001 : z;
  const f = fov / safeZ;
  return [v[0] * f, v[1] * f];
}

// Rotation helpers
export function rotateY(v, angle) {
  return [
    v[0] * Math.cos(angle) - v[2] * Math.sin(angle),
    v[1],
    v[0] * Math.sin(angle) + v[2] * Math.cos(angle),
  ];
}
export function rotateX(v, angle) {
  return [
    v[0],
    v[1] * Math.cos(angle) - v[2] * Math.sin(angle),
    v[1] * Math.sin(angle) + v[2] * Math.cos(angle),
  ];
}

// Transform object vertices into camera space
export function getTransformedVertices(obj) {
  const out = [];
  for (let i = 0; i < obj.vertices.length; i++) {
    let v = [...obj.vertices[i]];
    v[0] -= camera[0];
    v[1] -= camera[1];
    v[2] -= camera[2];
    v = rotateY(v, -cameraYaw);
    v = rotateX(v, -cameraPitch);
    out[i] = v;
  }
  return out;
}

// Project a camera-space vertex to screen-space (returns [x, y])
export function projectToScreen(v) {
  const p = transform(v);
  return [p[0] + canvasOffsetX, p[1] + canvasOffsetY];
}

// Gets signed area of 2D polygon (screen-space)
export function signedArea2D(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  return area / 2;
}


// color: default color for all faces
// faceColors: optional array of 6 colors (one per face)
export function makeCube(
  center = [0, 0, 0],
  s = 1,
  color = "#000",
  faceColors = null,
  strokeStyle = "#000"
) {
  const [cx, cy, cz] = center;
  const verts = [
    [cx - s, cy - s, cz + s], // 0
    [cx + s, cy - s, cz + s], // 1
    [cx + s, cy + s, cz + s], // 2
    [cx - s, cy + s, cz + s], // 3
    [cx - s, cy - s, cz - s], // 4
    [cx + s, cy - s, cz - s], // 5
    [cx + s, cy + s, cz - s], // 6
    [cx - s, cy + s, cz - s], // 7
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  // faces defined as lists of vertex indices (quad faces)
  const faces = [
    [0, 1, 2, 3],
    [5, 4, 7, 6],
    [4, 5, 1, 0],
    [3, 2, 6, 7],
    [1, 5, 6, 2],
    [4, 0, 3, 7],
  ];
  return {
    vertices: verts,
    edges,
    faces,
    color,
    faceColors: Array.isArray(faceColors) ? faceColors : null,
    strokeStyle: strokeStyle || "#000",
  };
}

