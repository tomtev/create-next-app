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

  // Helper to detect iOS devices
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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

  const requestOrientationAccess = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
      } else {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
    }
  };

  // Set up the appropriate event listeners based on device type
  if (isMobileDevice()) {
    // Set initial centered position
    element.style.setProperty('--link-mouse-x', '50%');
    element.style.setProperty('--link-mouse-y', '50%');
    element.style.setProperty('--magnet', '1');

    let handleClick: (() => Promise<void>) | null = null;

    // Add a click handler to request permission on iOS
    if (isIOS()) {
      handleClick = async () => {
        await requestOrientationAccess();
        // Remove the click handler after permission is requested
        if (element && handleClick) {
          element.removeEventListener('click', handleClick);
        }
      };
      element.addEventListener('click', handleClick);
    } else {
      // For non-iOS devices, just add the orientation listener
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      if (isIOS() && handleClick && element) {
        element.removeEventListener('click', handleClick);
      }
    };
  } else {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }
} 