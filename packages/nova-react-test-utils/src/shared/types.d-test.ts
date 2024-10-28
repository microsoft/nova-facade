/* eslint-disable @typescript-eslint/no-unused-vars */

type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;

import type { StoryObj, Meta } from "@storybook/react";
import type {
  ComponentTypeError,
  ParametersError,
  ReferenceEntriesError,
  StoryObjWithoutFragmentRefs,
} from "./types";
import type {
  UnknownOperation,
  WithNovaEnvironment,
} from "./storybook-nova-decorator-shared";

type Props = {
  propPassedThroughDecorator: unknown;
  requiredProp: string;
  optionalProp?: string;
};

type OptionalProps = {
  propPassedThroughDecorator: unknown;
  optionalProp?: string;
};

type OptionalPropsOnly = {
  propPassedThroughDecorator?: unknown;
  optionalProp?: string;
};

type MultiplePropsFromDecorator = {
  propPassedThroughDecorator: unknown;
  anotherPropPassedThroughDecorator: unknown;
};

const Component: React.FC<Props> = (_: Props) => null;

const ComponentWithOptionalProps: React.FC<OptionalProps> = (
  _: OptionalProps,
) => null;

const ComponentWithOptionalPropsOnly: React.FC<OptionalPropsOnly> = (
  _: OptionalPropsOnly,
) => null;

const ComponentWithMultiplePropsFromDecorator: React.FC<
  MultiplePropsFromDecorator
> = (_: MultiplePropsFromDecorator) => null;

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

const parametersWithMultiplePropsCorrect = {
  novaEnvironment: {
    query: {
      __brand: "GraphQLTaggedNode" as const,
    },
    referenceEntries: {
      propPassedThroughDecorator: (data) => data,
      anotherPropPassedThroughDecorator: (data) => data,
    },
  },
} satisfies WithNovaEnvironment<UnknownOperation>;

const parametersWithMultiplePropsWithRefEntryTypo = {
  novaEnvironment: {
    query: {
      __brand: "GraphQLTaggedNode" as const,
    },
    referenceEntries: {
      propPassedThroughDecorator: (data) => data,
      anothPropPassedThroughDecorator: (data) => data,
      someRandomProp: (data) => data,
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

const metaForComponentWithOptionalProps = {
  component: ComponentWithOptionalProps,
  parameters,
} satisfies Meta<typeof ComponentWithOptionalProps>;

const metaForComponentWithOptionalPropsOnly = {
  component: ComponentWithOptionalPropsOnly,
  parameters,
} satisfies Meta<typeof ComponentWithOptionalPropsOnly>;

const metaWithoutComponent = {
  parameters,
} satisfies Meta<typeof ComponentWithOptionalPropsOnly>;

const metaForMultiplePropsFromDecorator = {
  component: ComponentWithMultiplePropsFromDecorator,
  parameters: parametersWithMultiplePropsCorrect,
} satisfies Meta<typeof ComponentWithMultiplePropsFromDecorator>;

const metaWithIncorrectRefEntry = {
  component: ComponentWithMultiplePropsFromDecorator,
  parameters: parametersWithMultiplePropsWithRefEntryTypo,
} satisfies Meta<typeof ComponentWithMultiplePropsFromDecorator>;

type StoryObjForMeta = StoryObj<typeof meta>;
type StoryObjWithoutFragmentRefsForMeta = StoryObjWithoutFragmentRefs<
  typeof meta
>;

type PlayFunctionContextForOptionalProps = Parameters<
  NonNullable<
    StoryObjWithoutFragmentRefs<
      typeof metaForComponentWithOptionalProps
    >["play"]
  >
>[number]["args"];

type PlatFunctionArgs = Expect<
  Equal<
    {
      propPassedThroughDecorator: unknown;
      optionalProp?: string;
    },
    PlayFunctionContextForOptionalProps
  >
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

const StoryForComponentWithOptionalPropsOnly: StoryObjWithoutFragmentRefs<
  typeof metaForComponentWithOptionalPropsOnly
> = {
  args: {
    optionalProp: "optional",
  },
};

const StoryForComponentWithMultiplePropsFromDecorator: StoryObjWithoutFragmentRefs<
  typeof metaForMultiplePropsFromDecorator
> = {};

type WithoutDecoratorParamsItShouldBeParametersError = Expect<
  Equal<
    ParametersError,
    StoryObjWithoutFragmentRefs<typeof metaWithoutDecoratorParams>
  >
>;

type WithoutComponentItShouldBeComponentError = Expect<
  Equal<
    ComponentTypeError,
    StoryObjWithoutFragmentRefs<typeof metaWithoutComponent>
  >
>;

type WithTypoInRefEntryItShouldBeReferenceEntriesError = Expect<
  Equal<
    ReferenceEntriesError<"anothPropPassedThroughDecorator" | "someRandomProp">,
    StoryObjWithoutFragmentRefs<typeof metaWithIncorrectRefEntry>
  >
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

type VerifyArgsTypeWhenComponentHasRequiredPropsOnly = Expect<
  Equal<
    StoryObjWithoutFragmentRefs<
      typeof metaForComponentWithOptionalPropsOnly
    >["args"],
    { optionalProp?: string } | undefined
  >
>;
