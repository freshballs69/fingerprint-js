declare const process: { env: Record<string, string | undefined> } | undefined;

export interface Config {
  endpointUrl: string | null;
  trackUrl: string | null;
}

export function getConfig(): Config {
  let endpointUrl: string | null = null;
  let trackUrl: string | null = null;

  // Check for environment variable (build-time injection via bundlers)
  if (typeof process !== 'undefined') {
    if (process.env?.FINGERPRINT_API) {
      endpointUrl = process.env.FINGERPRINT_API;
    } else if (process.env?.FINGERPRINT_ENDPOINT_URL) {
      endpointUrl = process.env.FINGERPRINT_ENDPOINT_URL;
    }

    if (process.env?.TRACK_API) {
      trackUrl = process.env.TRACK_API;
    }
  }

  // Check for window global (runtime configuration)
  if (typeof window !== 'undefined') {
    const win = window as Window & {
      FINGERPRINT_API?: string;
      FINGERPRINT_ENDPOINT_URL?: string;
      TRACK_API?: string;
    };
    if (win.FINGERPRINT_API) {
      endpointUrl = win.FINGERPRINT_API;
    } else if (win.FINGERPRINT_ENDPOINT_URL) {
      endpointUrl = win.FINGERPRINT_ENDPOINT_URL;
    }
    if (win.TRACK_API) {
      trackUrl = win.TRACK_API;
    }
  }

  if (!endpointUrl) {
    endpointUrl = '/api/fingerprint';
  }

  return { endpointUrl, trackUrl };
}
