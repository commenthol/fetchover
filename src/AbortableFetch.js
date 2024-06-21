import { CircuitBroken } from './error.js'

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
  constructor(url, init, fetchImpl) {
    this._fetchImpl = fetchImpl || fetch
    this._server = url.origin
    this._url = url
    this._init = init
  }

  /**
   * @returns {string}
   */
  get server() {
    return this._server
  }

  get response() {
    return this._response
  }

  /**
   * @returns {Promise<Response>}
   */
  fetch() {
    const { _fetchImpl, _url: url } = this
    const { signal: _signal, timeout = 30e3, ...init } = this._init || {}
    this._controller = anySignal([_signal, AbortSignal.timeout(timeout)])
    const signal = this._controller.signal
    return _fetchImpl(url, { ...init, signal })
  }

  /**
   * @param {import('./fetchover.js').Failover} failover
   * @returns {Promise<Response|undefined>}
   */
  async fetchShouldFailover(failover) {
    let err = null
    let response
    try {
      response = await this.fetch()
    } catch (/** @type {any} */ e) {
      err = e
    }
    const ok = !failover.shouldFailover({
      err,
      response,
      server: this._server
    })
    this._response = response
    if (!ok) {
      throw err || new CircuitBroken()
    }
    return response
  }

  abort() {
    this._controller?.abort()
  }
}

/**
 * https://github.com/whatwg/fetch/issues/905
 * @param {(AbortSignal|undefined|null)[]} signals
 * @returns {AbortController}
 */
function anySignal(signals) {
  const controller = new AbortController()
  const unsubscribe = []

  function onAbort(signal) {
    controller.abort(signal.reason)
    unsubscribe.forEach((f) => f())
  }

  for (const signal of signals) {
    if (!signal) continue
    if (signal.aborted) {
      onAbort(signal)
      break
    }
    const handler = onAbort.bind(undefined, signal)
    signal.addEventListener('abort', handler)
    unsubscribe.push(() => signal.removeEventListener('abort', handler))
  }

  return controller
}
