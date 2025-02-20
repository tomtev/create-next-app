export function createMagnetEffect(element: HTMLElement | null, enabled: boolean | undefined = false) {
  if (!element || enabled !== true) return;

  const PROXIMITY_THRESHOLD = 100; // Distance in pixels to start the effect
  const VERTICAL_THRESHOLD = 50; // Extra vertical distance to start the effect
  const ORIENTATION_SENSITIVITY = 15; // Maximum degrees to reach edges

  // Helper to detect mobile/tablet devices
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (!e.gamma || !e.beta) return;

    // Normalize gamma (left to right tilt) and beta (front to back tilt)
    // to percentage values for the magnet effect
    const gamma = Math.min(Math.max(e.gamma, -ORIENTATION_SENSITIVITY), ORIENTATION_SENSITIVITY);
    const beta = Math.min(Math.max(e.beta - 40, -ORIENTATION_SENSITIVITY), ORIENTATION_SENSITIVITY);

    // Convert tilts to percentages (0-100)
    const mouseX = ((gamma + ORIENTATION_SENSITIVITY) / (ORIENTATION_SENSITIVITY * 2)) * 100;
    const mouseY = ((beta + ORIENTATION_SENSITIVITY) / (ORIENTATION_SENSITIVITY * 2)) * 100;

    // Calculate magnet strength based on how centered the device is
    const magnetStrength = Math.max(
      0,
      1 - (Math.abs(gamma) + Math.abs(beta)) / (ORIENTATION_SENSITIVITY * 2)
    );

    element.style.setProperty('--link-mouse-x', `${mouseX}%`);
    element.style.setProperty('--link-mouse-y', `${mouseY}%`);
    element.style.setProperty('--magnet', magnetStrength.toString());
  };

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

  // Set up the appropriate event listeners based on device type
  if (isMobileDevice()) {
    // Request permission for device orientation if needed (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    
    // Set initial centered position
    element.style.setProperty('--link-mouse-x', '50%');
    element.style.setProperty('--link-mouse-y', '50%');
    element.style.setProperty('--magnet', '1');

    return () => window.removeEventListener('deviceorientation', handleDeviceOrientation);
  } else {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }
} 