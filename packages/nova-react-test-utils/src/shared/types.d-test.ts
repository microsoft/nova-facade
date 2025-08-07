/* eslint-disable @typescript-eslint/no-unused-vars */

type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
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

// ==========================================
// Tests for Enhanced referenceEntries validation
// ==========================================

import type {
  ValidatedReferenceEntries,
  FragmentKeys,
  FragmentKeyType,
} from "./types";
import type { OperationType } from "relay-runtime";

// Mock component types for fragment validation testing
interface MockFragmentKey {
  readonly " $fragmentSpreads": Record<string, boolean>;
}

interface PropsWithFragments {
  feedback: MockFragmentKey;
  user: MockFragmentKey;
  regularProp: string;
  optionalProp?: number;
}

interface MockQuery extends OperationType {
  variables: Record<string, unknown>;
  response: {
    feedback: { id: string; message: string };
    user: { id: string; name: string };
    otherData: unknown;
  };
}

declare const ComponentWithFragments: React.FC<PropsWithFragments>;

// Test FragmentKeys extraction - should extract keys with " $data" property
type ExtractedFragmentKeys = FragmentKeys<typeof ComponentWithFragments>;
// Note: FragmentKeys only finds props with " $data" property, not " $fragmentSpreads"
// So this test should expect 'never' since our mock doesn't have " $data"
type TestFragmentKeysExtraction = Expect<Equal<ExtractedFragmentKeys, never>>;

// Create a proper fragment type for testing
interface PropsWithRealFragments {
  feedback: { " $data"?: { id: string }; readonly " $fragmentSpreads": Record<string, boolean> };
  user: { " $data"?: { name: string }; readonly " $fragmentSpreads": Record<string, boolean> };
  regularProp: string;
  optionalProp?: number;
}

declare const ComponentWithRealFragments: React.FC<PropsWithRealFragments>;

type RealFragmentKeys = FragmentKeys<typeof ComponentWithRealFragments>;
type TestRealFragmentKeys = Expect<Equal<RealFragmentKeys, "feedback" | "user">>;

// Test FragmentKeyType extraction
type FeedbackFragmentType = FragmentKeyType<
  typeof ComponentWithRealFragments,
  "feedback"
>;
type TestFragmentKeyType = Expect<
  Equal<
    FeedbackFragmentType,
    { " $data"?: { id: string }; readonly " $fragmentSpreads": Record<string, boolean> }
  >
>;

// Test ValidatedReferenceEntries with component that has fragments
type ValidatedEntriesWithFragments = ValidatedReferenceEntries<
  typeof ComponentWithRealFragments,
  MockQuery
>;

const validFragmentReferenceEntries: ValidatedEntriesWithFragments = {
  feedback: (data) => ({ " $data": undefined, " $fragmentSpreads": {} }),
  user: (data) => ({ " $data": undefined, " $fragmentSpreads": {} }),
  // Non-fragment keys can return anything
  someOtherKey: (data) => "anything",
};

// Test: Fragment keys can return null/undefined
const nullableFragmentReferenceEntries: ValidatedEntriesWithFragments = {
  feedback: (data) => null,
  user: (data) => undefined,
};

// Test component without fragments
interface PropsWithoutFragments {
  title: string;
  count: number;
}

declare const ComponentWithoutFragments: React.FC<PropsWithoutFragments>;

type ValidatedEntriesNoFragments = ValidatedReferenceEntries<
  typeof ComponentWithoutFragments,
  MockQuery
>;

// Should allow any return types when no fragments exist
const noFragmentsEntries: ValidatedEntriesNoFragments = {
  anyKey: (data) => "anything",
  anotherKey: (data) => 42,
  yetAnother: (data) => ({ some: "object" }),
};

// Test WithNovaEnvironment with third parameter (component type)
type NovaParametersWithComponent = WithNovaEnvironment<
  MockQuery,
  Record<string, unknown>,
  typeof ComponentWithRealFragments
>;

const parametersWithFragmentValidation: NovaParametersWithComponent = {
  novaEnvironment: {
    query: { __brand: "GraphQLTaggedNode" as const },
    variables: { id: "42" },
    referenceEntries: {
      feedback: (data) => ({ " $data": undefined, " $fragmentSpreads": {} }),
      user: (data) => ({ " $data": undefined, " $fragmentSpreads": {} }),
    },
  },
};

// Test backward compatibility - WithNovaEnvironment without third parameter
type BackwardCompatibleParameters = WithNovaEnvironment<MockQuery, Record<string, unknown>>;

const backwardCompatibleParams: BackwardCompatibleParameters = {
  novaEnvironment: {
    query: { __brand: "GraphQLTaggedNode" as const },
    variables: { id: "42" },
    referenceEntries: {
      anyKey: (data: MockQuery["response"]) => "anything", // Should work without validation
    },
  },
};

// Test edge case: Component with no fragment keys
interface PropsWithOnlyRegularProps {
  title: string;
  description?: string;
}

declare const ComponentWithNoFragments: React.FC<PropsWithOnlyRegularProps>;

type NoFragmentKeys = FragmentKeys<typeof ComponentWithNoFragments>;
type TestNoFragmentKeys = Expect<Equal<NoFragmentKeys, never>>;

type ValidatedEntriesForNoFragments = ValidatedReferenceEntries<
  typeof ComponentWithNoFragments,
  MockQuery
>;

// Should fallback to Record<string, ...> when no fragments exist
const entriesForNoFragments: ValidatedEntriesForNoFragments = {
  anyKey: (data) => "anything",
  anotherKey: (data) => 42,
};

// Test: Incorrect reference entry data should cause type errors
// These should all fail compilation due to incorrect return types

// This should fail: feedback returns string instead of fragment key type
const shouldFailWithWrongFeedbackType: ValidatedEntriesWithFragments = {
  // @ts-expect-error - feedback should return fragment key type, not string
  feedback: (data) => "this should fail",
  user: (data) => ({ " $data": undefined, " $fragmentSpreads": {} }),
};

// This should fail: user returns number instead of fragment key type  
const shouldFailWithWrongUserType: ValidatedEntriesWithFragments = {
  feedback: (data) => ({ " $data": undefined, " $fragmentSpreads": {} }),
  // @ts-expect-error - user should return fragment key type, not number
  user: (data) => 42,
};

// This should fail: both return wrong types
const shouldFailWithAllWrongTypes: ValidatedEntriesWithFragments = {
  // @ts-expect-error - feedback should return fragment key type, not string
  feedback: (data) => "wrong",
  // @ts-expect-error - user should return fragment key type, not number
  user: (data) => 123,
};
