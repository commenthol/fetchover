/**
 * @typedef {import('./types.d.ts').Failover} Failover
 */
/**
 * @typedef {{
 *  failover: Failover
 *  strategy?: 'sequential' | 'random' | 'parallel'
 *  fetchImpl?: fetch
 * }} FetchOverOptions
 */
export class FetchOver {
    /**
     * @param {FetchOverOptions} options
     */
    constructor(options: FetchOverOptions);
    _failover: import("./types.d.ts").Failover;
    _fetchImpl: typeof fetch | undefined;
    _resolver: (requests: any) => Promise<any>;
    /**
     * @param {URL|string} url
     * @param {RequestInit} init
     * @returns {Promise<Response>}
     */
    fetch(url: URL | string, init: RequestInit): Promise<Response>;
    _sequentialStrategy(requests: any): Promise<any>;
    _randomStrategy(requests: any): Promise<any>;
    _parallelStrategy(requests: any): Promise<any>;
}
export function fetchOver(options: FetchOverOptions): typeof fetch;
export type Failover = import("./types.d.ts").Failover;
export type FetchOverOptions = {
    failover: Failover;
    strategy?: "sequential" | "random" | "parallel";
    fetchImpl?: typeof fetch;
};
