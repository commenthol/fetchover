# fetchover

A fetch implementation with extensible failover strategies.

Supports node and browsers.

## Usage

```js
import { fetchOver, SimpleStrategy } from 'fetchover'

// define your failover servers
const servers = [
  'https://fallback1.server',
  'https://fallback2.server'
]
// choose a failover implemention (or create your own)
const failover = new SimpleFailover({ servers, timeout: 5e3 })
const fetch = fetchOver({ failover, strategy: 'sequential' })

// just fetch as always (with optional timeout)
const res = await fetch('https://target.server', { timeout: 10e3 })
```

Different strategies are available.
- `strategy='sequential'` (default) the "fallback" servers are called one after
  another in sequence.  
- `strategy='random'` is similar but the order of "fallback" servers being
  called is random.  
- `strategy='parallel'` all servers are called in parallel. The response of the
  first to succeed is returned, the other requests are aborted.  
  ⚠️ *Note: Take care to cope with multiple writes, e.g. using*
  *optimistic-locking in your DB.*

# Failover

For customizing the behavior of the failover scenarios different `failover`
adapters are offered.

## SimpleFailover

The `SimpleFailover` mechanism will issue the request (using the same pathname
but different hostname) to different "fallback" servers in case that the
"target" server of the initial request is unavailable.

*type declaration*

```ts
interface SimpleFailoverOptions {
  /** list of failover servers */
  servers: string[]
  /**
   * timeout of consecutive request after failure
   * @default 5e3
   */
  timeout?: number
}

class SimpleFailover implements Failover {
    constructor(param: SimpleFailoverOptions);
}
```

## License

[MIT Licensed](./LICENSE)