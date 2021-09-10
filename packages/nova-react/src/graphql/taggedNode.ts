import invariant from "invariant";

/**
 * An opaque type used to annotate a GraphQL document.
 */
export type GraphQLTaggedNode = {
  __brand: "GraphQLTaggedNode";
};

/**
 * This tagged template function is used to capture a single GraphQL document, such as an operation or a fragment. When
 * a document refers to fragments, those should be interpolated as trailing components, but *no* other interpolation is
 * allowed. Put differently, the documents themselves should be entirely static, which allows for static optimizations.
 *
 * @example
 *
 ```ts
 const id = 42
 const fooFragment = graphql`
   fragment Foo on Bar {
     # This is BAD interpolation
     foo(id: ${id})
   }
 `
 const fooQuery = graphql`
   query FooQuery {
     ...Foo
   }
    # This is GOOD interpolation
   ${fooFragment}
 `
 ```
 *
 * @note When the host application chooses to provide a GraphQL client that requires graphql-js AST, the host
 *       application is responsible for providing the `@graphitation/graphql-js-tag` package. When the host chooses to
 *       provide a GraphQL client that will compile away these tags, no such responsibility exists.
 *
 * @todo 1613309: Provide a compiler solution that can compile away these tags.
 *
 * @param strings
 */
export function graphql(
  document: TemplateStringsArray,
  ...fragments: GraphQLTaggedNode[]
): GraphQLTaggedNode {
  const graphql: typeof import("@graphitation/graphql-js-tag").graphql =
    require("@graphitation/graphql-js-tag").graphql;
  invariant(
    graphql !== undefined,
    "Expected the host application to provide the `@graphitation/graphql-js-tag` package"
  );
  return graphql(
    document,
    ...(fragments as any[])
  ) as unknown as GraphQLTaggedNode;
}
