export interface WebRTCInfo {
    available: boolean;
    localIPs: string[];
}
export declare function getWebRTCInfo(): Promise<WebRTCInfo>;
