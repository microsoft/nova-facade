import { expect, it, vi, describe, beforeEach } from "vitest";
import { composeStories } from "@storybook/react";
import * as stories from "./Feedback.stories";
import { render } from "vitest-browser-react";
import * as React from "react";
import type { EventWrapper } from "@nova/types";
import { page } from "@vitest/browser/context";

const { Primary } = composeStories(stories);

const bubbleMock = vi.fn<(e: EventWrapper) => void>();
const generateEventMock = vi.fn<(e: EventWrapper) => void>();

vi.mock("@nova/react", async () => {
  const actual = await vi.importActual("@nova/react");
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

describe("Feedback", () => {
  it("rerenders without unmounting", async () => {
    const { rerender } = render(<Primary />);
    let likeButton = page.getByRole("button", { name: "Like" });
    await expect.element(likeButton).toBeInTheDocument();

    let telemetryEvents = generateEventMock.mock.calls.filter(
      ([{ event }]) => event.type === "feedbackTelemetry",
    );

    expect(telemetryEvents).toHaveLength(1); // coming from strict mode

    rerender(<Primary />);

    likeButton = page.getByRole("button", { name: "Like" });
    await expect.element(likeButton).toBeInTheDocument();

    telemetryEvents = generateEventMock.mock.calls.filter(
      ([{ event }]) => event.type === "feedbackTelemetry",
    );
    expect(telemetryEvents).toHaveLength(1); // there are no remounts of the component on Story rerender
  });
});
