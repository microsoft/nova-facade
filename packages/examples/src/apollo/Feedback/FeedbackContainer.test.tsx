import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import type { NovaEventing, EventWrapper } from "@nova/types";

const bubbleMock = jest.fn<NovaEventing, [EventWrapper]>();
const generateEventMock = jest.fn<NovaEventing, [EventWrapper]>();

jest.mock("@nova/react", () => ({
  ...jest.requireActual("@nova/react"),
  useNovaEventing: () => ({
    bubble: bubbleMock,
    generateEvent: generateEventMock,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const { Primary, Liked } = composeStories(stories);

describe("FeedbackContainer", () => {
  it("should correctly propagate parameters even when multiple stories with same resolvers are rendered", async () => {
    render(<Primary />);
    render(<Liked />);
    render(<Primary />);
    const text = "Feedback: Feedback title";
    await waitFor(
      () => {
        const texts = screen.getAllByText(text);
        expect(texts).toHaveLength(3);
      },
      { timeout: 3000 },
    );
    expect(screen.getAllByText(text)[2]).toBeInTheDocument();
  });
});
