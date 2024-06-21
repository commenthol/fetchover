/**
 * @license Unlicense
 * @source https://github.com/commenthol/snippets
 */
/**
 * map with expiring entries
 */
export class ExpiryMap extends Map<any, any> {
    /**
     * @param {number} [expires] in milliseconds; default 1min
     * @param {number} [interval] in milliseconds; default expires/2; 0 means that no
     * cleanup timer is triggered
     */
    constructor(expires?: number | undefined, interval?: number | undefined);
    _expires: number;
    _interval: number;
    /**
     * @private
     */
    private _timer;
    _timerId: any;
    /**
     * cleanup expired entries
     */
    cleanup(): void;
    get(key: any): any;
    /**
     * @param {any} key
     * @param {any} value
     * @param {number} [expires] - expiry in milliseconds
     */
    set(key: any, value: any, expires?: number | undefined): this;
}
