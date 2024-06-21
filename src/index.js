/**
 * @typedef {import('./fetchover').FetchOverOptions} FetchOverOptions
 */
export { fetchOver, FetchOver } from './fetchover.js'
export { CircuitBroken } from './error.js'
/**
 * @typedef {import('./types').Failover} Failover
 * @typedef {import('./types').ShouldFailoverParam} ShouldFailoverParam
 * @typedef {import('./SimpleFailover').SimpleFailoverOptions} SimpleFailoverOptions
 */
export { SimpleFailover } from './SimpleFailover.js'
export { ExpiryMap } from './ExpiryMap.js'
export { replaceServer } from './utils.js'
