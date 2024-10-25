// THIS FILE WAS AUTOMATICALLY GENERATED AND SHOULD NOT BE EDITED
import type { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Feedback = {
  __typename?: 'Feedback';
  doesViewerLike: Scalars['Boolean'];
  id: Scalars['ID'];
  message: Message;
};

export type FeedbackLikeInput = {
  doesViewerLike: Scalars['Boolean'];
  feedbackId: Scalars['ID'];
};

export type FeedbackLikeMutationResult = {
  __typename?: 'FeedbackLikeMutationResult';
  feedback: Feedback;
};

export type Message = {
  __typename?: 'Message';
  text: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  feedbackLike: FeedbackLikeMutationResult;
};


export type MutationFeedbackLikeArgs = {
  input: FeedbackLikeInput;
};

export type Query = {
  __typename?: 'Query';
  clientExtension: Maybe<Scalars['String']>;
  feedback: Feedback;
  viewData: Maybe<ViewData>;
};


export type QueryFeedbackArgs = {
  id: Scalars['ID'];
};

export type ViewData = {
  __typename?: 'ViewData';
  viewDataField: Maybe<Scalars['String']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Feedback: ResolverTypeWrapper<Feedback>;
  FeedbackLikeInput: FeedbackLikeInput;
  FeedbackLikeMutationResult: ResolverTypeWrapper<FeedbackLikeMutationResult>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Message: ResolverTypeWrapper<Message>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  ViewData: ResolverTypeWrapper<ViewData>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  Feedback: Feedback;
  FeedbackLikeInput: FeedbackLikeInput;
  FeedbackLikeMutationResult: FeedbackLikeMutationResult;
  ID: Scalars['ID'];
  Message: Message;
  Mutation: {};
  Query: {};
  String: Scalars['String'];
  ViewData: ViewData;
};

export type FeedbackResolvers<ContextType = any, ParentType = ResolversParentTypes['Feedback']> = {
  doesViewerLike: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  message: Resolver<ResolversTypes['Message'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedbackLikeMutationResultResolvers<ContextType = any, ParentType = ResolversParentTypes['FeedbackLikeMutationResult']> = {
  feedback: Resolver<ResolversTypes['Feedback'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageResolvers<ContextType = any, ParentType = ResolversParentTypes['Message']> = {
  text: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType = ResolversParentTypes['Mutation']> = {
  feedbackLike: Resolver<ResolversTypes['FeedbackLikeMutationResult'], ParentType, ContextType, RequireFields<MutationFeedbackLikeArgs, 'input'>>;
};

export type QueryResolvers<ContextType = any, ParentType = ResolversParentTypes['Query']> = {
  clientExtension: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  feedback: Resolver<ResolversTypes['Feedback'], ParentType, ContextType, RequireFields<QueryFeedbackArgs, 'id'>>;
  viewData: Resolver<Maybe<ResolversTypes['ViewData']>, ParentType, ContextType>;
};

export type ViewDataResolvers<ContextType = any, ParentType = ResolversParentTypes['ViewData']> = {
  viewDataField: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Feedback: FeedbackResolvers<ContextType>;
  FeedbackLikeMutationResult: FeedbackLikeMutationResultResolvers<ContextType>;
  Message: MessageResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  ViewData: ViewDataResolvers<ContextType>;
};


export type TypeMap = {
  "Boolean": Scalars["Boolean"];
  "Feedback": Feedback;
  "FeedbackLikeInput": FeedbackLikeInput;
  "FeedbackLikeMutationResult": FeedbackLikeMutationResult;
  "ID": Scalars["ID"];
  "Message": Message;
  "Mutation": Mutation;
  "Query": Query;
  "String": Scalars["String"];
  "ViewData": ViewData;
};
