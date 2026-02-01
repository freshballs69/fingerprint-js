export interface WebRTCInfo {
    available: boolean;
    localIPs: string[];
}
declare global {
    interface Window {
        __stunServerHost?: string;
    }
}
export declare function getStunServerHost(): string;
export declare function setStunServerHost(host: string): void;
export declare function getWebRTCInfo(reqId?: string): Promise<WebRTCInfo>;
