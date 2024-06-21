export interface ShouldFailoverParam {
  server: string
  err: Error | null
  response: Response | undefined
}

export interface Failover {
  /** checks if url.origin is reported as being reachable */
  isReady(url: URL): boolean
  /** ask if failover should trigger */
  shouldFailover(param0: ShouldFailoverParam): boolean
  /** resolve servers for failover */
  resolveServers(): Promise<string[]>
}
