export class CircuitBroken extends Error {
  constructor() {
    super('fetch failed')
    this.status = 503
    this.name = 'CircuitBroken'
  }
}
