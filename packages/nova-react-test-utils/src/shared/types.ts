import type { StoryObj } from "@storybook/react";
import type { Simplify, RequiredKeysOf } from "type-fest";

type RequiredArgs<T> = T extends { args?: infer A }
  ? A extends object
    ? Pick<A, RequiredKeysOf<A>>
    : never
  : never;
type OptionalArgs<T> = T extends { args?: infer A }
  ? A extends object
    ? Omit<A, RequiredKeysOf<A>>
    : never
  : never;

// Omits Z from the Storybook "args" field of T
type OmitFromArgs<T, Z> = Omit<T, "args"> &
  Simplify<
    (Record<string, never> extends Omit<RequiredArgs<T>, keyof Z>
      ? { args?: Omit<RequiredArgs<T>, keyof Z> }
      : { args: Omit<RequiredArgs<T>, keyof Z> }) & {
      args?: Omit<OptionalArgs<T>, keyof Z>;
    },
    { deep: true }
  >;

// Check if keys of T are a subset of keys of P. Returns true if they are or union of keys that are not.
type AreKeysSubset<T extends object, P extends object> = {
  [K in keyof T]: K extends keyof P ? never : K;
}[keyof T] extends never
  ? true
  : {
      [K in keyof T]: K extends keyof P ? never : K;
    }[keyof T];

export type ParametersError =
  "❌ Error: The type passed to StoryObjWithoutFragmentRefs needs to have a parameters field with novaEnvironment with referenceEntries field";

export type ComponentTypeError =
  "❌ Error: The type passed to StoryObjWithoutFragmentRefs needs to have a component field that is a React component";

export type ReferenceEntriesError<K> = `❌ Error: The reference entry '${K &
  string}' is not a property on the component's props`;

export type StoryObjWithoutFragmentRefs<T> = T extends {
  component?: infer C;
  parameters: { novaEnvironment: { referenceEntries: infer D extends object } };
}
  ? C extends React.ComponentType<infer P extends object>
    ? AreKeysSubset<D, P> extends true
      ? OmitFromArgs<StoryObj<T>, D>
      : ReferenceEntriesError<AreKeysSubset<D, P>>
    : ComponentTypeError
  : ParametersError;
