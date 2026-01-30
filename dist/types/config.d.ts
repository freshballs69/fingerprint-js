export interface Config {
    endpointUrl: string | null;
    trackUrl: string | null;
}
export declare function getConfig(): Config;
