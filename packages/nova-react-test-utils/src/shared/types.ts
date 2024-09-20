import type { StoryObj } from "@storybook/react";
import type { Simplify, RequiredKeysOf } from "type-fest";

type RequiredArgs<T> = T extends { args: infer A }
  ? A extends object
    ? Pick<A, RequiredKeysOf<A>>
    : never
  : never;
type OptionalArgs<T> = T extends { args: infer A }
  ? A extends object
    ? Omit<A, RequiredKeysOf<A>>
    : never
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
