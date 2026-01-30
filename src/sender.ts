import { FingerprintResult } from './types';

export interface SendOptions {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
}

export async function sendFingerprint(
  result: FingerprintResult,
  options: SendOptions
): Promise<Response> {
  const { url, method = 'POST', headers = {} } = options;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(result),
  });

  return response;
}
