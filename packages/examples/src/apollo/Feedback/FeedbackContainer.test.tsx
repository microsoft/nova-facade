import { expect, it, vi, describe, beforeEach } from "vitest";
import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import * as React from "react";
import type { EventWrapper } from "@nova/types";
import { prepareStoryContextForTest } from "@nova/react-test-utils/apollo";
import type * as NovaReact from "@nova/react";
import { render } from "vitest-browser-react";
import { page } from "@vitest/browser/context";

const bubbleMock = vi.fn<(e: EventWrapper) => void>();
const generateEventMock = vi.fn<(e: EventWrapper) => void>();

vi.mock("@nova/react", async () => {
  const actual = await vi.importActual<typeof NovaReact>("@nova/react");
  return {
    ...actual,
    useNovaEventing: () => ({
      bubble: bubbleMock,
      generateEvent: generateEventMock,
    }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const { Primary, Liked, LikeFailure } = composeStories(stories);

describe("FeedbackContainer", () => {
  it("should correctly propagate parameters even when multiple stories with same resolvers are rendered", async () => {
    render(<Primary />);
    render(<Liked />);
    render(<Primary />);
    const text = "Feedback: Feedback title";
    await vi.waitFor(
      () => {
        const texts = page.getByText(text);
        expect(texts.elements()).toHaveLength(3);
      },
      { timeout: 3000 },
    );
  });

  // kept in unit test to ensure prepareStoryContextForTest works correctly
  it("should show an error if the like button fails", async () => {
    const { container } = render(<LikeFailure />);

    await LikeFailure.play?.(
      prepareStoryContextForTest(LikeFailure, container),
    );
    const error = page.getByText("Something went wrong");
    await expect.element(error).toBeInTheDocument();
  });
});
