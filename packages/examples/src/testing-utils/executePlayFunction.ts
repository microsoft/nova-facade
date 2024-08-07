import type { ReactRenderer } from "@storybook/react";
import type {
  ComposedStoryPlayContext,
  ComposedStoryFn,
} from "@storybook/types";
import { act, waitFor } from "@testing-library/react";

type PlayFunctionThatReturnsPromise = (
  options: ComposedStoryPlayContext<ReactRenderer>,
) => Promise<void>;

// This function is a workaround for the issues with React 18 that if someone
// tries to call `play` function from act like:
// await act(async () => {
//   await Story.play({ canvasElement: container });
// });
// it will fail by never rerendering the component causing any assertions in play
// function to fail. To mitigate that we mimic awaiting by adding a flag that will
// be set to true once the play function is completed and we wait for that flag to
// be true.
export const executePlayFunction = async (
  Story: ComposedStoryFn<ReactRenderer>,
  options: ComposedStoryPlayContext<ReactRenderer>,
) => {
  let playFunctionCompleted = false;
  const playFunction = Story.play as PlayFunctionThatReturnsPromise;
  act(() => {
    playFunction(options)
      .then(() => {
        playFunctionCompleted = true;
      })
      .catch((error) => {
        throw error;
      });
  });
  await waitFor(() => {
    expect(playFunctionCompleted).toBe(true);
  });
};
