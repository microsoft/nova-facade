import { graphql } from "react-relay";
import {
  getNovaDecorator,
  type WithNovaEnvironment,
  type StoryObjWithoutFragmentRefs,
} from "@nova/react-test-utils/relay";
import type { Meta } from "@storybook/react";
import { within, expect } from "@storybook/test";
import { schema } from "../../../testing-utils/schema";
import type { TypeMap } from "../../../__generated__/schema.all.interface";
import { SuggestedFriendsComponent } from "./SuggestedFriends";
import type { SuggestedFriendsStoryQuery } from "./__generated__/SuggestedFriendsStoryQuery.graphql";

type NovaParameters = WithNovaEnvironment<SuggestedFriendsStoryQuery, TypeMap>;

const novaDecorator = getNovaDecorator(schema, {
  getEnvironmentOptions: () => ({
    storeOptions: {},
  }),
});

const meta = {
  component: SuggestedFriendsComponent,
  decorators: [novaDecorator],
  parameters: {
    novaEnvironment: {
      query: graphql`
        query SuggestedFriendsStoryQuery @relay_test_operation {
          viewer {
            ...SuggestedFriends_suggestedFriendsFragment
          }
        }
      `,
      referenceEntries: {
        viewer: (data) => data?.viewer,
      },
      resolvers: {
        Viewer: () => ({
          suggestedFriends: [
            {
              id: "friend-1",
              name: {
                firstName: "Alice",
                lastName: "Johnson",
              },
            },
            {
              id: "friend-2", 
              name: {
                firstName: "Bob",
                lastName: "Smith",
              },
            },
            {
              id: "friend-3",
              name: {
                firstName: "Carol",
                lastName: "Williams",
              },
            },
          ],
        }),
      },
    },
  } satisfies NovaParameters,
} satisfies Meta<typeof SuggestedFriendsComponent>;

export default meta;
type Story = StoryObjWithoutFragmentRefs<typeof meta>;


export const WithDefaultFriends: Story = {
  play: async (context) => {
    const container = within(context.canvasElement);
    // Verify that custom names from resolvers come through
    await container.findByText("Alice Johnson");
    await container.findByText("Bob Smith");
    await container.findByText("Carol Williams");
  }
};

export const EmptyState: Story = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Viewer: () => ({
          suggestedFriends: [],
        }),
      },
    },
  } satisfies NovaParameters,
  play: async (context) => {
    const container = within(context.canvasElement);
    await container.findByText("No suggested friends available.");
  }
};

export const WithManyFriends: Story = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Viewer: () => ({
          suggestedFriends: Array.from({ length: 10 }, (_, i) => ({
            id: `friend-${i + 1}`,
            name: {
              firstName: `Friend${i + 1}`,
              lastName: `TestUser${i + 1}`,
            },
          })),
        }),
      },
    },
  } satisfies NovaParameters,
  play: async (context) => {
    const container = within(context.canvasElement);
    // Verify we have 10 friends
    await container.findByText("Friend1 TestUser1");
    await container.findByText("Friend10 TestUser10");
    
    // Count the list items
    const listItems = container.getAllByRole("listitem");
    expect(listItems).toHaveLength(10);
  }
};
