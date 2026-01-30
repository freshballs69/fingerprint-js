export function getHardwareConcurrency(): number {
  return navigator.hardwareConcurrency || 0;
}

export function getDeviceMemory(): number | null {
  return (navigator as Navigator & { deviceMemory?: number }).deviceMemory || null;
}

export function getMaxTouchPoints(): number {
  return navigator.maxTouchPoints || 0;
}
