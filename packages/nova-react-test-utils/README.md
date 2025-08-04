# nova-react-test-utils

The Nova Facade is a set of interfaces that represent the core framework dependencies of a data-backed UI component in a large application. This allows high value components to be written in a host agnostic fashion and used within any host that implements the Nova contracts.

This package provides test utilities for components written with the React specific implementation. The purpose of these utilities is to expose capabilities of [MockPayloadGenerator](https://github.com/microsoft/graphitation/tree/main/packages/graphql-js-operation-payload-generator), [Apollo mock client](https://github.com/microsoft/graphitation/tree/main/packages/apollo-mock-client) and [relay-test-utils](https://github.com/facebook/relay/tree/main/packages/relay-test-utils) in Nova context.

The utilities provided by this package should be used to test [apollo-react-relay-duct-tape](https://github.com/microsoft/graphitation/tree/main/packages/apollo-react-relay-duct-tape) or [react-relay](https://github.com/facebook/relay/tree/main/packages/react-relay) based components. Two variants of each utility and decorator are exposed under both `@nova/react-test-utils/apollo` and `@nova/react-test-utils/relay`, which should be picked based on which GraphQL runtime you want your tests and storybooks to use. If importing directly from `@nova/react-test-utils`, Relay variants will be imported by default.

## Prerequisites

If you are using GraphQL setup with artifact generation (like Relay or Apollo Duct Tape with `--emitDocuments`), you need to make sure that artifacts loader is setup for stories/tests. Depending on the tool, you can use [@graphitation/embedded-document-artefact-loader](@graphitation/embedded-document-artefact-loader) or [@swc/plugin-relay](https://www.npmjs.com/package/@swc/plugin-relay) for storybook. For unit tests, [examples](../examples/vitest.plugins.ts) contains a usage with vitest plugin and for jest you should rely on [babel-plugin-relay](https://www.npmjs.com/package/babel-plugin-relay) or [@graphitation/embedded-document-artefact-loader](https://github.com/microsoft/graphitation/tree/main/packages/embedded-document-artefact-loader#jest).

## Unit tests

To leverage the power of mentioned packages inside your unit tests, you need to wrap the tested component with `NovaMockEnvironmentProvider`:

```tsx
import {
  createMockEnvironment,
  MockPayloadGenerator,
  NovaMockEnvironmentProvider,
} from "@nova/react-test-utils/apollo";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const environment = createMockEnvironment(schema);
render(
  <NovaMockEnvironmentProvider environment={environment}>
    <SomeTestSubject />
  </NovaMockEnvironmentProvider>,
);

await act(async () =>
  environment.graphql.mock.resolveMostRecentOperation((operation) =>
    MockPayloadGenerator.generate(operation),
  ),
);

const button = await screen.findByRole("button", { name: "Click me" });
userEvent.click(button);
expect(environment.eventing.bubble).toHaveBeenCalled();
```

Let's break it down:

If you are familiar with [testing guidelines for Relay components](https://relay.dev/docs/guides/testing-relay-components/), you will quickly notice resemblance of this package API and Relay testing utilities. `createMockEnvironment` creates a Nova environment object that can be used with the `NovaMockEnvironmentProvider` and has mocks instantiated for each piece of the facade interface (eventing, commanding and graphql). `createMockEnvironment` takes a schema as an argument. The schema is a GraphQL schema that is later used to generate mock data for the GraphQL mock.

The `environment.graphql.mock` mock provides an API to act on operations issued by a component tree. For details on the API see [apollo-mock-client docs](https://github.com/microsoft/graphitation/tree/main/packages/apollo-mock-client). Together with mock client, which intercepts all operations, for mock data generation one can use `MockPayloadGenerator` whose generate function is leveraging [graphql-js-operation-payload-generator](https://github.com/microsoft/graphitation/tree/main/packages/graphql-js-operation-payload-generator). Both of these packages are a bit more powerful ports of [Relay testing utilities](https://relay.dev/docs/guides/testing-relay-components/#relaymockenvironment-api-overview).

Each call to `graphql.mock.resolve/reject` should be wrapped in `await act(async () => ...)` as each state update in RTL needs to be wrapped in `act` and we want to wait for the operation to finish.

The `environment.eventing.bubble` is simple `jest.fn()` so you can assert on it.

## Storybook

Similarly to unit tests this package provides decorators for storybook stories using
either Apollo or Relay. The package exposes two implementation of same `getNovaDecorator` one for Relay and one for Apollo. One should be picked based on whether or not the component is using Apollo or Relay as GraphQL client.

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import type {
  type UnknownOperation,
  type WithNovaEnvironment,
  getNovaDecorator,
  MockPayloadGenerator,
} from "@nova/react-test-utils/apollo";

const schema = getSchema();

const meta = {
  component: FeedbackContainer,
  decorators: [getNovaDecorator(schema)],
} satisfies Meta<typeof FeedbackContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => sampleFeedback,
      },
    },
  } satisfies WithNovaEnvironment<UnknownOperation, TypeMap>,
};
```

Let's break that example down:

`getNovaDecorator` is a function that returns a decorator for storybook stories. It takes a schema as an argument. The schema is a GraphQL schema that is later used to generate mock data for the GraphQL mock. Basically what the decorator does, is that it wraps the rendered story inside `NovaMockEnvironmentProvider`. The difference between this setup and one for unit tests is that we no longer rely on Jest mocks for eventing and commanding. Instead `eventing.bubble` and `commanding.trigger` are implemented using `action` from [Storybook actions addon](https://storybook.js.org/docs/react/essentials/actions), so that whenever a component fires an event/trigger a command the information about the actions is rendered within Storybook actions addon panel.

The decorator is customized by [parameters](https://storybook.js.org/docs/react/writing-stories/parameters#page-top). The name of the parameter is `novaEnvironment` and it is of type `WithNovaEnvironment`. It has the following properties:

- `resolvers` - an optional property that allows user to customize resolvers used for data generation. These resolvers are passed to MockPayloadGenerator, invoked inside the decorator as in:

```tsx
const mockResolvers = parameters?.resolvers;
environment.graphql.mock.queueOperationResolver((operation) =>
  MockPayloadGenerator.generate(operation, mockResolvers),
);
```

By default, the resolvers are queued, instead of being called manually, so that users can interact with running story, without loss of functionality and to not have to specify any after render action (only doable by `play` function) if the component is static.

- `enableQueuedMockResolvers` - the property (true by default) controls if default resolvers are queued. If set to false, user can no longer specify custom resolvers, but has all the capabilities of `apollo-mock-client/relay-test-utils` available manually inside play function. Check this example:

```tsx
export const LikeFailure: Story = {
  parameters: {
    novaEnvironment: {
      enableQueuedMockResolvers: false,
    },
  } satisfies WithNovaEnvironment<UnknownOperation, TypeMap>,
  play: async (context) => {
    const {
      graphql: { mock },
    } = getNovaEnvironmentForStory(context);

    await waitFor(async () => {
      const operation = mock.getMostRecentOperation();
      await expect(operation).toBeDefined();
    });
    await mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        Feedback: () => sampleFeedback,
      }),
    );
    const container = within(context.canvasElement);
    const likeButton = await container.findByRole("button", { name: "Like" });
    userEvent.click(likeButton);
    mock.rejectMostRecentOperation(new Error("Like failed"));
  },
};
```

This time resolvers are not queued up front so inside [play](https://storybook.js.org/docs/react/writing-stories/play-function#page-top) one needs to manually resolve/reject graphql operations. To get the environment created for this specific story one can use `getNovaEnvironmentForStory` function. Later similarly to examples for unit test, full customization power of `apollo-mock-client/relay-test-utils` is available.

In addition, if your component only defines a GraphQL fragment and does not perform a query, the following properties can be used:

- `query` - if your component contains only a fragment and does not perform a query itself, you should supply the query which will generate the data that the fragment specifies. If `query` is specified, the decorator will render a wrapping component which executes the query using `useLazyLoadQuery` and uses the `referenceEntries` property to send the data as a prop to the component.
- `referenceEntries` - if you specify `query`, this property is used to determine the prop name (or prop names) which the generated data from `useLazyLoadQuery` should be assigned to.
- `variables` - the variables supplied to the `query`.

Here's an example of a story for a component which only contains a fragment:

```tsx
const meta = {
  component: FeedbackComponent,
  decorators: [getNovaDecorator(getSchema())],
  parameters: {
    novaEnvironment: {
      query: graphql`
        query FeedbackStoryQuery($id: ID!) @relay_test_operation {
          feedback(id: $id) {
            ...Feedback_feedbackFragment
          }
        }
      `,
      variables: { id: "42" },
      referenceEntries: {
        feedback: (data) => data?.feedback,
      },
      resolvers: {
        Feedback: () => sampleFeedback,
      },
    },
  } satisfies WithNovaEnvironment<FeedbackStoryQuery, TypeMap>,
} satisfies Meta<typeof FeedbackComponent>;

