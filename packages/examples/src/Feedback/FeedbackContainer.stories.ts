import type { Meta, StoryObj } from "@storybook/react";
import { FeedbackContainer } from "./FeedbackContainer";
import type { NovaEnvironmentDecoratorParameters } from "@nova/react-test-utils";
import { getNovaEnvironmentDecorator } from "@nova/react-test-utils";
import { getSchema } from "../testing-utils/getSchema";
import type { TypeMap } from "../__generated__/schema.all.interface";

const schema = getSchema();

const meta: Meta<typeof FeedbackContainer> = {
  component: FeedbackContainer,
  decorators: [getNovaEnvironmentDecorator(schema)],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story & {
  parameters: NovaEnvironmentDecoratorParameters<TypeMap>;
} = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => ({
          id: "1",
          message: {
            text: "Feedback title",
          },
          doesViewerLike: false,
        }),
      },
    },
  },
};
