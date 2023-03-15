/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";

import { NovaGraphQLProvider } from "./nova-graphql-provider";
import { NovaGraphQL } from "@nova/types";

import {
  useFragment,
  useLazyLoadQuery,
  usePaginationFragment,
  useRefetchableFragment,
  useSubscription,
} from "./hooks";
import { GraphQLTaggedNode } from "./taggedNode";
import { FragmentRefs } from "./types";

describe(useLazyLoadQuery, () => {
  it("ensures an implementation is supplied", () => {
    const graphql: NovaGraphQL = {};

    const spy = jest.spyOn(console, "error");
    spy.mockImplementation(() => {});

    const Subject: React.FC = () => {
      useLazyLoadQuery({} as any, {});
      return null;
    };

    expect(() =>
      render(
        <NovaGraphQLProvider graphql={graphql}>
          <Subject />
        </NovaGraphQLProvider>,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Expected host to provide a useLazyLoadQuery hook"`,
    );
  });

  it("uses the host's hook", () => {
    const query = {} as unknown as GraphQLTaggedNode;
    const graphql: NovaGraphQL = {
      useLazyLoadQuery: jest.fn(() => ({ data: "some-data" })),
    };

    const Subject: React.FC = () => {
      const { data } = useLazyLoadQuery<{ response: string; variables: {} }>(
        query,
        {},
      );
      return <span>{data}</span>;
    };

    render(
      <NovaGraphQLProvider graphql={graphql}>
        <Subject />
      </NovaGraphQLProvider>,
    );

    expect(graphql.useLazyLoadQuery).toHaveBeenCalledWith(query, {}, undefined);
    expect(screen.getByText("some-data")).toBeDefined();
  });
});

describe(useFragment, () => {
  it("uses the host's hook, if provided", () => {
    const graphql: NovaGraphQL = {
      useFragment: jest.fn(() => ({ someKey: "some-data" })),
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const fragmentRef = {} as any;

    const Subject: React.FC = () => {
      const data = useFragment(fragment, fragmentRef);
      return <span>{data.someKey}</span>;
    };

    render(
      <NovaGraphQLProvider graphql={graphql}>
        <Subject />
      </NovaGraphQLProvider>,
    );

    expect(graphql.useFragment).toHaveBeenCalledWith(fragment, fragmentRef);
    expect(screen.getByText("some-data")).toBeDefined();
  });

  it("simply passes through the data it receives, if the host does not provide an implementation", () => {
    const graphql: NovaGraphQL = {
      useFragment: undefined,
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const fragmentRef = { someKey: "some-data" } as any;

    const Subject: React.FC = () => {
      const data = useFragment(fragment, fragmentRef);
      return <span>{data.someKey}</span>;
    };

    render(
      <NovaGraphQLProvider graphql={graphql}>
        <Subject />
      </NovaGraphQLProvider>,
    );

    expect(screen.getByText("some-data")).toBeDefined();
  });

  it("unmasks the opaque data's typing that gets emitted by the compiler", () => {
    type SomeFragment$data = { someKey: string };
    type SomeFragment$key = {
      readonly " $data"?: SomeFragment$data;
      readonly " $fragmentRefs": FragmentRefs<"SomeFragment">;
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const opaqueFragmentRef = {} as unknown as SomeFragment$key;

    // This test just checks that there are no TS errors. Alas the test suite currently won't fail if that were the
    // case, but at least there's a test that covers the intent.
    const _: () => SomeFragment$data = () =>
      useFragment(fragment, opaqueFragmentRef);
    void _;
  });
});

describe(useRefetchableFragment, () => {
  it("uses the host's hook, if provided", () => {
    const graphql: NovaGraphQL = {
      useRefetchableFragment: jest.fn(() => [
        { someKey: "some-data" },
        ({}) => ({ dispose: () => {} }),
      ]),
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const fragmentRef = {} as any;

    const Subject: React.FC = () => {
      const [data, _] = useRefetchableFragment(fragment, fragmentRef);
      return <span>{data.someKey}</span>;
    };

    render(
      <NovaGraphQLProvider graphql={graphql}>
        <Subject />
      </NovaGraphQLProvider>,
    );

    expect(graphql.useRefetchableFragment).toHaveBeenCalledWith(
      fragment,
      fragmentRef,
    );
    expect(screen.getByText("some-data")).toBeDefined();
  });

  it("ensures an implementation is supplied", () => {
    const graphql: NovaGraphQL = {
      useRefetchableFragment: undefined,
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const fragmentRef = { someKey: "some-data" } as any;

    const Subject: React.FC = () => {
      const [data, _] = useRefetchableFragment(fragment, fragmentRef);
      return <span>{data.someKey}</span>;
    };

    expect(() =>
      render(
        <NovaGraphQLProvider graphql={graphql}>
          <Subject />
        </NovaGraphQLProvider>,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Expected host to provide a useRefetchableFragment hook"`,
    );
  });
});

describe(usePaginationFragment, () => {
  it("uses the host's hook, if provided", () => {
    const mockedResponse = {
      data: {
        someKey: "some-data",
      },
      loadNext: jest.fn(),
      loadPrevious: jest.fn(),
      hasNext: false,
      hasPrevious: false,
      isLoadingNext: false,
      isLoadingPrevious: false,
      refetch: jest.fn(),
    };

    const graphql: NovaGraphQL = {
      usePaginationFragment: jest.fn(() => mockedResponse),
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const fragmentRef = {} as any;

    const Subject: React.FC = () => {
      const fragmentResponse = usePaginationFragment(fragment, fragmentRef);
      return <span>{fragmentResponse.data.someKey}</span>;
    };

    render(
      <NovaGraphQLProvider graphql={graphql}>
        <Subject />
      </NovaGraphQLProvider>,
    );

    expect(graphql.usePaginationFragment).toHaveBeenCalledWith(
      fragment,
      fragmentRef,
    );
    expect(screen.getByText("some-data")).toBeDefined();
  });

  it("ensures an implementation is supplied", () => {
    const graphql: NovaGraphQL = {
      usePaginationFragment: undefined,
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const fragmentRef = { someKey: "some-data" } as any;

    const Subject: React.FC = () => {
      const fragmentResponse = usePaginationFragment(fragment, fragmentRef);
      return <span>{fragmentResponse.data.someKey}</span>;
    };

    expect(() =>
      render(
        <NovaGraphQLProvider graphql={graphql}>
          <Subject />
        </NovaGraphQLProvider>,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Expected host to provide a usePaginationFragment hook"`,
    );
  });
});

describe(useSubscription, () => {
  it("ensures an implementation is supplied", () => {
    const graphql: NovaGraphQL = {};

    const spy = jest.spyOn(console, "error");
    spy.mockImplementation(() => {});

    const Subject: React.FC = () => {
      useSubscription({} as any);
      return null;
    };

    expect(() =>
      render(
        <NovaGraphQLProvider graphql={graphql}>
          <Subject />
        </NovaGraphQLProvider>,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Expected host to provide a useSubscription hook"`,
    );
  });

  it("uses the host's hook", () => {
    const subscription: GraphQLTaggedNode = { __brand: "GraphQLTaggedNode" };
    const graphql: NovaGraphQL = {
      useSubscription: jest.fn(),
    };

    const onNext = jest.fn();
    const onError = jest.fn();

    const expectedArgument = {
      subscription,
      variables: { someVar: "some-value" },
      onNext,
      onError,
    };

    const Subject: React.FC = () => {
      useSubscription(expectedArgument);
      return null;
    };

    render(
      <NovaGraphQLProvider graphql={graphql}>
        <Subject />
      </NovaGraphQLProvider>,
    );

    expect(graphql.useSubscription).toHaveBeenCalledWith(expectedArgument);
  });
});
