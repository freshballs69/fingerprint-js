export interface Config {
    baseUrl: string;
    trackUrl: string | null;
}
export declare function getConfig(): Config;
export declare function getInitUrl(publicKey?: string): string;
export declare function getEndpointUrl(): string;
