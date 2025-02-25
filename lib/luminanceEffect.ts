export function createLuminanceEffect(element: HTMLElement | null, enabled: boolean | undefined = false, options = {}) {
  if (!element || enabled !== true) return;

  // Determine if this is a page container
  const isPageContainer = element.classList.contains('pf-page__container');
  
  // Adjust thresholds based on element type
  const PROXIMITY_THRESHOLD = isPageContainer ? 200 : 100; // Distance in pixels to start the effect
  const VERTICAL_THRESHOLD = isPageContainer ? 100 : 50; // Extra vertical distance to start the effect
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

  // Helper to detect any touch device
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (!e.gamma || !e.beta) return;

    // Normalize gamma (left to right tilt) and beta (front to back tilt)
    // to percentage values for the luminance effect
    const gamma = Math.min(Math.max(e.gamma, -ORIENTATION_SENSITIVITY), ORIENTATION_SENSITIVITY);
    const beta = Math.min(Math.max(e.beta - 40, -ORIENTATION_SENSITIVITY), ORIENTATION_SENSITIVITY);

    // Convert tilts to percentages (0-100)
    const mouseX = ((gamma + ORIENTATION_SENSITIVITY) / (ORIENTATION_SENSITIVITY * 2)) * 100;
    const mouseY = ((beta + ORIENTATION_SENSITIVITY) / (ORIENTATION_SENSITIVITY * 2)) * 100;

    // Calculate luminance strength based on how centered the device is
    const luminanceStrength = Math.max(
      0,
      1 - (Math.abs(gamma) + Math.abs(beta)) / (ORIENTATION_SENSITIVITY * 2)
    );

    element.style.setProperty('--link-mouse-x', `${mouseX}%`);
    element.style.setProperty('--link-mouse-y', `${mouseY}%`);
    element.style.setProperty('--luminance-strength', luminanceStrength.toString());
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    
    // Calculate mouse position relative to the element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to percentages for mouse position tracking
    const mouseX = (x / rect.width) * 100;
    const mouseY = (y / rect.height) * 100;
    
    // Calculate distances from element edges for proximity check
    const distanceLeft = x;
    const distanceRight = rect.width - x;
    const distanceFromX = Math.min(Math.abs(distanceLeft), Math.abs(distanceRight));
    
    // Calculate vertical distance from center for luminance effect
    const centerY = rect.height / 2;
    const distanceFromCenterY = Math.abs(y - centerY);
    const extendedVerticalRange = (rect.height / 2) + VERTICAL_THRESHOLD;
    
    // Only apply luminance effect if mouse is within proximity threshold
    let luminanceStrength = 0;
    if (x >= -PROXIMITY_THRESHOLD && 
        x <= rect.width + PROXIMITY_THRESHOLD && 
        y >= -VERTICAL_THRESHOLD && 
        y <= rect.height + VERTICAL_THRESHOLD) {
      
      // Base strength on vertical distance from center with extended range
      luminanceStrength = Math.max(0, 1 - distanceFromCenterY / extendedVerticalRange);
      
      // Fade out effect when outside the element horizontally
      if (x < 0 || x > rect.width) {
        luminanceStrength *= Math.max(0, 1 - distanceFromX / PROXIMITY_THRESHOLD);
      }
    }
    
    element.style.setProperty('--link-mouse-x', `${mouseX}%`);
    element.style.setProperty('--link-mouse-y', `${mouseY}%`);
    element.style.setProperty('--luminance-strength', luminanceStrength.toString());
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
  if (isTouchDevice()) {
    // Set initial centered position
    element.style.setProperty('--link-mouse-x', '50%');
    element.style.setProperty('--link-mouse-y', '50%');
    element.style.setProperty('--luminance-strength', '1');

    // For iOS devices, permission is requested at the page level in PageContent.tsx
    // Just add the orientation listener here
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  } else {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }
}

// For backward compatibility with any existing imports
export const createMagnetEffect = createLuminanceEffect; 