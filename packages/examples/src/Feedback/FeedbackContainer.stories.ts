import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import { FeedbackContainer } from "./FeedbackContainer";
import type { NovaEnvironmentDecoratorParameters } from "@nova/react-test-utils";
import {
  getEnvForStory,
  getNovaEnvironmentDecorator,
  MockPayloadGenerator,
} from "@nova/react-test-utils";
import { getSchema } from "../testing-utils/getSchema";
import type { TypeMap } from "../__generated__/schema.all.interface";

const schema = getSchema();

const meta: Meta<typeof FeedbackContainer> = {
  component: FeedbackContainer,
  decorators: [getNovaEnvironmentDecorator(schema)],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => sampleFeedback,
      },
    },
  } satisfies NovaEnvironmentDecoratorParameters<TypeMap>,
};

export const Liked: Story = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => ({
          ...sampleFeedback,
          doesViewerLike: true,
        }),
      },
    },
  } satisfies NovaEnvironmentDecoratorParameters<TypeMap>,
};

export const Like: Story = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => sampleFeedback,
        FeedbackLikeMutationResult: () => ({
          feedback: {
            ...sampleFeedback,
            doesViewerLike: true,
          },
        }),
      },
    },
  } satisfies NovaEnvironmentDecoratorParameters<TypeMap>,
  play: async ({ canvasElement }) => {
    const container = within(canvasElement);
    const likeButton = await container.findByRole("button", { name: "Like" });
    userEvent.click(likeButton);
  },
};

export const LikeFailure: Story = {
  parameters: {
    novaEnvironment: {
      enableQueuedMockResolvers: false,
    },
  } satisfies NovaEnvironmentDecoratorParameters<TypeMap>,
  play: async (context) => {
    const {
      graphql: { mock },
    } = getEnvForStory(context.id);

    // wait for next tick for apollo client to update state
    await new Promise((resolve) => setTimeout(resolve, 0));
    await mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        Feedback: () => sampleFeedback,
      }),
    );
    await Like.play?.(context);
    mock.rejectMostRecentOperation(new Error("Like failed"));
  },
};

export const Loading: Story = {
  parameters: {
    novaEnvironment: {
      enableQueuedMockResolvers: false,
    },
  } satisfies NovaEnvironmentDecoratorParameters<TypeMap>,
};

const sampleFeedback = {
  id: "42",
  message: {
    text: "Feedback title",
  },
  doesViewerLike: false,
};
