import { expect, it, describe } from "vitest";
import { page } from "@vitest/browser/context";
import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import * as React from "react";
import { prepareStoryContextForTest } from "@nova/react-test-utils";
import { render } from "vitest-browser-react";

const { Primary, Liked, LikeFailure } = composeStories(stories);

describe("FeedbackContainer", () => {
  it("should correctly propagate parameters even when multiple stories with same resolvers are rendered", async () => {
    render(<Primary />);
    render(<Liked />);
    render(<Primary />);
    const texts = page.getByText("Feedback: Feedback title");
    expect(texts.elements()).toHaveLength(3);
  });

  // kept in unit tests to ensure prepareStoryContextForTest works correctly
  it("should show an error if the like button fails", async () => {
    const { container } = render(<LikeFailure />);
    await LikeFailure.play?.(prepareStoryContextForTest(LikeFailure, container));
    const error = page.getByText("Something went wrong");
    await expect.element(error).toBeInTheDocument();
  });
});
