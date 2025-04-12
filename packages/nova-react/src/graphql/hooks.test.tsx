import * as React from "react";
import { render, renderHook } from "vitest-browser-react";
import { describe, it, expect, beforeEach, vi } from "vitest";

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
import { page } from "@vitest/browser/context";

type IsNotNull<T> = null extends T ? false : true;
type IsNotUndefined<T> = undefined extends T ? false : true;

describe(useLazyLoadQuery, () => {
  it("ensures an implementation is supplied", () => {
    const graphql: NovaGraphQL = {};

    const spy = vi.spyOn(console, "error");
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
      `[Invariant Violation: Expected host to provide a useLazyLoadQuery hook]`,
    );
    spy.mockRestore();
  });

  it("uses the host's hook", async () => {
    const query = {} as unknown as GraphQLTaggedNode;
    const mockHook = vi.fn(() => ({ data: "some-data" }));
    const graphql: NovaGraphQL = {
      useLazyLoadQuery: mockHook,
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

    expect(mockHook).toHaveBeenCalledWith(
      query,
      {},
      { context: { callerInfo: "subject-with-query" } },
    );
    await expect.element(page.getByText("some-data")).toBeVisible();
  });
});

describe(useFragment, () => {
  it("uses the host's hook, if provided", async () => {
    const mockHook = vi.fn(() => ({ someKey: "some-data" }));
    const graphql: NovaGraphQL = {
      useFragment: mockHook,
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

    expect(mockHook).toHaveBeenCalledWith(fragment, fragmentRef);
    await expect.element(page.getByText("some-data")).toBeVisible();
  });

  it("simply passes through the data it receives, if the host does not provide an implementation", async () => {
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

    await expect.element(page.getByText("some-data")).toBeVisible();
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
      { fragmentRef: null | undefined },
      null | undefined
    >((props) => useFragment(fragment, props?.fragmentRef), {
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

    void _, __, ___;
  });
});

describe(useRefetchableFragment, () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => {
      /* noop */
    });
  });

  it("uses the host's hook, if provided", async () => {
    const refetchFn = vi.fn(() => ({ dispose: vi.fn() }));
    const mockHook = vi.fn(() => [{ someKey: "some-data" }, refetchFn]);
    const graphql: NovaGraphQL = {
      useRefetchableFragment:
        mockHook as unknown as typeof useRefetchableFragment,
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
    await expect.element(page.getByText("some-data")).toBeVisible();
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
      `[Invariant Violation: Expected host to provide a useRefetchableFragment hook]`,
    );
  });

  it("supports passing null as reference to the fragment", () => {
    const mockRefetch = vi.fn();
    const { result } = renderHook(
      () => {
        const fragment = {} as unknown as GraphQLTaggedNode;
        return useRefetchableFragment(fragment, null);
      },
      {
        wrapper: ({ children }) => (
          <NovaGraphQLProvider
            graphql={{
              useRefetchableFragment: (_, ref) => [ref, mockRefetch],
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

  it("return type does not include null or undefined when the ref is not null", () => {
    const mockRefetch = vi.fn();
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
              useRefetchableFragment: (_, ref) => [ref, mockRefetch],
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
    void _, __, ___;
  });

  it("supports null and undefined as result types when the key can be null or undefined", () => {
    const mockRefetch = vi.fn();
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
              useRefetchableFragment: (_, ref) => [ref, mockRefetch],
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
    void _, __, ___;
  });
});

describe(usePaginationFragment, () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => {
      /* noop */
    });
  });

  it("uses the host's hook, if provided", async () => {
    const mockedResponse = {
      data: {
        someKey: "some-data",
      },
      loadNext: vi.fn(),
      loadPrevious: vi.fn(),
      hasNext: false,
      hasPrevious: false,
      isLoadingNext: false,
      isLoadingPrevious: false,
      refetch: vi.fn(),
    };
    const mockHook = vi.fn(() => mockedResponse);
    const graphql: NovaGraphQL = {
      usePaginationFragment: mockHook,
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
    await expect.element(page.getByText("some-data")).toBeVisible();
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
      `[Invariant Violation: Expected host to provide a usePaginationFragment hook]`,
    );
  });

  it("does not include null or undefined in the return type when the key is defined.", () => {
    const graphql: NovaGraphQL = {
      usePaginationFragment: vi.fn().mockImplementation(() => ({
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
      usePaginationFragment: vi.fn().mockImplementation(() => ({
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
      usePaginationFragment: vi.fn().mockImplementation(() => ({
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

    const spy = vi.spyOn(console, "error");
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
      `[Invariant Violation: Expected host to provide a useSubscription hook]`,
    );
    spy.mockRestore();
  });

  it("uses the host's hook", () => {
    const subscription: GraphQLTaggedNode = { __brand: "GraphQLTaggedNode" };
    const mockHook = vi.fn();
    const graphql: NovaGraphQL = {
      useSubscription: mockHook,
    };

    const onNext = vi.fn();
    const onError = vi.fn();

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
