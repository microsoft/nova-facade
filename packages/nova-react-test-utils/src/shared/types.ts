import type { StoryObj } from "@storybook/react";
import type { Simplify } from "type-fest";

type RequiredProps<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K;
}[keyof T];

type RequiredArgs<T> = T extends { args: infer A }
  ? Pick<A, RequiredProps<A>>
  : never;
type OptionalArgs<T> = T extends { args: infer A }
  ? Omit<A, RequiredProps<A>>
  : never;

type OmitFromArgs<T, Z> = Omit<T, "args"> &
  Simplify<
    (Record<string, never> extends Omit<RequiredArgs<T>, keyof Z>
      ? { args?: Omit<RequiredArgs<T>, keyof Z> }
      : { args: Omit<RequiredArgs<T>, keyof Z> }) & {
      args?: Omit<OptionalArgs<T>, keyof Z>;
    },
    { deep: true }
  >;

export type StoryObjWithoutFragmentRefs<T> = T extends {
  component: infer C;
  parameters: { novaEnvironment: { referenceEntries: infer D } };
}
  ? C extends React.ComponentType<any>
    ? OmitFromArgs<StoryObj<T>, D>
    : never
  : never;
