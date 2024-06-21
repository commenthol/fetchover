/**
 * @typedef {import('./types.js').Failover} Failover
 * @typedef {import('./types.js').ShouldFailoverParam} ShouldFailoverParam
 */
/**
 * @typedef {object} SimpleFailoverOptions
 * @property {string[]} servers list of failover servers
 * @property {number} [timeout=5e3] timeout of consecutive request after failure
 */
/**
 * @implements {Failover}
 */
export class SimpleFailover implements Failover {
    /**
     * @param {SimpleFailoverOptions} param
     */
    constructor(param: SimpleFailoverOptions);
    _servers: string[];
    _inactive: ExpiryMap;
    /**
     * @param {URL} url
     */
    isReady(url: URL): boolean;
    /**
     * @param {ShouldFailoverParam} param0
     * @returns {boolean}
     */
    shouldFailover({ err, response, server }: ShouldFailoverParam): boolean;
    /**
     * @returns {Promise<string[]>}
     */
    resolveServers(): Promise<string[]>;
}
export type Failover = import("./types.js").Failover;
export type ShouldFailoverParam = import("./types.js").ShouldFailoverParam;
export type SimpleFailoverOptions = {
    /**
     * list of failover servers
     */
    /**
     * list of failover servers
     */
    servers: string[];
    /**
     * timeout of consecutive request after failure
     */
    /**
     * timeout of consecutive request after failure
     */
    timeout?: number | undefined;
};
import { ExpiryMap } from './ExpiryMap.js';
