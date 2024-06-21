import { CircuitBroken } from './error.js'
import { replaceServer, shuffle } from './utils.js'
import { AbortableFetch } from './AbortableFetch.js'

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
  constructor(options) {
    const { failover, fetchImpl, strategy = 'sequential' } = options
    if (!failover) {
      throw new TypeError('no failover')
    }
    this._failover = failover
    this._fetchImpl = fetchImpl
    this._resolver =
      strategy === 'parallel'
        ? this._parallelStrategy
        : strategy === 'random'
          ? this._randomStrategy
          : this._sequentialStrategy
  }

  /**
   * @param {URL|string} url
   * @param {RequestInit} init
   * @returns {Promise<Response>}
   */
  async fetch(url, init) {
    let err = null
    let response

    if (typeof url === 'string') {
      url = new URL(url)
    }
    if (this._failover.isReady(url)) {
      try {
        const request = new AbortableFetch(url, init, this._fetchImpl)
        response = await request.fetch()
      } catch (/** @type {any} */ e) {
        err = e
      }
      if (
        !this._failover.shouldFailover({ err, response, server: url.origin })
      ) {
        if (err || !response) throw err || new CircuitBroken()
        return response
      }
    }

    const servers = await this._failover.resolveServers()
    if (!servers?.length) {
      throw new CircuitBroken()
    }

    const requests = []

    for (const server of servers) {
      const request = new AbortableFetch(
        replaceServer(url, server),
        init,
        this._fetchImpl
      )
      requests.push(request)
    }

    return await this._resolver(requests)
  }

  async _sequentialStrategy(requests) {
    let err = null
    let response
    for (const request of requests) {
      try {
        return await request.fetchShouldFailover(this._failover)
      } catch (/** @type {any} */ e) {
        err = e
        response = request.response
      }
    }
    if (response) {
      return response
    }
    throw err || new CircuitBroken()
  }

  async _randomStrategy(requests) {
    return this._sequentialStrategy(shuffle(requests))
  }

  async _parallelStrategy(requests) {
    try {
      const response = await Promise.any(
        requests.map((request) => request.fetchShouldFailover(this._failover))
      )
      // abort all other running requests
      requests.map((request) => request.abort())
      return response
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      throw new CircuitBroken()
    }
  }
}

/**
 * @param {FetchOverOptions} options
 * @returns {fetch}
 */
export const fetchOver = (options) => {
  const fo = new FetchOver(options)
  return (url, init) => fo.fetch(url, init)
}
