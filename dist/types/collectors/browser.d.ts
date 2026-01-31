export declare function getUserAgent(): string;
export declare function getLanguage(): string;
export declare function getLanguages(): string[];
export declare function getPlatform(): string;
export declare function getVendor(): string;
export declare function getVendorFlavors(): string[];
export declare function getDoNotTrack(): string | null;
export declare function getCookiesEnabled(): boolean;
export interface WebdriverResult {
    detected: boolean;
    signals: string[];
}
export declare function getWebdriverPresent(): WebdriverResult;
