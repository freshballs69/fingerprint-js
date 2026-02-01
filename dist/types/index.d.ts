import { FingerprintResult, FingerprintOptions, CollectOptions } from './types';
import { setStunServerHost, getStunServerHost } from './collectors/webrtc';
import { sendFingerprint } from './sender';
export { FingerprintComponents, FingerprintResult, FingerprintOptions, CollectOptions } from './types';
export { SendOptions } from './sender';
export declare function getFingerprint(options?: FingerprintOptions, reqId?: string): Promise<FingerprintResult>;
export declare function collect(options?: CollectOptions): Promise<string | null>;
export { sendFingerprint };
export { setStunServerHost, getStunServerHost };
type FingerprintAPI = {
    getFingerprint: typeof getFingerprint;
    collect: typeof collect;
    sendFingerprint: typeof sendFingerprint;
    setStunServerHost: typeof setStunServerHost;
};
type FingerprintFactory = {
    (): FingerprintAPI;
    getFingerprint: typeof getFingerprint;
    collect: typeof collect;
    sendFingerprint: typeof sendFingerprint;
    setStunServerHost: typeof setStunServerHost;
};
declare const Fingerprint: FingerprintFactory;
export default Fingerprint;
