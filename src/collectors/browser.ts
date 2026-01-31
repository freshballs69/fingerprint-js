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

export interface WebdriverResult {
  detected: boolean;
  signals: string[];
}

export function getWebdriverPresent(): WebdriverResult {
  const signals: string[] = [];

  // Standard WebDriver flag (Selenium, Puppeteer, Playwright)
  if (navigator.webdriver === true) {
    signals.push('navigator.webdriver');
  }

  // ChromeDriver detection
  const docKeys = Object.keys(document);
  for (const key of docKeys) {
    if (key.startsWith('$cdc_') || key.startsWith('$wdc_')) {
      signals.push('chromedriver');
      break;
    }
  }

  // Window-based automation detection
  const win = window as Window & {
    callPhantom?: unknown;
    _phantom?: unknown;
    phantom?: unknown;
    __nightmare?: unknown;
    domAutomation?: unknown;
    domAutomationController?: unknown;
    _selenium?: unknown;
    __webdriver_script_fn?: unknown;
    __driver_evaluate?: unknown;
    __webdriver_evaluate?: unknown;
    __selenium_evaluate?: unknown;
    __fxdriver_evaluate?: unknown;
    __driver_unwrapped?: unknown;
    __webdriver_unwrapped?: unknown;
    __selenium_unwrapped?: unknown;
    __fxdriver_unwrapped?: unknown;
    _Selenium_IDE_Recorder?: unknown;
    _WEBDRIVER_ELEM_CACHE?: unknown;
    ChromeDriverw?: unknown;
    __$webdriverAsyncExecutor?: unknown;
    webdriver?: unknown;
    __webdriverFunc?: unknown;
    Cypress?: unknown;
  };

  if (win.callPhantom || win._phantom || win.phantom) {
    signals.push('phantomjs');
  }

  if (win.__nightmare) {
    signals.push('nightmare');
  }

  if (win.domAutomation || win.domAutomationController) {
    signals.push('domAutomation');
  }

  // Selenium-specific
  if (win._selenium || win.__webdriver_script_fn || win.__driver_evaluate ||
      win.__webdriver_evaluate || win.__selenium_evaluate || win.__fxdriver_evaluate ||
      win.__driver_unwrapped || win.__webdriver_unwrapped || win.__selenium_unwrapped ||
      win.__fxdriver_unwrapped || win._Selenium_IDE_Recorder || win._WEBDRIVER_ELEM_CACHE) {
    signals.push('selenium');
  }

  // Webdriver async executor (Selenium)
  if (win.__$webdriverAsyncExecutor) {
    signals.push('webdriverAsyncExecutor');
  }

  // Generic webdriver property on window
  if (win.webdriver || win.__webdriverFunc) {
    signals.push('webdriverWindow');
  }

  // Cypress
  if (win.Cypress) {
    signals.push('cypress');
  }

  // Check for headless indicators in user agent
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('headless')) {
    signals.push('headlessUA');
  }


  return {
    detected: signals.length > 0,
    signals,
  };
}
