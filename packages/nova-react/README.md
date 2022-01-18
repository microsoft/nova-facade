# nova-react

The Nova Facade is a set of interfaces that represent the core framework dependencies of a data-backed UI component in a large application. This allows high value components to be written in a host agnostic fashion and used within any host that implements the Nova contracts.

This package provides a React specific implementation of the contexts etc required to make the host implementations accessible to the Nova component code, with the sister package @nova/types providing a framework agnostic set of contracts.

## Prerequisites

In order to use this package without compilation of documents, i.e. to parse string documents at runtime, make sure to add `@graphitation/graphql-js-tag` as a dependency in your `package.json` along side with `@nova/react`.

## Bundle size cost

In order to eliminate majority of cost from the bundle, several pre-conditions must be met:

- Your bundler, typescript and package should configured to use ESM/.mjs modules for module resolution
- You should use a transform to parse graphql documents on compile time

### Bundler and typescript configuration

In your package, use `import` and `export` statements instead of `require`. In tsconfig.json your `module` should be set to `ES6`. Webpack 5 seems to be doing the right thing after the previous two items are done. For Webpack 4, things might not work in a weird way. We recommend updating to Webpack 5. One way we have seen people make it work in webpack 4 is by adding the following to their webpack config. YMMV.

```js
{
  test: /\.mjs$/,
  include: /node_modules/,
  type: "javascript/auto",
},
```

### GraphQL pre-parsing

`graphql` tag is not meant to be used in runtime outside of development. It brings big dependencies like `graphql-js` and does query parsing on runtime. Instead consider using one of the transforms that can pre-parse it.

#### Webpack

For `ts-loader` use @graphitation/ts-transform-graphql-js-tag

```js
const { getTransformer } = require("@graphitation/ts-transform-graphql-js-tag");


{
  test: /\.tsx?$/,
  loader: "ts-loader",
  options: {
    getCustomTransformers: () => ({
      before: [
        getTransformer({
          graphqlTagModuleExport: "graphql",
          graphqlTagModule: "@nova/react",
        }),
      ],
    }),
  },
},
```

For `babel-loader` (make sure template tags aren't stripped out by typescript by setting `target` to be at least `ES6`) use `babel-plugin-graphql-tag`

```js
{
  loader: "babel-loader",
  options: {
    plugins: [
      [
        "babel-plugin-graphql-tag",
        {
            strip: true,
            importSources: ["@nova/react"],
            gqlTagIdentifiers: ["graphql"],
        },
      ],
    ],
  },
},
```
