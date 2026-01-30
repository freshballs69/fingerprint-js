export function getUserAgent(): string {
  return navigator.userAgent;
}

export function getLanguage(): string {
  return navigator.language;
}

export function getLanguages(): string[] {
  return Array.from(navigator.languages || [navigator.language]);
}

export function getPlatform(): string {
  return navigator.platform;
}

export function getVendor(): string {
  return navigator.vendor || '';
}

export function getVendorFlavors(): string[] {
  const dominated: string[] = [];
  const domPropNames = Object.getOwnPropertyNames(window);

  const vendorChecks: { [key: string]: string[] } = {
    chrome: ['chrome'],
    firefox: ['InstallTrigger'],
    safari: ['safari'],
    edge: ['msWriteProfilerMark'],
    opera: ['opr', 'opera'],
  };

  for (const [browser, props] of Object.entries(vendorChecks)) {
    for (const prop of props) {
      if (domPropNames.includes(prop) || prop in window) {
        dominated.push(browser);
        break;
      }
    }
  }

  return dominated;
}

export function getDoNotTrack(): string | null {
  return navigator.doNotTrack || null;
}

export function getCookiesEnabled(): boolean {
  try {
    document.cookie = 'fp_test=1';
    const result = document.cookie.indexOf('fp_test=') !== -1;
    document.cookie = 'fp_test=1; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    return result;
  } catch {
    return false;
  }
}
