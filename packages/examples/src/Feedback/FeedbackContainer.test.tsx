import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";

const { Primary, Liked, Like, LikeFailure, Loading } = composeStories(stories);

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

  it("should show an error if the like button fails", async () => {
    const { container } = render(<LikeFailure />);
    // When it becomes available we should rely on id, instead of name:
    // https://github.com/storybookjs/storybook/pull/22471
    await LikeFailure.play({ canvasElement: container, name: "Like failure" });
    const error = await screen.findByText("Something went wrong");
    expect(error).toBeInTheDocument();
  });

  it("should show loading state", async () => {
    render(<Loading />);
    const loading = await screen.findByText("Loading...");
    expect(loading).toBeInTheDocument();
  });
});
