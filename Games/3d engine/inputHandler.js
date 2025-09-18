// Movement Handling with rotation awareness
document.addEventListener("keydown", function (event) {
  const key = event.key;
  const moveSpeed = 0.2;

  // Calculate forward/sideways movement based on camera's current yaw
  const forwardX = Math.sin(cameraYaw) * moveSpeed;
  const forwardZ = Math.cos(cameraYaw) * moveSpeed;
  const strafeX = Math.sin(cameraYaw - Math.PI / 2) * moveSpeed;
  const strafeZ = Math.cos(cameraYaw - Math.PI / 2) * moveSpeed;

  if (key === "w" || key === "W") {
    camera[0] -= forwardX;
    camera[2] += forwardZ;
  } else if (key === "s" || key === "S") {
    camera[0] += forwardX;
    camera[2] -= forwardZ;
  } else if (key === "a" || key === "A") {
    camera[0] += strafeX;
    camera[2] -= strafeZ;
  } else if (key === "d" || key === "D") {
    camera[0] -= strafeX;
    camera[2] += strafeZ;
  } else if (key === "Escape") {
    document.exitPointerLock();
  }
});