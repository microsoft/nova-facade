# nova-react

The Nova Facade is a set of interfaces that represent the core framework dependencies of a data-backed UI component in a large application. This allows high value components to be written in a host agnostic fashion and used within any host that implements the Nova contracts.

This package provides a React specific implementation of the contexts etc required to make the host implementations accessible to the Nova component code, with the sister package @nova/types providing a framework agnostic set of contracts.

## Prerequisites

In order to use this package, make sure to add `@graphitation/graphql-js-tag` as a dependency in your `package.json` along side with `@nova/react`.