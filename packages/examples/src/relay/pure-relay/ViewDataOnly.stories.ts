import type { Meta } from "@storybook/react";
import { getSchema } from "../../testing-utils/getSchema";
import { graphql } from "react-relay";
import {
  getNovaDecorator,
  getNovaEnvironmentForStory,
  type WithNovaEnvironment,
  EventingInterceptor,
  getOperationName,
  getOperationType,
  type StoryObjWithoutFragmentRefs,
} from "@nova/react-test-utils/relay";
import { MockPayloadGenerator } from "relay-test-utils";
import { ViewDataOnly } from "./ViewDataOnly";
import type { TypeMap } from "../../__generated__/schema.all.interface";
import type { ViewDataOnlyStoryRelayQuery } from "./__generated__/ViewDataOnlyStoryRelayQuery.graphql";

const schema = getSchema();

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
  component: ViewDataOnly,
  decorators: [novaDecorator],
  parameters: {
    novaEnvironment: {
      query: graphql`
        query ViewDataOnlyStoryRelayQuery @relay_test_operation {
          viewData {
            ...ViewDataOnly_viewDataFragment
          }
        }
      `,
      referenceEntries: {
        viewData: (data) => data?.viewData,
      },
      resolvers: {
        ViewData: () => ({
          viewDataField: "This is a view data field",
        }),
      },
    },
  } satisfies WithNovaEnvironment<ViewDataOnlyStoryRelayQuery, TypeMap>,
} satisfies Meta<typeof ViewDataOnly>;

export default meta;
type Story = StoryObjWithoutFragmentRefs<typeof meta>;

export const ViewDataOnlyStory: Story = {};

export const ViewDataOnlyWithServerFieldSelected: Story = {
  parameters: {
    novaEnvironment: {
      query: graphql`
        query ViewDataOnlyWithServerFieldSelectedStoryRelayQuery
        @relay_test_operation {
          viewData {
            ...ViewDataOnly_viewDataFragment
          }
          serverField
        }
      `,
    },
  },
};
