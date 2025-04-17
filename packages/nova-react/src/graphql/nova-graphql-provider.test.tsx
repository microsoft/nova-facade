import * as React from "react";
import type { NovaGraphQL } from "@nova/types";
import { render } from "vitest-browser-react";
import { describe, it, expect, vi } from "vitest";
import { NovaGraphQLProvider, useNovaGraphQL } from "./nova-graphql-provider";

describe(useNovaGraphQL, () => {
  it("throws without a provider", () => {
    expect.assertions(1);

    const TestUndefinedContextComponent: React.FC = () => {
      useNovaGraphQL();
      return null;
    };

    expect(() => render(<TestUndefinedContextComponent />)).toThrow(
      "Nova GraphQL provider must be initialized prior to consumption!",
    );
  });

  it("is able to access the GraphQL instance provided by the provider", () => {
    expect.assertions(1);
    
    const graphql = {
      useLazyLoadQuery: vi.fn(),
    } as unknown as NovaGraphQL;

    const TestPassedContextComponent: React.FC = () => {
      const graphqlFromContext = useNovaGraphQL();
      if (!graphqlFromContext.useLazyLoadQuery) {
        return null;
      }
      graphqlFromContext.useLazyLoadQuery("foo", {});
      return null;
    };
    render(
      <NovaGraphQLProvider graphql={graphql}>
        <TestPassedContextComponent />
      </NovaGraphQLProvider>,
    );

    // twice due to strict mode
    expect(graphql.useLazyLoadQuery).toBeCalledTimes(2);
  });
});