type Story = StoryObjWithoutFragmentRefs<typeof meta>;

export const Primary: Story = {};
```

In this example, a wrapping component will execute the `query` with `useLazyLoadQuery` and passes the result to the `FeedbackComponent` via the `feedback` prop.

For Relay examples and more real life examples please check the [examples package](../examples/src/).

You can also see that `satisfies WithNovaEnvironment<Operation, TypeMap>` is used to strongly type parameters. The `Operation` is used to make the `referenceEntries` prop strongly typed. If no `query` is defined it can be set to the `UnknownOperation` type exported from the package. The operation types are generated by the GraphQL compiler (either [apollo-react-relay-duct-tape-compiler](https://github.com/microsoft/graphitation/tree/main/packages/apollo-react-relay-duct-tape-compiler) or [relay-compiler](https://github.com/facebook/relay/tree/main/packages/relay-compiler)). The `TypeMap` type gives you strongly typed mock resolvers and can be generated using [typemap-plugin](https://github.com/microsoft/graphitation/tree/main/packages/graphql-codegen-typescript-typemap-plugin) that can be added to graphql codegen config file.

Additionally, `StoryObjWithoutFragmentRefs` utility type is provided which is just a small wrapper over `StoryObj` type from Storybook that makes sure that `args` don't require you to pass props that are supplied using `referenceEntries` parameter.

### EventingInterceptor

This utility is meant to override default behavior for `bubble` which logs all nova events to Storybook actions tab. Instead you can granularly override the handler per event to customize your story. Check example below:

```tsx
const FeedbackWithDeleteDialog = (
  props: React.ComponentProps<typeof FeedbackComponent>,
) => {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  return (
    <EventingInterceptor<typeof events> // this should be an events object that has definitions for all your events for good TS auto-completion
      eventMap={{
        onDeleteFeedback: (eventWrapper) => {
          // custom handler for this specific event
          setOpen(true);
          setText(eventWrapper.event.data().feedbackText);
          return Promise.resolve(undefined); // return undefined if you want to stop processing event further
        },
        feedbackTelemetry: (eventWrapper) => {
          console.log("Telemetry event", eventWrapper.event.data());
          return Promise.resolve(eventWrapper); // return eventWrapper if you want to pass event further, for default bubble to log it in actions tab
        },
      }}
    >
      <FeedbackComponent {...props} />
      <dialog open={open}>
        <button onClick={() => setOpen(false)}>Cancel</button>
        Are you sure you want to delete feedback "{text}"
      </dialog>
    </EventingInterceptor>
  );
};

