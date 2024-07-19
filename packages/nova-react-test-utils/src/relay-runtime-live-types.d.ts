// Relay does not export this type, so we declare it here for now.
// In a future release of relay-runtime, this type will be exported.
// When that happens, we can remove this declaration.
declare module "relay-runtime/lib/store/experimental-live-resolvers/LiveResolverStore" {
  import { Store } from "relay-runtime";
  export default class LiveResolverStore extends Store {}
}
