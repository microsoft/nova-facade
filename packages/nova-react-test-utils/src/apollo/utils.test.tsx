import * as React from "react";
import { buildASTSchema, parse } from "graphql";
import { render } from "vitest-browser-react";
import type { EntityCommand, EventWrapper } from "@nova/types";
import { graphql, useLazyLoadQuery } from "@nova/react";
import {
  createNovaApolloEnvironment,
  ApolloMockPayloadGenerator,
} from "./test-utils";
import {
  getApolloOperationName,
  getApolloOperationType,
} from "./operation-utils";
import { NovaMockEnvironmentProvider } from "../shared/nova-mock-environment";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NovaMockEnvironment } from "./nova-mock-environment";
import { page } from "@vitest/browser/context";

const triggerMock = vi.fn<(cmd: EntityCommand) => Promise<void>>();
const bubbleMock = vi.fn<(evt: EventWrapper) => Promise<void>>();

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
    triggerMock.mockClear();
    bubbleMock.mockClear();
    environment = createNovaApolloEnvironment(
      schema,
      undefined,
      triggerMock,
      bubbleMock,
    );
  });

  describe("exposed mock APIs", () => {
    it("exposes mocks for commanding", () => {
      const cmd = {} as EntityCommand;
      environment.commanding.trigger(cmd);
      expect(triggerMock).toHaveBeenCalledTimes(1);
      expect(triggerMock).toHaveBeenCalledWith(cmd);
    });

    it("exposes mocks for eventing", () => {
      const event = {} as EventWrapper;
      environment.eventing.bubble(event);
      expect(bubbleMock).toHaveBeenCalledTimes(1);
      expect(bubbleMock).toHaveBeenCalledWith(event);
    });

    it("exposes mocks for GraphQL operations", async () => {
      expect.assertions(2);

      render(
        <NovaMockEnvironmentProvider environment={environment}>
          <QuerySubject />
        </NovaMockEnvironmentProvider>,
      );

      expect(environment.graphql.mock.getAllOperations().length).toEqual(1);

      await vi.waitFor(() =>
        environment.graphql.mock.resolveMostRecentOperation((operation) =>
          ApolloMockPayloadGenerator.generate(operation),
        ),
      );

      const defaultMocked = page.getByText('<mock-value-for-field-"name">');
      await expect.element(defaultMocked).toBeInTheDocument();
    });

    it("exposes a way to customize mocks for a specific operation", async () => {
      render(
        <NovaMockEnvironmentProvider environment={environment}>
          <QuerySubject />
        </NovaMockEnvironmentProvider>,
      );

      expect(environment.graphql.mock.getAllOperations().length).toEqual(1);

      await vi.waitFor(() =>
        environment.graphql.mock.resolveMostRecentOperation((operation) =>
          ApolloMockPayloadGenerator.generate(operation, {
            User: () => ({
              name: "Custom name",
            }),
          }),
        ),
      );

      const customMocked = page.getByText("Custom name");
      await expect.element(customMocked).toBeInTheDocument();
    });
  });

  describe("utilities", () => {
    it("provides a way to get the name of a GraphQL operation", async () => {
      render(
        <NovaMockEnvironmentProvider environment={environment}>
          <QuerySubject />
        </NovaMockEnvironmentProvider>,
      );

      await vi.waitFor(() =>
        expect(environment.graphql.mock.getAllOperations().length).toBe(1),
      );

      expect(
        getApolloOperationName(
          environment.graphql.mock.getMostRecentOperation(),
        ),
      ).toEqual("MockTestQuery");
    });

    it("provides a way to get the GraphQL operation type", async () => {
      render(
        <NovaMockEnvironmentProvider environment={environment}>
          <QuerySubject />
        </NovaMockEnvironmentProvider>,
      );

      // Use the correctly typed variable
      await vi.waitFor(() =>
        expect(environment.graphql.mock.getAllOperations().length).toBe(1),
      );

      expect(
        getApolloOperationType(
          environment.graphql.mock.getMostRecentOperation(),
        ),
      ).toEqual("query");
    });
  });
});
