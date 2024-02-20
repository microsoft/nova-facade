# @nova/graphql-compiler

This package contains the compiler that used to be available with `@nova/react`. This compiler is just here for backwards compatibility. We recommend using [`duct-tape-compiler`](https://github.com/microsoft/graphitation/tree/main/packages/apollo-react-relay-duct-tape-compiler) or the latest [`relay-compiler`](https://relay.dev/docs/getting-started/installation-and-setup/#set-up-the-compiler) instead.

## Migration from the embedded compiler inside @nova/react

If you used the embedded compiler inside `@nova/react` you can now use this package instead. This should be a drop in replacement. Upgrading `@nova/react` to version 2.0.0 will remove the embedded compiler. You can then add this package to your project your scripts should keep working.

## Installation

Add `@nova/graphql-compiler` to your project.

Then inside your package.json add the compiler to your `scripts`:

```json
{
  "scripts": {
    "generate": "nova-graphql-compiler"
  }
}
```
