import type { StoryObj } from "@storybook/react";
import type { Simplify, RequiredKeysOf } from "type-fest";

/**
 * Utility type to extract the props of a React component.
 */
export type Props<Component> =
  Component extends React.ComponentType<infer P> ? P : never;

/**
 * Utility type to return the keys of a component's props, where the value of the key is an object containing an optional " $data" property.
 * This is typically used to identify GraphQL fragment reference properties.
 */
export type FragmentKeys<Component> =
  Props<Component> extends infer P
    ? Required<{
        [K in keyof P]: P[K] extends { " $data"?: unknown } ? K : never;
      }>[keyof P]
    : never;

/**
 * Utility type to get the data type of a fragment reference from a React component.
 */
export type FragmentDataType<
  Component,
  K extends FragmentKeys<Component>,
> = Props<Component>[K] extends {
  " $data"?: infer D extends { " $fragmentType": unknown };
}
  ? Omit<D, " $fragmentType">
  : never;

/**
 * Utility type to get the fragment key type from a React component.
 */
export type FragmentKeyType<
  Component,
  K extends FragmentKeys<Component>,
> = Props<Component>[K] extends {
  readonly " $fragmentSpreads": unknown;
}
  ? Props<Component>[K]
  : never;

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

/**
 * Type for validated reference entries when a component type is provided
 */
export type ValidatedReferenceEntries<
  TComponent,
  TQuery extends { response: unknown },
> =
  TComponent extends React.ComponentType<any>
    ? FragmentKeys<TComponent> extends never
      ? Record<string, (queryResult: TQuery["response"]) => unknown>
      : // Fragment keys must have correct type, other keys can be anything
        Simplify<{
          [K in FragmentKeys<TComponent>]: (
            queryResult: TQuery["response"],
          ) => FragmentKeyType<TComponent, K> | null | undefined;
        } & {
          [K in Exclude<string, FragmentKeys<TComponent>>]?: (
            queryResult: TQuery["response"],
          ) => unknown;
        }>
    : Record<string, (queryResult: TQuery["response"]) => unknown>;

export type StoryObjWithoutFragmentRefs<T> = T extends {
  component?: infer C;
  parameters: {
    novaEnvironment: {
      referenceEntries: infer D extends object;
    };
  };
}
  ? C extends React.ComponentType<infer P extends object>
    ? AreKeysSubset<D, P> extends true
      ? OmitFromArgs<StoryObj<T>, D>
      : ReferenceEntriesError<AreKeysSubset<D, P>>
    : ComponentTypeError
  : ParametersError;
