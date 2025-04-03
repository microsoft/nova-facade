import type { Meta } from "@storybook/react";
import { graphql } from "react-relay";
import {
  getNovaDecorator,
  type WithNovaEnvironment,
  type StoryObjWithoutFragmentRefs,
} from "@nova/react-test-utils/relay";
import { MockPayloadGenerator } from "relay-test-utils";
import { ServerWithExtension } from "./ServerWithExtension";
import type { TypeMap } from "../../../__generated__/schema.all.interface";
import type { ServerWithExtensionStoryRelayQuery } from "./__generated__/ServerWithExtensionStoryRelayQuery.graphql";
import { within, expect } from "@storybook/test";
import { schema } from "../../../testing-utils/schema";


const novaDecorator = getNovaDecorator(schema, {
  generateFunction: (operation, mockResolvers) => {
    const result = MockPayloadGenerator.generate(
      operation,
      mockResolvers ?? null,
      {
        mockClientData: true,
      },
    );

    return result;
  },
});

const meta = {
  component: ServerWithExtension,
  decorators: [novaDecorator],
  parameters: {
    novaEnvironment: {
      query: graphql`
        query ServerWithExtensionStoryRelayQuery @relay_test_operation {
          serverObjectWithClientExtension {
            ...ServerWithExtension_dataFragment
          }
        }
      `,
      referenceEntries: {
        data: (data) => data?.serverObjectWithClientExtension,
      },
      resolvers: {
        ServerObjectWithClientExtension: () => ({
          clientExtension: "This is a client extension field",
        }),
      },
    },
  } satisfies WithNovaEnvironment<ServerWithExtensionStoryRelayQuery, TypeMap>,
} satisfies Meta<typeof ServerWithExtension>;

export default meta;
type Story = StoryObjWithoutFragmentRefs<typeof meta>;

export const ServerObjectWithClientExtension: Story = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        ServerObjectWithClientExtension: () => ({
          clientExtension: "This is a custom client extension value",
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      await canvas.findByText(/This is a custom client extension value/i),
    ).toBeInTheDocument();
  },
};
