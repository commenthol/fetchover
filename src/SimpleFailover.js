import { ExpiryMap } from './ExpiryMap.js'

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
export class SimpleFailover {
  /**
   * @param {SimpleFailoverOptions} param
   */
  constructor(param) {
    const { servers, timeout = 5e3 } = param
    if (!servers?.length) {
      throw new Error('servers are empty')
    }
    const _servers = servers.map((server) => {
      const s = new URL(server)
      if (s.pathname !== '/') {
        throw new TypeError(`illegal pathname in ${server}`)
      }
      return s.origin
    })

    this._servers = [...new Set(_servers)]
    this._inactive = new ExpiryMap(timeout)
  }

  /**
   * @param {URL} url
   */
  isReady(url) {
    const { origin } = url
    return !this._inactive.get(origin)
  }

  /**
   * @param {ShouldFailoverParam} param0
   * @returns {boolean}
   */
  shouldFailover({ err, response, server }) {
    // @ts-expect-error
    const doFailover = !!err || response?.status >= 500
    if (doFailover) {
      this._inactive.set(server, true)
    } else {
      this._inactive.delete(server)
    }
    return doFailover
  }

  /**
   * @returns {Promise<string[]>}
   */
  async resolveServers() {
    const active = []
    for (const server of this._servers) {
      if (this._inactive.get(server)) continue
      active.push(server)
    }
    return active
  }
}
