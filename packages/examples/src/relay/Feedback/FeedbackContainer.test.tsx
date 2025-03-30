import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { render, screen } from "@testing-library/react";
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
    const texts = await screen.findAllByText("Feedback: Feedback title");
    expect(texts).toHaveLength(3);
    expect(texts[2]).toBeInTheDocument();
  });
});
