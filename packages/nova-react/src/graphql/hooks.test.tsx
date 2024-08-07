/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, renderHook } from "@testing-library/react";

import { NovaGraphQLProvider } from "./nova-graphql-provider";
import type { NovaGraphQL } from "@nova/types";

import {
  useFragment,
  useLazyLoadQuery,
  usePaginationFragment,
  useRefetchableFragment,
  useSubscription,
} from "./hooks";
import type { GraphQLTaggedNode } from "./taggedNode";
import type { FragmentRefs } from "./types";

type IsNotNull<T> = null extends T ? false : true;
type IsNotUndefined<T> = undefined extends T ? false : true;

describe(useLazyLoadQuery, () => {
  it("ensures an implementation is supplied", () => {
    const graphql: NovaGraphQL = {};

    const spy = jest.spyOn(console, "error");
    spy.mockImplementation(() => {
      /* noop */
    });

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
      const { data } = useLazyLoadQuery<{
        response: string;
        variables: Record<string, unknown>;
        context?: Record<string, unknown>;
      }>(query, {}, { context: { callerInfo: "subject-with-query" } });
      return <span>{data}</span>;
    };

    render(
      <NovaGraphQLProvider graphql={graphql}>
        <Subject />
      </NovaGraphQLProvider>,
    );

    expect(graphql.useLazyLoadQuery).toHaveBeenCalledWith(
      query,
      {},
      { context: { callerInfo: "subject-with-query" } },
    );
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

  it("supports the $fragmentSpreads format that is generated from Relay 13", () => {
    type SomeFragment$data = { someKey: string };
    type SomeFragment$key = {
      readonly " $data"?: SomeFragment$data;
      readonly " $fragmentSpreads": FragmentRefs<"SomeFragment">;
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const opaqueFragmentRef = {} as unknown as SomeFragment$key;

    // This test just checks that there are no TS errors. Alas the test suite currently won't fail if that were the
    // case, but at least there's a test that covers the intent.
    const _: () => SomeFragment$data = () =>
      useFragment(fragment, opaqueFragmentRef);
    void _;
  });

  it("allows null or undefined to be passed as the fragment ref", () => {
    const fragment = {} as unknown as GraphQLTaggedNode;

    const { result, rerender } = renderHook<
      null | undefined,
      { fragmentRef: null | undefined }
    >(({ fragmentRef }) => useFragment(fragment, fragmentRef), {
      wrapper: ({ children }) => (
        <NovaGraphQLProvider graphql={{}}>{children}</NovaGraphQLProvider>
      ),
      initialProps: {
        fragmentRef: null,
      },
    });

    expect(result.current).toBeNull();

    rerender({ fragmentRef: undefined });

    expect(result.current).toBeUndefined();
  });

  it("returns a value that can be `null`, `undefined` or data", () => {
    type SomeFragment$data = { someKey: string };
    type SomeFragment$key = {
      readonly " $data"?: SomeFragment$data;
      readonly " $fragmentRefs": FragmentRefs<"SomeFragment">;
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const opaqueFragmentRef = {} as unknown as SomeFragment$key | null;

    const { result } = renderHook(
      () => useFragment(fragment, opaqueFragmentRef),
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider graphql={{}}>{children}</NovaGraphQLProvider>
        ),
      },
    );

    type ExpectedReturnType = typeof result.current;

    const _: ExpectedReturnType = null;
    const __: ExpectedReturnType = undefined;
    const ___: ExpectedReturnType = { someKey: "some-data" };

    // Workaround for TS complaining about unused variables
    void _, __, ___;
  });

  it("returns a value that can not be `null` or `undefined` when the fragment ref is not `null` or `undefined`", () => {
    type SomeFragment$data = { someKey: string };
    type SomeFragment$key = {
      readonly " $data"?: SomeFragment$data;
      readonly " $fragmentRefs": FragmentRefs<"SomeFragment">;
    };

    const fragment = {} as unknown as GraphQLTaggedNode;
    const opaqueFragmentRef = {} as unknown as SomeFragment$key;

    const { result } = renderHook(
      () => useFragment(fragment, opaqueFragmentRef),
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider graphql={{}}>{children}</NovaGraphQLProvider>
        ),
        initialProps: {
          fragmentRef: opaqueFragmentRef,
        },
      },
    );

    type ExpectedReturnType = typeof result.current;

    const _: IsNotNull<ExpectedReturnType> = true;
    const __: IsNotUndefined<ExpectedReturnType> = true;
    const ___: ExpectedReturnType = { someKey: "some-data" };

    // Workaround for TS complaining about unused variables
    void _, __, ___;
  });
});

