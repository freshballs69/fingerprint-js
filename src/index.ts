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
import { getWebRTCInfo } from './collectors/webrtc';
import { getConfig } from './config';
import { sendFingerprint, SendOptions } from './sender';

export { FingerprintComponents, FingerprintResult, FingerprintOptions, CollectOptions } from './types';
export { SendOptions } from './sender';

async function collectComponents(options: FingerprintOptions = {}): Promise<FingerprintComponents> {
  const exclude = new Set(options.excludeComponents || []);

  const webglInfo = !exclude.has('webglVendor') || !exclude.has('webglRenderer') || !exclude.has('webglVersion')
    ? getWebGLInfo()
    : { vendor: '', renderer: '', version: '' };

  const audioFingerprint = !exclude.has('audio')
    ? await getAudioFingerprint()
    : 0;

  const webrtcInfo = !exclude.has('webrtcAvailable') || !exclude.has('webrtcLocalIPs')
    ? await getWebRTCInfo()
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
  };
}

export async function getFingerprint(options: FingerprintOptions = {}): Promise<FingerprintResult> {
  const components = await collectComponents(options);
  const componentsString = JSON.stringify(components);
  const hash = await sha256(componentsString);

  return {
    hash,
    components,
    timestamp: Date.now(),
  };
}

const INIT_ENDPOINT = '/api/init';

function buildTrackUrl(trackUrl: string, reqId: string): string {
  const url = new URL(trackUrl, window.location.origin);
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

async function initRequest(): Promise<{ reqId: string | null; trackUrl: string | null }> {
  const response = await fetch(INIT_ENDPOINT);
  const data = await response.json();
  return {
    reqId: typeof data.req_id === 'string' ? data.req_id : null,
    trackUrl: typeof data.track_url === 'string' ? data.track_url : null
  };
}

export async function collect(options: CollectOptions = {}): Promise<string | null> {
  const initData = await initRequest();
  if (!initData.reqId) {
    return null;
  }

  const result = await new Promise<FingerprintResult>((resolve, reject) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      getFingerprint(options).then(resolve).catch(reject);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        getFingerprint(options).then(resolve).catch(reject);
      });
    }
  });

  const config = getConfig();
  let reqId = initData.reqId;
  const trackUrl = initData.trackUrl || config.trackUrl;

  if (config.endpointUrl) {
    try {
      (result as FingerprintResult & { req_id?: string }).req_id = reqId;
      const response = await sendFingerprint(result, { url: config.endpointUrl });
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
  }

  fireAndForget(trackUrl, reqId);

  return reqId;
}

export { sendFingerprint };

type FingerprintAPI = {
  getFingerprint: typeof getFingerprint;
  collect: typeof collect;
  sendFingerprint: typeof sendFingerprint;
};

type FingerprintFactory = {
  (): FingerprintAPI;
  getFingerprint: typeof getFingerprint;
  collect: typeof collect;
  sendFingerprint: typeof sendFingerprint;
};

const api: FingerprintAPI = {
  getFingerprint,
  collect,
  sendFingerprint,
};

const Fingerprint: FingerprintFactory = Object.assign(() => api, api);

// Auto-initialize when loaded via script tag
if (typeof window !== 'undefined') {
  (window as Window & { Fingerprint?: typeof Fingerprint }).Fingerprint = Fingerprint;
}

export default Fingerprint;