export const WithDeleteDialog: Story = {
  ...Primary,
  render: (args) => <FeedbackWithDeleteDialog {...args} />, // We override default render to use our component with custom event handler and some wrapping state
  play: async (context) => {
    const container = within(context.canvasElement);
    const deleteButton = await container.findByRole("button", {
      name: "Delete feedback",
    });
    await userEvent.click(deleteButton);
    // ... some more actions/assertions after dialog got opened
  },
};
```

It is helpful if your event changes something on integration side of your component and you want simulate that behavior in Storybook. Implementation wise `EventingInterceptor` uses [eventing interceptor](../nova-react/README.md#intercepting-events) under the hood, so that you can always use the default handler if needed.

## FAQ

#### I am not using Nova directly, but I am using Relay. Can I still use this package?

Yes, you can. The Storybook decorator is designed to work with any Relay component, not just those that use Nova. The only change is that your components use Relay hooks for data fetching and instead of import `graphql` from `@nova/react` you can use `graphql` from `react-relay`. Check [the pure Relay examples](../examples/src/relay/pure-relay/Feedback.tsx).

#### I need to configure cache of the Apollo mock client as I am using @graphitation/apollo-react-relay-duct-tape together with watch fragments that rely on bein able to fetch data from cache. Is it configurable?

Yes, if you are using through unit tests directly you can pass options to `createMockEnvironment`:

```tsx
const environment = createMockEnvironment(schema, {
  cache: myCustomCacheConfig,
});
```

and if you are using through storybook decorator you can pass options to `getNovaDecorator`:

```tsx
const meta = {
  component: FeedbackContainer,
  decorators: [
    getNovaDecorator(schema, {
      cache: myCustomCacheConfig,
    }),
  ],
} satisfies Meta<typeof FeedbackContainer>;
```

#### I need to configure Relay environment to support some custom setup I have in my repository. Is it possible?

Similarly as with configuring Apollo cache, one can pass options to `createMockEnvironment`:

```tsx
const environment = createMockEnvironment(schema, {
  store: myCustomStoreConfig,
});
```

and if you are using through storybook decorator you can pass options to `getNovaDecorator`. However, in case of storybook environment we need to make sure that for example `store` is unique for each story, so we need to pass a function that will return the options:

```tsx
const meta = {
  component: FeedbackContainer,
  decorators: [
    getNovaDecorator(schema, {
      getEnvironmentOptions: () => ({
        store: myCustomStoreConfig,
      }),
    }),
  ],
} satisfies Meta<typeof FeedbackContainer>;
```

The second parameter of `getNovaDecorator` is an `getEnvironmentOptions` callback that should return object of type `Partial<EnvironmentConfig>` from `relay-test-utils`. **Note**: internally we add a little bit funcionality to store instance, particularly for supporting data for Relay Resolvers. To avoid that functionality from being overridden, we encourage to use `storeOption` instead of `Store` which will be passed to `Store` object constructor.

#### Can I swap out the graphitation MockPayloadGenerator for something else?

Yes, in `getNovaDecorator` in `options` param you can supply a `generateFunction` which will be used to
generate data instead of the `MockPayloadGenerator`. Use this if you want to use the
`MockPayloadGenerator` supplied by `relay-test-utils`.

#### (Pure relay or Nova with Relay) How can I make sure the mock data is generated for client extensions?

The current default generator doesn't support client extensions. However, you can use the `generateFunction` option to provide your own generator. Here is an example of how you can use the `MockPayloadGenerator` from `relay-test-utils` to generate data for client extensions:

```tsx
import { MockPayloadGenerator } from "relay-test-utils";
import { getNovaDecorator } from "@nova/react-test-utils/relay";

