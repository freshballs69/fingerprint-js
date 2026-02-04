declare const process: { env: Record<string, string | undefined> } | undefined;

const DEFAULT_BASE_URL = 'http://127.0.0.1:5001';

export interface Config {
  baseUrl: string;
  trackUrl: string | null;
}

export function getConfig(): Config {
  let baseUrl: string = DEFAULT_BASE_URL;
  let trackUrl: string | null = null;

  // Check for environment variable (build-time injection via bundlers)
  if (typeof process !== 'undefined') {
    if (process.env?.FINGERPRINT_BASE_URL) {
      baseUrl = process.env.FINGERPRINT_BASE_URL;
    }
    if (process.env?.TRACK_API) {
      trackUrl = process.env.TRACK_API;
    }
  }

  // Check for window global (runtime configuration) - overrides env vars
  if (typeof window !== 'undefined') {
    const win = window as Window & {
      FINGERPRINT_BASE_URL?: string;
      TRACK_API?: string;
    };
    if (win.FINGERPRINT_BASE_URL) {
      baseUrl = win.FINGERPRINT_BASE_URL;
    }
    if (win.TRACK_API) {
      trackUrl = win.TRACK_API;
    }
  }

  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, '');

  return {
    baseUrl,
    trackUrl,
  };
}

export function getInitUrl(publicKey?: string): string {
  const config = getConfig();
  const url = new URL(`${config.baseUrl}/api/v2/init`);
  if (publicKey) {
    url.searchParams.set('public_key', publicKey);
  }
  return url.toString();
}

export function getEndpointUrl(): string {
  const config = getConfig();
  return `${config.baseUrl}/api/v2/fingerprint`;
}
