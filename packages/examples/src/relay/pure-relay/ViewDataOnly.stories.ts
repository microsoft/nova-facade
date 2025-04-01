import type { Meta } from "@storybook/react";
import { schema } from "../../testing-utils/schema";
import { graphql } from "react-relay";
import {
  getNovaDecorator,
  type WithNovaEnvironment,
  type StoryObjWithoutFragmentRefs,
} from "@nova/react-test-utils/relay";
import { MockPayloadGenerator } from "relay-test-utils";
import { ViewDataOnly } from "./ViewDataOnly";
import type { TypeMap } from "../../__generated__/schema.all.interface";
import type { ViewDataOnlyStoryRelayQuery } from "./__generated__/ViewDataOnlyStoryRelayQuery.graphql";
import { fn, within, expect, waitFor } from "@storybook/test";
import { type withErrorBoundaryParameters } from "../../testing-utils/deorators";

type NovaParameters = WithNovaEnvironment<ViewDataOnlyStoryRelayQuery, TypeMap>;

const mockOnError = fn<[Error]>();

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

export const ViewDataOnlyStory: Story = {
  parameters: {
    errorBoundary: {
      onError: mockOnError,
    },
  } satisfies withErrorBoundaryParameters,
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await canvas.findByText("Error in story!");

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });
    const call = mockOnError.mock.calls[0];
    expect(call[0].message).toBe(
      "Client only queries are not supported in nova-react-test-utils, please add at least a single server field, otherwise mock resolvers won't be called. Addtionally if you want to test any queries with client extension, please use relay based payload generator over default one, as the default still doesn't support client extension. Check https://github.com/microsoft/nova-facade/tree/main/packages/nova-react-test-utils#pure-relay-or-nova-with-relay-how-can-i-make-sure-the-mock-data-is-generated-for-client-extensions",
    );
  },
};

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
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await canvas.findByText("This is a view data field");
  },
};