const novaDecorator = getNovaDecorator(schema, {
  generateFunction: (operation, mockResolvers) => {
    const result = MockPayloadGenerator.generate(
      operation,
      mockResolvers ?? null,
      {
        mockClientData: true, // this makes sure data for client extensions is generated
      },
    );

    return result;
  },
});
```

#### (Pure relay or Nova with Relay) How can I make sure the mock data is generated with deferred payloads?

The current default generator doesn't return deferred payloads. However, similarly as in example above you can use the `generateFunction` option to provide your own generator which does.

```tsx
import { MockPayloadGenerator } from "relay-test-utils";
import { getNovaDecorator } from "@nova/react-test-utils/relay";

const novaDecorator = getNovaDecorator(schema, {
  generateFunction: (operation, mockResolvers) => {
    const result = MockPayloadGenerator.generateWithDefer(
      operation,
      mockResolvers ?? null,
      {
        mockClientData: true,
        generateDeferredPayload: true, // this makes sure mock data is array of deferred payloads, not a single response
      },
    );

    return result;
  },
});
```

#### (Pure relay or Nova with Relay) Can I provide mock data to relay resolvers?

For Relay environments, the `resolvers` parameter also provides mock data to Relay resolvers through resolver context. This means you can mock both GraphQL operations and Relay resolver data using the same configuration:

```tsx
export const MyStory: Story = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => ({
          id: "42",
          message: { text: "Feedback title" },
          displayLabel: "Custom Label from Story", // Used by Relay resolver
        }),
      },
    },
  },
};
```

In your Relay resolver, you can access this mock data through the context:

```tsx
/**
 * @RelayResolver Feedback.displayLabel: String
 */
