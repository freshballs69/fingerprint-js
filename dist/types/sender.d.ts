import { FingerprintResult } from './types';
export interface SendOptions {
    url: string;
    method?: 'POST' | 'PUT';
    headers?: Record<string, string>;
}
export declare function sendFingerprint(result: FingerprintResult, options: SendOptions): Promise<Response>;