describe(useRefetchableFragment, () => {
  beforeEach(() => {
    jest.restoreAllMocks();

    jest.spyOn(console, "error").mockImplementation(() => {
      /* noop */
    });
  });

  it("uses the host's hook, if provided", () => {
    const graphql: NovaGraphQL = {
      useRefetchableFragment: jest.fn(() => [
        { someKey: "some-data" },
        ({}) => ({ dispose: jest.fn() }),
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

  it("supports passing null as reference to the fragment", () => {
    const { result } = renderHook(
      () => {
        const fragment = {} as unknown as GraphQLTaggedNode;

        return useRefetchableFragment(fragment, null);
      },
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider
            graphql={{
              useRefetchableFragment: (_, ref) => [ref, jest.fn()],
            }}
          >
            {children}
          </NovaGraphQLProvider>
        ),
      },
    );

    const [data] = result.current;

    const _: null | undefined = data;
    void _;

    expect(result.current[0]).toBeNull();
  });

  it("supports passing null as reference to the fragment", () => {
    const { result } = renderHook(
      () => {
        const fragment = {} as unknown as GraphQLTaggedNode;
        const fragmentRef = null;

        return useRefetchableFragment(fragment, fragmentRef);
      },
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider
            graphql={{
              useRefetchableFragment: (_, ref) => [ref, jest.fn()],
            }}
          >
            {children}
          </NovaGraphQLProvider>
        ),
      },
    );

    expect(result.current[0]).toBeNull();
  });

  it("return type does not include null or undefined when the ref is not null", () => {
    const { result } = renderHook(
      () => {
        type SomeFragment$data = { someKey: string };
        type SomeFragment$key = {
          readonly " $data"?: SomeFragment$data;
          readonly " $fragmentRefs": FragmentRefs<"SomeFragment">;
        };

        const fragment = {} as unknown as GraphQLTaggedNode;
        const opaqueFragmentRef = {} as unknown as SomeFragment$key;

        return useRefetchableFragment(fragment, opaqueFragmentRef);
      },
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider
            graphql={{
              useRefetchableFragment: (_, ref) => [ref, jest.fn()],
            }}
          >
            {children}
          </NovaGraphQLProvider>
        ),
      },
    );

    type ExpectedReturnType = (typeof result.current)[0];

    const _: IsNotNull<ExpectedReturnType> = true;
    const __: IsNotUndefined<ExpectedReturnType> = true;
    const ___: ExpectedReturnType = { someKey: "some-data " };

    // Workaround for TS complaining about unused variables
    void _, __, ___;
  });

  it("supports null and undefined as result types when the key can be null or undefined", () => {
    const { result } = renderHook(
      () => {
        type SomeFragment$data = { someKey: string };
        type SomeFragment$key = {
          readonly " $data"?: SomeFragment$data;
          readonly " $fragmentRefs": FragmentRefs<"SomeFragment">;
        };

        const fragment = {} as unknown as GraphQLTaggedNode;
        const opaqueFragmentRef = {} as unknown as
          | SomeFragment$key
          | null
          | undefined;

        return useRefetchableFragment(fragment, opaqueFragmentRef);
      },
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider
            graphql={{
              useRefetchableFragment: (_, ref) => [ref, jest.fn()],
            }}
          >
            {children}
          </NovaGraphQLProvider>
        ),
      },
    );

    type ExpectedReturnType = (typeof result.current)[0];

    const _: IsNotNull<ExpectedReturnType> = false;
    const __: IsNotUndefined<ExpectedReturnType> = false;
    const ___: ExpectedReturnType = { someKey: "some-data " };

    // Workaround for TS complaining about unused variables
    void _, __, ___;
  });
});

describe(usePaginationFragment, () => {
  beforeEach(() => {
    jest.restoreAllMocks();

    jest.spyOn(console, "error").mockImplementation(() => {
      /* noop */
    });
  });

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
      const { data } = usePaginationFragment(fragment, fragmentRef);
      return <span>{data.someKey}</span>;
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
      const { data } = usePaginationFragment(fragment, fragmentRef);
      return <span>{data.someKey}</span>;
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

  it("does not include null or undefined in the return type when the key is defined.", () => {
    const graphql: NovaGraphQL = {
      usePaginationFragment: jest.fn().mockImplementation(() => ({
        data: {},
      })),
    };

    type SomeFragment$data = { someKey: string };

    const { result } = renderHook(
      () => {
        type SomeFragment$key = {
          readonly " $data"?: SomeFragment$data;
          readonly " $fragmentRefs": FragmentRefs<"SomeFragment">;
        };

        const fragment = {} as unknown as GraphQLTaggedNode;
        const opaqueFragmentRef = {} as unknown as SomeFragment$key;

        return usePaginationFragment(fragment, opaqueFragmentRef);
      },
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider graphql={graphql}>
            {children}
          </NovaGraphQLProvider>
        ),
      },
    );

    const _: SomeFragment$data = result.current.data;
    void _;
  });

  it("allows fragment ref, null, or undefined to be passed as a fragment ref and returns data, null, or undefined", () => {
    const graphql: NovaGraphQL = {
      usePaginationFragment: jest.fn().mockImplementation(() => ({
        data: {},
      })),
    };

    type SomeFragment$data = { someKey: string };

    const { result } = renderHook(
      () => {
        type SomeFragment$key = {
          readonly " $data"?: SomeFragment$data;
          readonly " $fragmentRefs": FragmentRefs<"SomeFragment">;
        };

        const fragment = {} as unknown as GraphQLTaggedNode;
        const opaqueFragmentRef = {} as unknown as
          | SomeFragment$key
          | null
          | undefined;

        return usePaginationFragment(fragment, opaqueFragmentRef);
      },
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider graphql={graphql}>
            {children}
          </NovaGraphQLProvider>
        ),
      },
    );

    const _: SomeFragment$data | null | undefined = result.current.data;
    void _;
  });

  it("allows null or undefined to be passed as a fragment ref and returns null or undefined", () => {
    const graphql: NovaGraphQL = {
      usePaginationFragment: jest.fn().mockImplementation(() => ({
        data: {},
      })),
    };

    const { result } = renderHook(
      () => {
        const fragment = {} as unknown as GraphQLTaggedNode;
        const fragmentRef = null;

        return usePaginationFragment(fragment, fragmentRef);
      },
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider graphql={graphql}>
            {children}
          </NovaGraphQLProvider>
        ),
      },
    );

    const _: null | undefined = result.current.data;
    void _;
  });
});

describe(useSubscription, () => {
  it("ensures an implementation is supplied", () => {
    const graphql: NovaGraphQL = {};

    const spy = jest.spyOn(console, "error");
    spy.mockImplementation(() => {
      /* noop */
    });

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
      context: { callerInfo: "subject-with-subscription" },
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