export function displayLabel(
  _args: any,
  context: SomeContextType & EnvironmentMockResolversContext<TypeMap>,
) {
  // Gets "Custom Label from Story" from the story's resolvers
  const mockLabel = context.mock.resolve("Feedback")?.displayLabel;
  if (mockLabel !== undefined) {
    return mockLabel;
  }

  // Whatever other code you want to run for your resolver.
}
```

This allows you to provide custom mock data for your Relay resolvers on a per-story basis, making it easy to test different scenarios and data states.

#### How can I mock query/mutation/subscription?

- [Query example](../examples/src/relay/Feedback/FeedbackContainer.stories.ts#L30)
- [Mutation example](../examples/src/relay/Feedback/FeedbackContainer.stories.ts#L87) - that one also contains mocking of error case
- [Subscription example](https://github.com/microsoft/graphitation/tree/main/packages/apollo-mock-client#subscription)

#### What if my test triggers multiple operations? How can I mock them? If I have multiple operations which one does `resolveMostRecentOperation` refer to?

You have multiple options there. As `apollo-mock-client/relay-test-utils` are flexible you can go various ways to achieve desired result:

- You can rely on always resolving most recent operation. As mock libraries operate as a stack, most recent operation is always the one that was triggered most recently. If you fire query 2 after query 1, first call of `resolveMostRecentOperation` will refer to query 2. So for each operation you trigger you can call `resolveMostRecentOperation` to resolve it.
- You can also use `queueOperationResolver` to queue a resolver that will be applied for any upcoming operation. That way you can specify mocks for multiple queries at once.
- In case of more complex scenario, check the public API of [Apollo mock client](https://github.com/microsoft/graphitation/blob/651f972b990be69f8018f86a93f42f78296e1bfe/packages/apollo-mock-client/src/index.ts#L35) or [Relay test utils](https://github.com/facebook/relay/blob/4e39b05c8598fca11423136b964635646e805a68/packages/relay-test-utils/RelayModernMockEnvironment.js#L93) - they expose utilities like `findOperation`, `getAllOperations` and `resolveOperation`.
- Additionally this package also exposes `getOperationName, getOperationType` utilities that allow you to filter operations by name and type.

```tsx
graphql.mock.queueOperationResolver((operation) => {
  const operationName = getOperationName(operation);
  const operationType = getOperationType(operation);
  // we only use default automatic mocks for operations which are not subscriptions or some very specific query
  if (
    operationType !== "subscription" ||
    operationName !== "MySomethingQuery"
  ) {
    return MockPayloadGenerator.generate(operation);
  }
});
```

#### Can I reuse the setup I made for stories somehow in unit tests?

Sure, please check [unit tests file](../examples/src/relay/Feedback/FeedbackContainer.test.tsx) to see how stories can be leveraged inside unit tests, using [composeStories](https://storybook.js.org/docs/writing-tests/import-stories-in-tests/stories-in-unit-tests) to treat storybook as the single source of truth for all the config/setup needed to test your component.

Here is an example in jest:

```tsx
import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { act, render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import { prepareStoryContextForTest } from "@nova/react-test-utils/apollo";

const { LikeFailure } = composeStories(stories);

it("should show an error if the like button fails", async () => {
  const { container } = render(<LikeFailure />);
  await act(async () =>
    LikeFailure.play(prepareStoryContextForTest(LikeFailure, container)),
  );
  const error = await screen.findByText("Something went wrong");
  expect(error).toBeInTheDocument();
});
```

He is an examples in vitest:

```tsx
import { expect, it, describe } from "vitest";
import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import * as React from "react";
import { prepareStoryContextForTest } from "@nova/react-test-utils/apollo";
import { render } from "vitest-browser-react";
import { page } from "@vitest/browser/context";

const { Primary, Liked, LikeFailure } = composeStories(stories);

describe("FeedbackContainer", () => {
  it("should show an error if the like button fails", async () => {
    const { container } = render(<LikeFailure />);

    await LikeFailure.play?.(
      prepareStoryContextForTest(LikeFailure, container),
    );
    const error = page.getByText("Something went wrong");
    await expect.element(error).toBeInTheDocument();
  });
});
```

The `prepareStoryContextForTest` is needed to make sure the context passed to `play` function during unit tests execution contains the `novaEnvironment`.
