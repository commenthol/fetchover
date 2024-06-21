import assert from 'node:assert'
import { AbortableFetch } from '../src/AbortableFetch.js'
import { nap, Servers } from './server.js'

describe('AbortableFetch', function () {
  let servers
  let hostnames
  before(async () => {
    servers = new Servers({ hostnames: ['target'] })
    hostnames = await servers.listen()
  })
  after(() => {
    servers.close()
  })

  it('shall fetch', async function () {
    const request = new AbortableFetch(hostnames.target + '/ok')
    const response = await request.fetch()
    assert.equal(response.ok, true)
  })

  it('fetch shall timeout', async function () {
    const request = new AbortableFetch(hostnames.target + '/timeout', {
      timeout: 500
    })
    try {
      await request.fetch()
      throw new Error()
    } catch (err) {
      assert.equal(err.name, 'TimeoutError')
    }
  })

  it('fetch shall timeout with own signal', async function () {
    const signal = AbortSignal.timeout(500)
    const request = new AbortableFetch(hostnames.target + '/timeout', {
      signal
    })
    try {
      await request.fetch()
      throw new Error()
    } catch (err) {
      assert.equal(err.name, 'TimeoutError')
    }
  })

  it('fetch shall abort', async function () {
    const request = new AbortableFetch(hostnames.target + '/timeout')
    try {
      nap(500).then(() => request.abort())
      await request.fetch()
      throw new Error()
    } catch (err) {
      assert.equal(err.name, 'AbortError')
    }
  })
})
