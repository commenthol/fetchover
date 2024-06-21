/**
 * @typedef {{timeout?: number}} RequestInitTimeoutDef
 * @typedef {RequestInitTimeoutDef & RequestInit} RequestInitTimeout
 */
export class AbortableFetch {
    /**
     * @param {URL} url
     * @param {RequestInitTimeout} [init]
     * @param {fetch} [fetchImpl]
     */
    constructor(url: URL, init?: RequestInitTimeout | undefined, fetchImpl?: typeof fetch | undefined);
    _fetchImpl: typeof fetch;
    _server: string;
    _url: URL;
    _init: RequestInitTimeout | undefined;
    /**
     * @returns {string}
     */
    get server(): string;
    get response(): Response | undefined;
    /**
     * @returns {Promise<Response>}
     */
    fetch(): Promise<Response>;
    _controller: AbortController | undefined;
    /**
     * @param {import('./fetchover.js').Failover} failover
     * @returns {Promise<Response|undefined>}
     */
    fetchShouldFailover(failover: import("./fetchover.js").Failover): Promise<Response | undefined>;
    _response: Response | undefined;
    abort(): void;
}
export type RequestInitTimeoutDef = {
    timeout?: number;
};
export type RequestInitTimeout = RequestInitTimeoutDef & RequestInit;
