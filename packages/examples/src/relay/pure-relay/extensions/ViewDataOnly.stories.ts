import type { Meta } from "@storybook/react";
import { schema } from "../../../testing-utils/schema";
import { graphql } from "react-relay";
import {
  getNovaDecorator,
  type WithNovaEnvironment,
  type StoryObjWithoutFragmentRefs,
} from "@nova/react-test-utils/relay";
import { MockPayloadGenerator } from "relay-test-utils";
import type { TypeMap } from "../../../__generated__/schema.all.interface";
import type { ViewDataOnlyStoryRelayQuery } from "./__generated__/ViewDataOnlyStoryRelayQuery.graphql";
import { ViewDataOnly } from "./ViewDataOnly";

type NovaParameters = WithNovaEnvironment<ViewDataOnlyStoryRelayQuery, TypeMap>;

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
  } satisfies NovaParameters,
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
      referenceEntries: {
        viewData: (data) => data?.viewData,
      },
    },
  } satisfies NovaParameters,
};
