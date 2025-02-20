export function createMagnetEffect(element: HTMLElement | null, enabled: boolean | undefined = false) {
  if (!element || enabled !== true) return;

  const PROXIMITY_THRESHOLD = 100; // Distance in pixels to start the effect
  const VERTICAL_THRESHOLD = 50; // Extra vertical distance to start the effect

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    
    // Calculate mouse position relative to the button
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to percentages for mouse position tracking
    const mouseX = (x / rect.width) * 100;
    const mouseY = (y / rect.height) * 100;
    
    // Calculate distances from button edges for proximity check
    const distanceLeft = x;
    const distanceRight = rect.width - x;
    const distanceFromX = Math.min(Math.abs(distanceLeft), Math.abs(distanceRight));
    
    // Calculate vertical distance from center for magnet effect
    const centerY = rect.height / 2;
    const distanceFromCenterY = Math.abs(y - centerY);
    const extendedVerticalRange = (rect.height / 2) + VERTICAL_THRESHOLD;
    
    // Only apply magnet effect if mouse is within proximity threshold
    let magnetStrength = 0;
    if (x >= -PROXIMITY_THRESHOLD && 
        x <= rect.width + PROXIMITY_THRESHOLD && 
        y >= -VERTICAL_THRESHOLD && 
        y <= rect.height + VERTICAL_THRESHOLD) {
      
      // Base strength on vertical distance from center with extended range
      magnetStrength = Math.max(0, 1 - distanceFromCenterY / extendedVerticalRange);
      
      // Fade out effect when outside the button horizontally
      if (x < 0 || x > rect.width) {
        magnetStrength *= Math.max(0, 1 - distanceFromX / PROXIMITY_THRESHOLD);
      }
    }
    
    element.style.setProperty('--link-mouse-x', `${mouseX}%`);
    element.style.setProperty('--link-mouse-y', `${mouseY}%`);
    element.style.setProperty('--magnet', magnetStrength.toString());
  };

  document.addEventListener('mousemove', handleMouseMove);
  return () => document.removeEventListener('mousemove', handleMouseMove);
} 