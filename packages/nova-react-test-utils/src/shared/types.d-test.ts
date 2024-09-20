/* eslint-disable @typescript-eslint/no-unused-vars */

type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;

import type { StoryObj, Meta } from "@storybook/react";
import type { StoryObjWithoutFragmentRefs } from "./types";
import type {
  UnknownOperation,
  WithNovaEnvironment,
} from "./storybook-nova-decorator-shared";

type Props = {
  propPassedThroughDecorator: unknown;
  requiredProp: string;
  optionalProp?: string;
};
const Component: React.FC<Props> = (_: Props) => null;

const parameters = {
  novaEnvironment: {
    query: {
      __brand: "GraphQLTaggedNode" as const,
    },
    referenceEntries: {
      propPassedThroughDecorator: (data) => data,
    },
  },
} satisfies WithNovaEnvironment<UnknownOperation>;

const meta = {
  component: Component,
  parameters,
} satisfies Meta<typeof Component>;

const metaWithArgs = {
  component: Component,
  parameters,
  args: {
    requiredProp: "required",
  },
} satisfies Meta<typeof Component>;

const metaWithoutDecoratorParams = {
  component: Component,
  args: {
    requiredProp: "required",
  },
} satisfies Meta<typeof Component>;

type StoryObjForMeta = StoryObj<typeof meta>;
type StoryObjWithoutFragmentRefsForMeta = StoryObjWithoutFragmentRefs<
  typeof meta
>;

// @ts-expect-error - it should expect args that have requiredProp on it
const StoryWithoutArgs: StoryObjWithoutFragmentRefsForMeta = {};

const StoryWithArgs: StoryObjWithoutFragmentRefsForMeta = {
  args: {
    requiredProp: "required",
  },
};

const StoryWithoutArgsForMetaWithArgs: StoryObjWithoutFragmentRefs<
  typeof metaWithArgs
> = {};

type WithoutDecoratorParamsItShouldBeNever = Expect<
  Equal<never, StoryObjWithoutFragmentRefs<typeof metaWithoutDecoratorParams>>
>;

type VerifyTypeMatchesWithNoArgsOnMeta = Expect<
  Equal<
    Omit<StoryObjForMeta, "args">,
    Omit<StoryObjWithoutFragmentRefsForMeta, "args">
  >
>;

type VerifyTypeMatchesWithArgsOnMeta = Expect<
  Equal<
    Omit<StoryObj<typeof metaWithArgs>, "args">,
    Omit<StoryObjWithoutFragmentRefs<typeof metaWithArgs>, "args">
  >
>;

type VerifyTypeContainsRequiredPropAndDoesntContainOneFromReferenceEntries =
  Expect<
    Equal<
      StoryObjWithoutFragmentRefsForMeta["args"],
      { requiredProp: string; optionalProp?: string }
    >
  >;
