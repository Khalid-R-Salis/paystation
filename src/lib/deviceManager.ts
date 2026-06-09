/**
 * Device Manager - Generate and manage unique device identifiers
 * This helps identify different devices/browsers for single-device login enforcement
 */

interface DeviceInfo {
  id: string;
  userAgent: string;
  platform: string;
  timestamp: number;
}

const DEVICE_ID_STORAGE_KEY = 'paystation_device_id';

/**
 * Generates a fingerprint from browser/device characteristics
 */
function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown',
    new Date().getTimezoneOffset(),
    !!window.devicePixelRatio ? window.devicePixelRatio.toString() : 'unknown',
  ];

  // Create a simple hash from these components
  const fingerprint = btoa(components.join('|')).substring(0, 32);
  return fingerprint;
}

/**
 * Generates a unique device ID combining fingerprint and random string
 */
function generateUniqueDeviceId(): string {
  const fingerprint = generateDeviceFingerprint();
  const random = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  
  return `${fingerprint}-${random}-${timestamp}`;
}

/**
 * Gets or creates a persistent device ID for this browser/device
 */
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  
  if (!deviceId) {
    deviceId = generateUniqueDeviceId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  }
  
  return deviceId;
}

/**
 * Gets the current device info
 */
export function getDeviceInfo(): DeviceInfo {
  return {
    id: getOrCreateDeviceId(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    timestamp: Date.now(),
  };
}

/**
 * Gets a human-readable device name
 */
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Mac')) return 'MacBook';
  if (ua.includes('Linux')) return 'Linux PC';
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('iPad')) return 'iPad';
  if (ua.includes('Android')) return 'Android Phone';
  
  return 'Unknown Device';
}

/**
 * Gets a human-readable browser name
 */
export function getBrowserName(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  
  return 'Unknown Browser';
}

/**
 * Gets a display name for the current device/browser
 */
export function getDisplayDeviceName(): string {
  return `${getDeviceName()} - ${getBrowserName()}`;
}

/**
 * Clears the device ID (used on logout)
 */
export function clearDeviceId(): void {
  localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
}
