export { CircuitBroken } from "./error.js";
export { SimpleFailover } from "./SimpleFailover.js";
export { ExpiryMap } from "./ExpiryMap.js";
export { replaceServer } from "./utils.js";
export type FetchOverOptions = import("./fetchover").FetchOverOptions;
export type Failover = import("./types").Failover;
export type ShouldFailoverParam = import("./types").ShouldFailoverParam;
export type SimpleFailoverOptions = import("./SimpleFailover").SimpleFailoverOptions;
export { fetchOver, FetchOver } from "./fetchover.js";
