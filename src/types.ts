export interface FingerprintComponents {
  userAgent: string;
  language: string;
  languages: string[];
  colorDepth: number;
  screenResolution: [number, number];
  availableScreenResolution: [number, number];
  timezone: string;
  timezoneOffset: number;
  sessionStorage: boolean;
  localStorage: boolean;
  indexedDb: boolean;
  cookiesEnabled: boolean;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  maxTouchPoints: number;
  vendor: string;
  vendorFlavors: string[];
  canvas: string;
  webglVendor: string;
  webglRenderer: string;
  webglVersion: string;
  fonts: string[];
  audio: number;
  plugins: string[];
  doNotTrack: string | null;
  webrtcAvailable: boolean;
  webrtcLocalIPs: string[];
}

export interface FingerprintResult {
  hash: string;
  components: FingerprintComponents;
  timestamp: number;
}

export interface FingerprintOptions {
  excludeComponents?: (keyof FingerprintComponents)[];
  timeout?: number;
}

export interface CollectOptions extends FingerprintOptions {}
