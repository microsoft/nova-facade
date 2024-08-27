# nova-react-test-utils

The Nova Facade is a set of interfaces that represent the core framework dependencies of a data-backed UI component in a large application. This allows high value components to be written in a host agnostic fashion and used within any host that implements the Nova contracts.

This package provides test utilities for components written with the React specific implementation. The purpose of these utilities is to expose capabilities of [MockPayloadGenerator](https://github.com/microsoft/graphitation/tree/main/packages/graphql-js-operation-payload-generator), [Apollo mock client](https://github.com/microsoft/graphitation/tree/main/packages/apollo-mock-client) and [relay-test-utils](https://github.com/facebook/relay/tree/main/packages/relay-test-utils) in Nova context.

The utilities provided by this package should be used to test [apollo-react-relay-duct-tape](https://github.com/microsoft/graphitation/tree/main/packages/apollo-react-relay-duct-tape) or [react-relay](https://github.com/facebook/relay/tree/main/packages/react-relay) based components.

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
either Apollo or Relay. The package exposes two decorators, `getNovaApolloDecorator` and `getNovaRelayDecorators`, which should be picked based on whether or not the component is based on Apollo or Relay.

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import type {
  UnknownOperation,
  WithNovaEnvironment,
} from "@nova/react-test-utils";
import {
  getNovaDecorator,
  MockPayloadGenerator,
} from "@nova/react-test-utils/apollo";

const schema = getSchema();

const meta: Meta<typeof FeedbackContainer> = {
  component: FeedbackContainer,
  decorators: [getNovaDecorator(schema)],
};

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

- `enableQueuedMockResolvers` - the property (true by default) controls if default resolvers are queued. If set to false, user can no longer specify custom resolvers, but has all the capabilities of apollo-mock-client available manually inside play function. Check this example:

```tsx
export const LikeFailure: Story = {
  parameters: {
    novaEnvironment: {
      enableQueuedMockResolvers: false,
    },
  } satisfies NovaEnvironmentDecoratorParameters<TypeMap>,
  play: async (context) => {
    const {
      graphql: { mock },
    } = getNovaEnvironmentForStory(context);

    // wait for next tick for apollo client to update state
    await new Promise((resolve) => setTimeout(resolve, 0));
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

This time resolvers are not queued up front so inside [play](https://storybook.js.org/docs/react/writing-stories/play-function#page-top) one needs to manually resolve/reject graphql operations. To get the environment created for this specific story one can use `getNovaEnvironmentForStory` function. Later similarly to examples for unit test, full customization power of apollo-mock-client is available.

In addition, if your component only defines a GraphQL fragment and does not perform a query, the following properties can be used:

- `query` - if your component contains only a fragment and does not perform a query itself, you should supply the query which will generate the data that the fragment specifies. If `query` is specified, the decorator will render a wrapping component which executes the query using `useLazyLoadQuery` and uses the `getReferenceEntry` / `getReferenceEntries` property to send the data as a prop to the component.
- `getReferenceEntry` / `getReferenceEntries` - if you specify `query`, this property is used to determine the prop name which the generated data from `useLazyLoadQuery` should be assigned to.
- `variables` - the variables supplied to the `query`.

Here's an example of a story for a component which only contains a fragment:

```tsx
const meta: Meta<typeof FeedbackComponent> = {
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
        ${Feedback_feedbackFragment}
      `,
      variables: { id: "42" },
      getReferenceEntry: (data) => ["feedback", data?.feedback],
    },
  } satisfies WithNovaEnvironment<FeedbackStoryQuery, TypeMap>,
};
```

In this example, a wrapping component will execute the `query` with `useLazyLoadQuery` and passes the result to the `FeedbackComponent` via the `feedback` prop.

For Relay examples and more real life examples please check the [examples package](../examples/src/).

You can also see that `satisfies NovaEnvironmentDecoratorParameters<Operation, TypeMap>` is used to strongly type parameters. The `Operation` is used to make the `getReferenceEntry` / `getReferenceEntries` prop strongly typed. If no `query` is defined it can be set to the `UnknownOperation` type exported from the package. The operation types are generated by the GraphQL compiler (either [apollo-react-relay-duct-tape-compiler](https://github.com/microsoft/graphitation/tree/main/packages/apollo-react-relay-duct-tape-compiler) or [relay-compiler](https://github.com/facebook/relay/tree/main/packages/relay-compiler)). The `TypeMap` type gives you strongly typed mock resolvers and can be generated using [typemap-plugin](https://github.com/microsoft/graphitation/tree/main/packages/graphql-codegen-typescript-typemap-plugin) that can be added to graphql codegen config file.

## FAQ

#### I need to configure cache of the Apollo mock client as I am using @graphitation/apollo-react-relay-duct-tape together with watch fragments that rely on bein able to fetch data from cache. Is it configurable?

Yes, if you are using through unit tests directly you can pass options to `createMockEnvironment`:

```tsx
const environment = createMockEnvironment(schema, {
  cache: myCustomCacheConfig,
});
```

and if you are using through storybook decorator you can pass options to `getNovaEnvironmentDecorator`:

```tsx
const meta: Meta<typeof FeedbackContainer> = {
  component: FeedbackContainer,
  decorators: [
    getNovaDecorator(schema, {
      cache: myCustomCacheConfig,
    }),
  ],
};
```

#### How can I mock query/mutation/subscription?

- [Query example](https://github.com/microsoft/graphitation/tree/main/packages/apollo-mock-client#query)
- [Mutation example](https://github.com/microsoft/graphitation/tree/main/packages/apollo-mock-client#query) - that one also contains mocking of error case
- [Subscription example](https://github.com/microsoft/graphitation/tree/main/packages/apollo-mock-client#subscription)

#### What if my test triggers multiple operations? How can I mock them? If I have multiple operations which one does `resolveMostRecentOperation` refer to?

You have multiple options there. As [Apollo mock client](https://github.com/microsoft/graphitation/blob/main/packages/apollo-mock-client) is flexible you can go various ways to achieve desired result:

- You can rely on always resolving most recent operation. As Apollo Mock Client operates as a stack, most recent operation is always the one that was triggered most recently. If you fire query 2 after query 1, first call of `resolveMostRecentOperation` will refer to query 2. So for each operation you trigger you can call `resolveMostRecentOperation` to resolve it.
- You can also use `queueOperationResolver` to queue a resolver that will be applied for any upcoming operation. That way you can specify mocks for multiple queries at once.
- In case of more complex scenario, check the public API of [Apollo mock client](https://github.com/microsoft/graphitation/blob/651f972b990be69f8018f86a93f42f78296e1bfe/packages/apollo-mock-client/src/index.ts#L35) - it exposes utilities like `findOperation`, `getAllOperations` and `resolveOperation`.
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

Sure, please check [unit tests file](../examples/src/Feedback/FeedbackContainer.test.tsx) to see how stories can be leveraged inside unit tests, using [composeStories](https://github.com/storybookjs/testing-react) to treat storybook as the single source of truth for all the config/setup needed to test your component.

Here is also an example:

```tsx
import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { act, render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import { prepareStoryContextForTest } from "@nova/react-test-utils";

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

The `prepareStoryContextForTest` is needed to make sure the context passed to `play` function during unit tests execution contains the `novaEnvironment`.

#### Can I swap out the graphitation MockPayloadGenerator for something else?

Yes, in `getNovaDecorator` you can supply a `generateFunction` which will be used to
generate data instead of the `MockPayloadGenerator`. Use this if you want to use the
`MockPayloadGenerator` supplied by `relay-test-utils`.
