// TODO: migrate away from storybook/internal imports before Storybook 10
import type { Addon_StoryWrapper } from "storybook/internal/types";
import { makeDecorator } from "storybook/internal/preview-api";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { action } from "storybook/actions";

// These types are copied from Storybook repo so that we can use makeDecorator with proper typing
export type MakeDecoratorResult = (...args: any) => any;

export interface MakeDecoratorOptions {
  name: string;
  parameterName: string;
  skipIfNoParametersOrOptions?: boolean;
  wrapper: Addon_StoryWrapper;
}

export type MakeDecorator = (
  options: MakeDecoratorOptions,
) => MakeDecoratorResult;

type HandlerFunction = (...args: any[]) => void;

export type Action = (name: string) => HandlerFunction;

export { makeDecorator, action };
