import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";

const { Primary, Liked, Like } = composeStories(stories);

describe("FeedbackContainer", () => {
  it("should show like button", async () => {
    render(<Primary />);
    const button = await screen.findByRole("button", { name: "Like" });
    expect(button).toBeInTheDocument();
  });

  it("should show unlike button", async () => {
    render(<Liked />);
    const button = await screen.findByRole("button", { name: "Unlike" });
    expect(button).toBeInTheDocument();
  });

  it("should show unlike button after clicking like button", async () => {
    const { container } = render(<Like />);
    await Like.play({ canvasElement: container });
    const button = await screen.findByRole("button", { name: "Unlike" });
    expect(button).toBeInTheDocument();
  });
});
