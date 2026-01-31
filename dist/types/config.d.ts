export interface Config {
    baseUrl: string;
    initUrl: string;
    endpointUrl: string;
    trackUrl: string | null;
}
export declare function getConfig(): Config;
