/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// the internal imports won't work in Storybook 10, but work fine in v8 and v9
import type { Addon_StoryWrapper } from "storybook/internal/types";
import { makeDecorator } from "storybook/internal/preview-api";
import { gte } from "semver";

// These types are copied from Storybook repo so that we can support v8 and v9 at the same time
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

// end of ported types

export { makeDecorator };

async function getStorybookVersion() {
  try {
    const pkg = await import("storybook/package.json");
    return pkg?.version ?? "8.0.0";
  } catch (e) {
    console.warn(e);
    console.warn(
      "Could not resolve Storybook package.json, falling back to v8.0.0",
    );
    return "8.0.0";
  }
}

export const getAction = async (): Promise<Action> => {
  const version = await getStorybookVersion();

  const storybookActionsPackage = gte(version, "9.0.0")
    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      import(/* @vite-ignore */ "storybook/actions")
    : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      import(/* @vite-ignore */ "@storybook/addon-actions");

  return storybookActionsPackage.then((m) => m.action) as Promise<Action>;
};
