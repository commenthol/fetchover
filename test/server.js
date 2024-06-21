import http from 'node:http'

const PROTO = 'local://local'
export class LocalURL extends URL {
  constructor(url) {
    super(url, PROTO)
  }

  toString() {
    const u = super.toString()
    if (u.startsWith(PROTO)) {
      return u.slice(PROTO.length)
    }
    return u
  }
}

export const nap = (ms = 100) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(ms)
    }, ms)
  )

const HOSTNAMES = ['target', 'backup1', 'backup2', 'backup3']

const send = (res, serverName, status = 200, ms = 0) => {
  res.statusCode = status
  res.setHeader('x-server', serverName)
  setTimeout(() => {
    res.end(serverName || '')
    // console.log(Date.now(), serverName, status, ms)
  }, ms).unref()
}

const promise = () => {
  const p = {}
  p.promise = new Promise((resolve, reject) => {
    p.resolve = resolve
    p.reject = reject
  })
  return p
}

const setup = (hostname, opts) => {
  const { hostnames } = opts
  const router = new Map()
  router.set('/404', (req, res) => send(res, '', 404))
  router.set('/ok', (req, res) => send(res, hostname))
  router.set('/fail', (req, res) => {
    if (opts.forceTimeout) return
    send(res, hostname, 500)
  })
  router.set('/timeout', (req, res) => {
    send(res, hostname, 500, 30e3)
  })

  const delayByHn = [...hostnames].reverse().reduce((acc, hostname, i) => {
    acc[hostname] = (i + 1) * 10
    return acc
  }, {})

  const hostFail = (_hostname) => {
    router.set('/fail-' + _hostname, (req, res) => {
      const isHN = ['target', _hostname].includes(hostname)
      // console.log(Date.now(), hostname, '>>')
      if (opts.forceTimeout && isHN) return
      send(res, hostname, isHN ? 500 : 200, delayByHn[hostname])
    })
  }
  for (const _hostname of hostnames) {
    hostFail(_hostname)
  }

  return (req, res) => {
    req._url = new LocalURL(req.url)
    const route = router.get(req._url.pathname)
    if (route) {
      route(req, res)
    } else {
      console.warn(`no route for ${req._url.pathname}`)
      route.get('/404')(req, res)
    }
  }
}

export class Servers {
  constructor(opts = {}) {
    this._opts = {
      forceTimeout: false,
      hostnames: HOSTNAMES,
      ...opts
    }
    this._servers = {}
  }

  async listen() {
    const hosts = {}
    for (const hostname of this._opts.hostnames) {
      const server = http.createServer(setup(hostname, this._opts))
      const p = promise()
      server.listen(0, () => {
        p.resolve()
      })
      await p.promise
      const { port } = server.address()
      this._servers[hostname] = { server, port }
      hosts[hostname] = `http://localhost:${port}`
    }
    return hosts
  }

  close() {
    for (const hostname of Object.keys(this._servers)) {
      const server = this._servers[hostname]?.server
      server && server.close()
    }
  }
}
