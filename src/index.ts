import { FingerprintComponents, FingerprintResult, FingerprintOptions, CollectOptions } from './types';
import { sha256 } from './utils/hash';
import {
  getUserAgent,
  getLanguage,
  getLanguages,
  getPlatform,
  getVendor,
  getVendorFlavors,
  getDoNotTrack,
  getCookiesEnabled,
  getWebdriverPresent,
} from './collectors/browser';
import {
  getColorDepth,
  getScreenResolution,
  getAvailableScreenResolution,
} from './collectors/screen';
import { getTimezone, getTimezoneOffset } from './collectors/timezone';
import { hasSessionStorage, hasLocalStorage, hasIndexedDb } from './collectors/storage';
import { getHardwareConcurrency, getDeviceMemory, getMaxTouchPoints } from './collectors/hardware';
import { getCanvasFingerprint } from './collectors/canvas';
import { getWebGLInfo } from './collectors/webgl';
import { getAvailableFonts } from './collectors/fonts';
import { getAudioFingerprint } from './collectors/audio';
import { getPlugins } from './collectors/plugins';
import { getWebRTCInfo, setStunServerHost, getStunServerHost } from './collectors/webrtc';
import { getConfig, getInitUrl, getEndpointUrl } from './config';
import { sendFingerprint, SendOptions } from './sender';

export { FingerprintComponents, FingerprintResult, FingerprintOptions, CollectOptions } from './types';
export { SendOptions } from './sender';

async function collectComponents(options: FingerprintOptions = {}, reqId?: string): Promise<FingerprintComponents> {
  const exclude = new Set(options.excludeComponents || []);

  const webglInfo = !exclude.has('webglVendor') || !exclude.has('webglRenderer') || !exclude.has('webglVersion')
    ? getWebGLInfo()
    : { vendor: '', renderer: '', version: '' };

  const audioFingerprint = !exclude.has('audio')
    ? await getAudioFingerprint()
    : 0;

  const webrtcInfo = !exclude.has('webrtcAvailable') || !exclude.has('webrtcLocalIPs')
    ? await getWebRTCInfo(reqId)
    : { available: false, localIPs: [] };

  return {
    userAgent: !exclude.has('userAgent') ? getUserAgent() : '',
    language: !exclude.has('language') ? getLanguage() : '',
    languages: !exclude.has('languages') ? getLanguages() : [],
    colorDepth: !exclude.has('colorDepth') ? getColorDepth() : 0,
    screenResolution: !exclude.has('screenResolution') ? getScreenResolution() : [0, 0],
    availableScreenResolution: !exclude.has('availableScreenResolution') ? getAvailableScreenResolution() : [0, 0],
    timezone: !exclude.has('timezone') ? getTimezone() : '',
    timezoneOffset: !exclude.has('timezoneOffset') ? getTimezoneOffset() : 0,
    sessionStorage: !exclude.has('sessionStorage') ? hasSessionStorage() : false,
    localStorage: !exclude.has('localStorage') ? hasLocalStorage() : false,
    indexedDb: !exclude.has('indexedDb') ? hasIndexedDb() : false,
    cookiesEnabled: !exclude.has('cookiesEnabled') ? getCookiesEnabled() : false,
    platform: !exclude.has('platform') ? getPlatform() : '',
    hardwareConcurrency: !exclude.has('hardwareConcurrency') ? getHardwareConcurrency() : 0,
    deviceMemory: !exclude.has('deviceMemory') ? getDeviceMemory() : null,
    maxTouchPoints: !exclude.has('maxTouchPoints') ? getMaxTouchPoints() : 0,
    vendor: !exclude.has('vendor') ? getVendor() : '',
    vendorFlavors: !exclude.has('vendorFlavors') ? getVendorFlavors() : [],
    canvas: !exclude.has('canvas') ? getCanvasFingerprint() : '',
    webglVendor: !exclude.has('webglVendor') ? webglInfo.vendor : '',
    webglRenderer: !exclude.has('webglRenderer') ? webglInfo.renderer : '',
    webglVersion: !exclude.has('webglVersion') ? webglInfo.version : '',
    fonts: !exclude.has('fonts') ? getAvailableFonts() : [],
    audio: !exclude.has('audio') ? audioFingerprint : 0,
    plugins: !exclude.has('plugins') ? getPlugins() : [],
    doNotTrack: !exclude.has('doNotTrack') ? getDoNotTrack() : null,
    webrtcAvailable: !exclude.has('webrtcAvailable') ? webrtcInfo.available : false,
    webrtcLocalIPs: !exclude.has('webrtcLocalIPs') ? webrtcInfo.localIPs : [],
    webdriver: !exclude.has('webdriver') ? getWebdriverPresent() : { detected: false, signals: [] },
  };
}

