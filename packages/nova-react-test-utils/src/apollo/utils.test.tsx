import React from "react";
import { buildASTSchema, parse } from "graphql";
import type { ReactTestRenderer } from "react-test-renderer";
import { act, create as createTestRenderer } from "react-test-renderer";
import type { EntityCommand, EventWrapper } from "@nova/types";

import { graphql, useLazyLoadQuery } from "@nova/react";

import { createNovaApolloEnvironment, ApolloMockPayloadGenerator } from "./test-utils";
import type { NovaMockEnvironment } from "../shared/nova-mock-environment";
import { NovaMockEnvironmentProvider } from "../shared/nova-mock-environment";
import { getApolloOperationName, getApolloOperationType } from "./operation-utils";

const schema = buildASTSchema(
  parse(`
    type Query {
      user(id: ID!): User!
    }

    type Subscription {
      userNameChanged(id: ID!): User!
    }

    type User {
      id: ID!
      name: String!
      avatar: Avatar!
    }

    type Avatar {
      url: String!
    }
  `),
);

const QuerySubject: React.FC = () => {
  const { data } = useLazyLoadQuery<any>(
    graphql`
      query MockTestQuery {
        user(id: 42) {
          name
        }
      }
    `,
    {},
  );
  return data ? <span>{data.user.name}</span> : null;
};

describe(createNovaApolloEnvironment, () => {
  let environment: NovaMockEnvironment;

  beforeEach(() => {
    environment = createNovaApolloEnvironment(schema);
  });

  it("wraps the user specified children in an Apollo provider", () => {
    let tree: ReactTestRenderer;
    act(() => {
      tree = createTestRenderer(
        <NovaMockEnvironmentProvider environment={environment}>
          <div>42</div>
        </NovaMockEnvironmentProvider>,
      );
    });
    const expectedProvider = tree!.root.findByType("div").parent
      ?.type as React.FC;
    expect(expectedProvider.name).toEqual("ApolloProvider");
  });

  describe("exposed mock APIs", () => {
    it("exposes mocks for commanding", () => {
      const cmd = {} as EntityCommand;
      environment.commanding.trigger(cmd);
      expect(environment.commanding.trigger.mock.calls).toEqual([[cmd]]);
    });

    it("exposes mocks for eventing", () => {
      const event = {} as EventWrapper;
      environment.eventing.bubble(event);
      expect(environment.eventing.bubble.mock.calls).toEqual([[event]]);
    });

    it("exposes mocks for GraphQL operations", async () => {
      expect.assertions(2);

      let tree: ReactTestRenderer;
      act(() => {
        tree = createTestRenderer(
          <NovaMockEnvironmentProvider environment={environment}>
            <QuerySubject />
          </NovaMockEnvironmentProvider>,
        );
      });

      expect(environment.graphql.mock.getAllOperations().length).toEqual(1);

      await act(async () =>
        environment.graphql.mock.resolveMostRecentOperation((operation) =>
          ApolloMockPayloadGenerator.generate(operation),
        ),
      );

      expect(tree!.root.findByType("span").children).toEqual([
        `<mock-value-for-field-"name">`,
      ]);
    });
  });

  describe("utilities", () => {
    it("provides a way to get the name of a GraphQL operation", () => {
      act(() => {
        createTestRenderer(
          <NovaMockEnvironmentProvider environment={environment}>
            <QuerySubject />
          </NovaMockEnvironmentProvider>,
        );
      });

      expect(
        getApolloOperationName(environment.graphql.mock.getMostRecentOperation()),
      ).toEqual("MockTestQuery");
    });

    it("provides a way to get the GraphQL operation type", () => {
      act(() => {
        createTestRenderer(
          <NovaMockEnvironmentProvider environment={environment}>
            <QuerySubject />
          </NovaMockEnvironmentProvider>,
        );
      });

      expect(
        getApolloOperationType(environment.graphql.mock.getMostRecentOperation()),
      ).toEqual("query");
    });
  });
});
