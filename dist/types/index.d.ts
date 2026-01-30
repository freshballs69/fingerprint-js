import { FingerprintResult, FingerprintOptions, CollectOptions } from './types';
import { sendFingerprint } from './sender';
export { FingerprintComponents, FingerprintResult, FingerprintOptions, CollectOptions } from './types';
export { SendOptions } from './sender';
export declare function getFingerprint(options?: FingerprintOptions): Promise<FingerprintResult>;
export declare function collect(options?: CollectOptions): Promise<string | null>;
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
declare const Fingerprint: FingerprintFactory;
export default Fingerprint;
