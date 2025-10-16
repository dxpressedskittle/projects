import {fov, canvasOffsetX, canvasOffsetY, cameraYaw, cameraPitch, camera} from "./main.js"

// 3D to 2D projection

export function transform(v) {
  const z = v[2];
  const safeZ = z <= 0.001 ? 0.001 : z;
  const f = fov / safeZ;
  return [v[0] * f, v[1] * f];
}
console.log(camera)

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

