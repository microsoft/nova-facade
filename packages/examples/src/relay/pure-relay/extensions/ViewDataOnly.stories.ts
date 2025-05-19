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
import { fn, within, expect, waitFor } from "@storybook/test";
import { type withErrorBoundaryParameters } from "../../../testing-utils/decorators";
import { ViewDataOnly } from "./ViewDataOnly";

type NovaParameters = WithNovaEnvironment<ViewDataOnlyStoryRelayQuery, TypeMap>;

const mockOnError = fn<[Error]>();

const originalConsoleWarn = console.warn;
const consoleWarnMock = fn((...args) => {
  originalConsoleWarn(...args);
});
console.warn = consoleWarnMock;

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
      "Cannot read properties of null (reading 'viewDataField')",
    );
    expect(consoleWarnMock).toHaveBeenCalledWith(
      "The ViewDataOnlyStoryRelayQuery query is a client-only query, which means mock resolvers won't get called. Please select at least one server field in the query to ensure that mock resolvers are called.",
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
