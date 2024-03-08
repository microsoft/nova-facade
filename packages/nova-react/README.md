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

## Eventing

Nova eventing exposes a clearly contracted, component driven way to surface actions that occur within in the boundaries of a component.
These events are published in an independent package so that they can be easily consumed by code that is outside of the component tree.

### Primary Use Cases for Events

- Bubbling a button click that should perform some sort of navigation or external action, like opening a modal on host app side
- Bubbling an internal action that needs to be logged

### Eventing Contract

Eventing is primarily a contract between the component owner and host apps. The Event data object should contain all the appropriate context to allow the host apps to appropriately handle the event.

If the host app needs additional data to perform an action, this should be discussed with the component team to add an event or extend the data sent.

### Basic example

```tsx
import { NovaEventingProvider, reactEventMapper } from "@nova/react";

const eventHandler = (eventWrapper: EventWrapper) => {
  if (eventWrapper.event.eventType === "showProfile") {
    // trigger some action to show profile
  }
  if (eventWrapper.originator === "MyComponent") {
    return handleEventsForMyComponent(eventWrapper);
  }
};

const AppEventingProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NovaEventingProvider
      bubble={eventHandler}
      reactEventMapper={
        reactEventMapper
      } /* you can also provide your own implementation of mapper */
    >
      {children}
    </NovaEventingProvider>
  );
};
```

Then in some low level component

```tsx
import { useNovaEventing } from "@nova/react";

const MyComponent = () => {
  const eventing = useNovaEventing();

  const handleClick = (event: React.SyntheticEvent) => {
    eventing.bubble({
      reactEvent: event,
      event: {
        eventType: "selectProfile",
        originator: "MyComponent",
        data: () => ({
          userId: "123",
        }),
      },
    });
  };

  return <button onClick={handleClick}>Select profile</button>;
};
```

### Intercepting events

As `NovaEventingProvider` is usually defined at the top level of the app, you may want to intercept events, which are more specific to your component and can be handled on lower level. This is not encouraged as it makes the handling not reusable by other component but if you are sure the event is specific and you want to handle it lower (like passing some arguments to your host app wrapper), you can use `NovaEventingInterceptor`:

```tsx
const MyComponentWrapper = () => {
  const [userId, setUserId] = useState<string | null>(null);

  const defaultInterceptor = (eventWrapper: EventWrapper) => {
    if (
      eventWrapper.event.originator === "MyComponent" &&
      eventWrapper.event.eventType === "selectProfile"
    ) {
      const data = eventWrapper.event.data();
      setUserId(data.userId);
      return Promise.resolve(undefined);
    } else {
      return Promise.resolve(eventWrapper);
    }
  };

  return (
    <NovaEventingInterceptor intercept={defaultInterceptor}>
      {userId && <Profile userId={userId} />}
      <ComponentThatRenderMyComponentSomewhereInside />
    </NovaEventingInterceptor>
  );
};
```

The `NovaEventingInterceptor` will intercept the event and if you can check it's properties to decide if is should be acted upon. If from `intercept` promise resolving to undefined is returned the event will not be passed to eventing higher up the tree. However, if to process the event further, one should return a promise resolving to the `eventWrapper` object. That also gives a possibility to alter the event and still pass it further up.