export async function getFingerprint(options: FingerprintOptions = {}, reqId?: string): Promise<FingerprintResult> {
  const components = await collectComponents(options, reqId);
  const componentsString = JSON.stringify(components);
  const hash = await sha256(componentsString);

  return {
    hash,
    components,
    timestamp: Date.now(),
  };
}

function buildTrackUrl(trackUrl: string, reqId: string): string {
  const url = new URL(trackUrl);
  if (!url.searchParams.has('req_id')) {
    url.searchParams.set('req_id', reqId);
  }
  return url.toString();
}

function fireAndForget(trackUrl: string | null, reqId: string): void {
  if (!trackUrl) {
    return;
  }
  const url = buildTrackUrl(trackUrl, reqId);
  fetch(url).catch(() => {});
}

interface InitResponse {
  reqId: string | null;
  trackUrl: string | null;
  stun: string | null;
}

async function initRequest(publicKey?: string): Promise<InitResponse> {
  const initUrl = getInitUrl(publicKey);
  const response = await fetch(initUrl);
  if (!response.ok) {
    throw new Error(`Init failed: ${response.status}`);
  }
  const data = await response.json();
  return {
    reqId: typeof data.req_id === 'string' ? data.req_id : null,
    trackUrl: typeof data.track_url === 'string' ? data.track_url : null,
    stun: typeof data.stun === 'string' ? data.stun : null,
  };
}

export async function collect(options: CollectOptions = {}): Promise<string | null> {
  const initData = await initRequest(options.public_key);
  if (!initData.reqId) {
    return null;
  }

  // Set STUN server if provided by init response
  if (initData.stun) {
    setStunServerHost(initData.stun);
  }

  const result = await new Promise<FingerprintResult>((resolve, reject) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      getFingerprint(options, initData.reqId || undefined).then(resolve).catch(reject);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        getFingerprint(options, initData.reqId || undefined).then(resolve).catch(reject);
      });
    }
  });

  const config = getConfig();
  let reqId = initData.reqId;
  const trackUrl = initData.trackUrl || config.trackUrl;
  const endpointUrl = getEndpointUrl();

  try {
    (result as FingerprintResult & { req_id?: string }).req_id = reqId;
    const response = await sendFingerprint(result, { url: endpointUrl });
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data && typeof data.req_id === 'string') {
        reqId = data.req_id;
      }
    }
  } catch {
    // Silently fail if endpoint is unavailable
  }

  fireAndForget(trackUrl, reqId);

  return reqId;
}

export { sendFingerprint };
export { setStunServerHost, getStunServerHost };

type FingerprintAPI = {
  getFingerprint: (options?: FingerprintOptions, reqId?: string) => Promise<FingerprintResult>;
  collect: (options?: CollectOptions) => Promise<string | null>;
  sendFingerprint: typeof sendFingerprint;
  setStunServerHost: typeof setStunServerHost;
};

type FingerprintFactory = {
  (options?: CollectOptions): FingerprintAPI;
  getFingerprint: typeof getFingerprint;
  collect: typeof collect;
  sendFingerprint: typeof sendFingerprint;
  setStunServerHost: typeof setStunServerHost;
};

function createAPI(defaultOptions: CollectOptions = {}): FingerprintAPI {
  return {
    getFingerprint: (options?: FingerprintOptions, reqId?: string) =>
      getFingerprint({ ...defaultOptions, ...options }, reqId),
    collect: (options?: CollectOptions) =>
      collect({ ...defaultOptions, ...options }),
    sendFingerprint,
    setStunServerHost,
  };
}

const Fingerprint: FingerprintFactory = Object.assign(
  (options?: CollectOptions) => createAPI(options),
  {
    getFingerprint,
    collect,
    sendFingerprint,
    setStunServerHost,
  }
);

// Auto-initialize when loaded via script tag
if (typeof window !== 'undefined') {
  (window as Window & { Fingerprint?: typeof Fingerprint }).Fingerprint = Fingerprint;
}

export default Fingerprint;
