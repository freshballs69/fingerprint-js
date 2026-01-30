export function getColorDepth(): number {
  return screen.colorDepth;
}

export function getScreenResolution(): [number, number] {
  return [screen.width, screen.height];
}

export function getAvailableScreenResolution(): [number, number] {
  return [screen.availWidth, screen.availHeight];
}
