const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  let animationFrameId = null;
  let hue = 0;

  function animateGlow() {
    // Convert hue to hsl color string
    const color = `hsl(${hue}, 100%, 50%)`;
    card.style.boxShadow = `0 0 15px ${color}, 0 0 30px ${color}`;
    hue = (hue + 1) % 360; // cycle through 0-359 degrees
    animationFrameId = requestAnimationFrame(animateGlow);
  }

  card.addEventListener('mouseenter', () => {
    animateGlow();
  });

  card.addEventListener('mouseleave', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    // Reset box shadow on mouse leave
    card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
  });
});
