import assert from 'node:assert'
import { fetchOver, SimpleFailover } from '../src/index.js'
import { Servers } from './server.js'

describe('fetchOver', function () {
  let servers
  let hostnames
  let backups
  before(async () => {
    servers = new Servers()
    hostnames = await servers.listen()
    backups = Object.entries(hostnames)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => (key.startsWith('backup') ? val : undefined))
      .filter(Boolean)
  })
  after(() => {
    servers.close()
  })

  it('throws if failover is missing', function () {
    try {
      fetchOver({})
      new Error()
    } catch (err) {
      assert.equal(err.message, 'no failover')
    }
  })

  it('failover shall fail if there are no servers left', async function () {
    const failover = new SimpleFailover({ servers: ['https://test.tld'] })
    failover._servers = []
    const fetch = fetchOver({ failover })
    try {
      await fetch(hostnames.target + '/fail-target')
      throw new Error()
    } catch (err) {
      assert.equal(err.name, 'CircuitBroken')
    }
  })

  describe('sequential', function () {
    let fetch
    const timeout = 50
    beforeEach(() => {
      const failover = new SimpleFailover({ servers: backups, timeout })
      fetch = fetchOver({ failover })
    })

    it('/ok', async function () {
      const res = await fetch(hostnames.target + '/ok')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'target')
    })

    it('/fail', async function () {
      const res = await fetch(hostnames.target + '/fail')
      assert.equal(res.status, 500)
      assert.equal(res.headers.get('x-server'), 'backup3')
    })

    it('/fail-target', async function () {
      const res = await fetch(hostnames.target + '/fail-target')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup1')
    })

    it('/fail-backup1', async function () {
      const res = await fetch(hostnames.target + '/fail-backup1')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup2')
    })

    it('/fail-backup2', async function () {
      const res = await fetch(hostnames.target + '/fail-backup2')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup1')
    })

    it('/fail-backup3', async function () {
      const res = await fetch(hostnames.target + '/fail-backup3')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup1')
    })
  })

  describe('parallel', function () {
    let fetch
    const timeout = 50
    beforeEach(() => {
      const failover = new SimpleFailover({ servers: backups, timeout })
      fetch = fetchOver({ failover, strategy: 'parallel' })
    })

    it('/ok', async function () {
      const res = await fetch(hostnames.target + '/ok')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'target')
    })

    it('/fail', async function () {
      try {
        await fetch(hostnames.target + '/fail')
        throw new Error()
      } catch (err) {
        assert.equal(err.message, 'fetch failed')
      }
    })

    it('/fail-target', async function () {
      const res = await fetch(hostnames.target + '/fail-target')
      assert.equal(res.status, 200)
    })

    it('/fail-backup1', async function () {
      const res = await fetch(hostnames.target + '/fail-backup1')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup3')
    })

    it('/fail-backup2', async function () {
      const res = await fetch(hostnames.target + '/fail-backup2')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup3')
    })

    it('/fail-backup3', async function () {
      const res = await fetch(hostnames.target + '/fail-backup3')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup2')
    })
  })

  describe('forceTimeout', function () {
    let fetch
    const timeout = 50
    before(() => {
      servers._opts.forceTimeout = true
    })
    after(() => {
      servers._opts.forceTimeout = false
    })
    beforeEach(() => {
      const failover = new SimpleFailover({ servers: backups, timeout })
      fetch = fetchOver({ failover })
    })

    it('/ok', async function () {
      const res = await fetch(hostnames.target + '/ok')
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'target')
    })

    it('/fail', async function () {
      try {
        await fetch(hostnames.target + '/fail', { timeout: 50 })
        new Error()
      } catch (err) {
        assert.equal(err.name, 'TimeoutError')
      }
    })

    it('/fail-target', async function () {
      const res = await fetch(hostnames.target + '/fail-target', {
        timeout: 100
      })
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup1')
    })

    it('/fail-backup1', async function () {
      const res = await fetch(hostnames.target + '/fail-backup1', {
        timeout: 100
      })
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup2')
    })

    it('/fail-backup2', async function () {
      const res = await fetch(hostnames.target + '/fail-backup2', {
        timeout: 100
      })
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup1')
    })

    it('/fail-backup3', async function () {
      const res = await fetch(hostnames.target + '/fail-backup3', {
        timeout: 100
      })
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-server'), 'backup1')
    })
  })
})
