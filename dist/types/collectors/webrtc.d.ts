export interface WebRTCInfo {
    available: boolean;
    localIPs: string[];
}
declare global {
    interface Window {
        __stunServerUrl?: string;
    }
}
export declare function getStunServerHost(): string;
export declare function setStunServerHost(url: string): void;
export declare function getWebRTCInfo(reqId?: string): Promise<WebRTCInfo>;
