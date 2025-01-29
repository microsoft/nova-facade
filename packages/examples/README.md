# Nova examples

This package contains examples of nova components as well as related good testing approaches for them.

## Nova host integration canary

When configuring a host application, this package can be used as a light-weight canary package to test the host's Nova integration.

### GraphQL

#### Relay

- [Configure your project to have Relay.](https://relay.dev/docs/getting-started/installation-and-setup/)
- [Create a Relay environment.](https://relay.dev/docs/api-reference/relay-environment-provider/)
- Instantiate the Nova Relay example provider:

```tsx
import {
  NovaExampleRelayGraphQLProvider,
  NovaExampleRelayComponent,
} from "@nova/examples";
import { createRelayEnvironment } from "./myHostRelayEnvironment";

const environment = createRelayEnvironment();

const MyHostNovaIntegrationTest = () => {
  return (
    <NovaExampleRelayGraphQLProvider relayEnvironment={environment}>
      <NovaExampleRelayComponent />
    </NovaExampleRelayGraphQLProvider>
  );
};
```

#### Apollo

TODO

### Eventing

TODO

### Commanding

TODO
