import { graphql } from "./taggedNode";
import { graphql as mockedImplementation } from "@graphitation/graphql-js-tag";

jest.mock("@graphitation/graphql-js-tag");

describe(graphql, () => {
  it("uses the @graphitation/graphql-js-tag implementation", () => {
    const anotherFragment = {} as any;
    void graphql`some-sdl${anotherFragment}`;
    expect(mockedImplementation).toHaveBeenCalledWith(
      ["some-sdl", ""],
      anotherFragment
    );
  });
});
